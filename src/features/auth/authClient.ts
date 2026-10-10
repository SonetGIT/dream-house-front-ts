export interface AuthSession {
    accessToken: string;
    refreshToken?: string;
    accessTokenExpiresAt: number;
    userId: string;
    generation: string;
    refreshing?: boolean;
    retryAt?: number;
}

export interface TokenResponse {
    success: boolean;
    data: { id: number | string; [key: string]: unknown };
    token?: string;
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpiresAt?: string;
    message?: string;
    code?: string;
}

interface AuthDependencies {
    baseUrl: string;
    allowedOrigins: string[];
    storage: Storage;
    fetch: typeof fetch;
    lock: (<T>(work: () => Promise<T>) => Promise<T>) | null;
    notify: () => void;
    now?: () => number;
    id?: () => string;
}

export const AUTH_SESSION_KEY = 'dreamhouse.auth.session.v1';
export const AUTH_INTENT_KEY = 'dreamhouse.auth.intent.v1';
const DEVICE_KEY = 'dreamhouse.auth.device';

export class AuthError extends Error {
    code: string;
    constructor(message: string, code = 'AUTH_REQUIRED') {
        super(message);
        this.name = 'AuthError';
        this.code = code;
    }
}

const signInMessage = 'Сессия завершена. Войдите в систему заново.';

export function createAuthClient(deps: AuthDependencies) {
    const now = deps.now || Date.now;
    const id = deps.id || (() => crypto.randomUUID());
    const baseUrl = deps.baseUrl.replace(/\/+$/, '');
    const storage = deps.storage;
    const originSet = new Set(deps.allowedOrigins);

    function tokenExpiry(token: string): number {
        try {
            const part = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
            const expiresAt = Number(JSON.parse(atob(part.padEnd(Math.ceil(part.length / 4) * 4, '='))).exp) * 1000;
            return Number.isFinite(expiresAt) ? expiresAt : 0;
        } catch {
            return 0;
        }
    }

    function getSession(): AuthSession | null {
        const raw = storage.getItem(AUTH_SESSION_KEY);
        if (raw) {
            try {
                const session = JSON.parse(raw) as AuthSession;
                if (((typeof session.accessToken === 'string' && session.accessToken.trim()) ||
                    (typeof session.refreshToken === 'string' && session.refreshToken.startsWith('v1.'))) &&
                    typeof session.generation === 'string' && typeof session.userId === 'string') {
                    return { ...session, accessToken: typeof session.accessToken === 'string' ? session.accessToken.trim() : '',
                        accessTokenExpiresAt: Number.isFinite(session.accessTokenExpiresAt)
                            ? session.accessTokenExpiresAt : tokenExpiry(session.accessToken || '') };
                }
            } catch { /* An invalid record must never be used to refresh. */ }
            return null;
        }
        const legacy = storage.getItem('token');
        if (!legacy?.trim()) return null;
        const session: AuthSession = {
            accessToken: legacy,
            accessTokenExpiresAt: tokenExpiry(legacy),
            userId: '',
            generation: id(),
        };
        storage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
        storage.removeItem('token');
        return session;
    }

    function clearLocalSession() {
        storage.removeItem(AUTH_SESSION_KEY);
        storage.removeItem('token');
        deps.notify();
    }

    function currentIntent() { return storage.getItem(AUTH_INTENT_KEY); }

    function assertCurrent(generation: string) {
        if (getSession()?.generation !== generation) throw new AuthError(signInMessage);
    }

    function save(session: AuthSession) {
        // One atomic record prevents mixing access/refresh tokens from different rotations.
        storage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
        storage.removeItem('token');
        deps.notify();
    }

    function requireLock() {
        if (!deps.lock) {
            throw new AuthError(
                'Для безопасного входа откройте сайт по HTTPS или localhost в современном браузере.',
                'AUTH_LOCK_UNAVAILABLE',
            );
        }
        return deps.lock;
    }

    function deviceInfo() {
        let deviceId = storage.getItem(DEVICE_KEY);
        if (!deviceId) {
            deviceId = id();
            storage.setItem(DEVICE_KEY, deviceId);
        }
        return { deviceId, deviceName: 'DreamHouse Web' };
    }

    async function post(path: string, body: unknown) {
        return deps.fetch(`${baseUrl}/auth/${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            credentials: 'omit',
            cache: 'no-store',
            redirect: 'error',
            signal: AbortSignal.timeout(15000),
        });
    }

    function normalize(data: TokenResponse, generation: string, requirePair: boolean): AuthSession {
        const accessToken = data.accessToken || data.token;
        if (!data.success || typeof accessToken !== 'string' || !accessToken.trim() || data.data?.id == null ||
            (requirePair && (typeof data.refreshToken !== 'string' || !data.refreshToken.startsWith('v1.')))) {
            throw new AuthError('Некорректный ответ авторизации. Войдите заново.', 'AUTH_RESPONSE_INVALID');
        }
        const expiresAt = Date.parse(data.accessTokenExpiresAt || '');
        return {
            accessToken,
            refreshToken: data.refreshToken,
            accessTokenExpiresAt: Number.isFinite(expiresAt) ? expiresAt : tokenExpiry(accessToken),
            userId: String(data.data.id),
            generation,
        };
    }

    async function revoke(refreshToken?: string) {
        if (!refreshToken) return;
        try { await post('logout', { refreshToken }); } catch {
            // Local logout still succeeds offline. Never retry a refresh to perform logout.
        }
    }

    async function login(username: string, password: string) {
        const lock = requireLock();
        const intent = id();
        storage.setItem(AUTH_INTENT_KEY, intent);
        clearLocalSession();
        return lock(async () => {
            if (currentIntent() !== intent) throw new AuthError(signInMessage);
            const response = await post('login', { username, password, ...deviceInfo() });
            const data = await response.json().catch(() => null) as TokenResponse | null;
            if (!response.ok || !data?.success) {
                throw new AuthError(data?.message || `Ошибка входа (${response.status})`, 'LOGIN_FAILED');
            }
            const session = normalize(data, intent, Boolean(data.refreshToken));
            if (currentIntent() !== intent) {
                await revoke(session.refreshToken);
                throw new AuthError(signInMessage);
            }
            try { save(session); } catch (error) {
                await revoke(session.refreshToken);
                throw error;
            }
            return {
                success: data.success,
                data: data.data,
                message: data.message,
                generation: session.generation,
            };
        });
    }

    async function logout() {
        const previous = getSession();
        storage.setItem(AUTH_INTENT_KEY, id());
        clearLocalSession();
        const work = () => revoke(previous?.refreshToken);
        // A refresh already in flight notices the changed intent and revokes its new pair.
        if (deps.lock) await deps.lock(work);
        else await work();
    }

    async function refreshAccessToken(rejectedToken?: string, rejectionCode?: string): Promise<string> {
        const initial = getSession();
        if (!initial) throw new AuthError(signInMessage);
        const intent = currentIntent();
        return requireLock()(async () => {
            assertCurrent(initial.generation);
            if (currentIntent() !== intent) throw new AuthError(signInMessage);
            const session = getSession()!;
            // A closed/crashed tab may have sent refresh without saving its response.
            if (session.refreshing) {
                clearLocalSession();
                throw new AuthError(signInMessage, 'REFRESH_RESULT_UNKNOWN');
            }
            if (rejectedToken && session.accessToken !== rejectedToken) return session.accessToken;
            if (rejectionCode && ['SESSION_REVOKED', 'USER_UNAVAILABLE', 'ACCESS_TOKEN_INVALID',
                'LEGACY_ACCESS_TOKEN_DISABLED'].includes(rejectionCode)) {
                clearLocalSession();
                throw new AuthError(signInMessage, rejectionCode);
            }
            if (!rejectedToken && session.accessToken && session.accessTokenExpiresAt > now() + 10000) return session.accessToken;
            if (!session.refreshToken) {
                clearLocalSession();
                throw new AuthError(signInMessage);
            }
            if ((session.retryAt || 0) > now()) {
                throw new AuthError('Слишком много запросов. Попробуйте позже.', 'AUTH_RATE_LIMITED');
            }
            // Persist before sending: an uncertain outcome must not reuse this refresh token.
            save({ ...session, refreshing: true });
            let response: Response;
            try {
                response = await post('refresh', { refreshToken: session.refreshToken, ...deviceInfo() });
            } catch {
                if (getSession()?.generation === session.generation) clearLocalSession();
                throw new AuthError('Не удалось подтвердить обновление сессии. Войдите заново.', 'REFRESH_RESULT_UNKNOWN');
            }
            if (response.status === 429) {
                if (currentIntent() === intent && getSession()?.generation === session.generation) {
                    const header = response.headers.get('Retry-After');
                    const seconds = Number(header);
                    const until = header && Number.isFinite(seconds)
                        ? now() + seconds * 1000 : Date.parse(header || '');
                    save({ ...session, retryAt: Math.max(now() + 1000, until || now() + 60000) });
                }
                throw new AuthError('Слишком много запросов. Попробуйте позже.', 'AUTH_RATE_LIMITED');
            }
            const data = await response.json().catch(() => null) as TokenResponse | null;
            if (!response.ok || !data?.success) {
                if (getSession()?.generation === session.generation) clearLocalSession();
                throw new AuthError(data?.message || signInMessage, data?.code || 'REFRESH_FAILED');
            }
            let next: AuthSession;
            try { next = normalize(data, session.generation, true); } catch (error) {
                if (getSession()?.generation === session.generation) clearLocalSession();
                throw error;
            }
            if (next.refreshToken === session.refreshToken) {
                if (getSession()?.generation === session.generation) clearLocalSession();
                throw new AuthError(signInMessage, 'AUTH_RESPONSE_INVALID');
            }
            if (currentIntent() !== intent || getSession()?.generation !== session.generation) {
                await revoke(next.refreshToken);
                throw new AuthError(signInMessage);
            }
            if (next.userId !== session.userId) {
                clearLocalSession();
                await revoke(next.refreshToken);
                throw new AuthError(signInMessage);
            }
            try { save(next); } catch (error) {
                clearLocalSession();
                await revoke(next.refreshToken);
                throw error;
            }
            return next.accessToken;
        });
    }

    async function authenticatedFetch(input: string | URL, init: RequestInit = {}) {
        const url = new URL(input);
        if (!originSet.has(url.origin) || url.username || url.password) {
            throw new AuthError('Недопустимый адрес авторизованного запроса.', 'AUTH_ORIGIN_INVALID');
        }
        const initial = getSession();
        if (!initial) throw new AuthError(signInMessage);
        let token = initial.accessToken;
        if (!token || initial.refreshing || initial.accessTokenExpiresAt <= now() + 10000) {
            token = await refreshAccessToken();
        }
        assertCurrent(initial.generation);
        const send = (accessToken: string) => {
            const headers = new Headers(init.headers);
            headers.set('Authorization', `Bearer ${accessToken}`);
            return deps.fetch(url, { ...init, headers, credentials: 'omit', redirect: 'error' });
        };
        let response = await send(token);
        assertCurrent(initial.generation);
        if (response.status === 401) {
            const failure = await response.clone().json().catch(() => null);
            assertCurrent(initial.generation);
            token = await refreshAccessToken(token, failure?.code);
            assertCurrent(initial.generation);
            response = await send(token);
            assertCurrent(initial.generation);
            if (response.status === 401 && getSession()?.accessToken === token) {
                // A report service may reject a valid API token. Confirm with the API
                // before ending the entire user's session.
                if (url.origin === new URL(baseUrl).origin) {
                    clearLocalSession();
                }
            }
        }
        return response;
    }

    return { getSession, login, logout, refreshAccessToken, authenticatedFetch, assertCurrent };
}
