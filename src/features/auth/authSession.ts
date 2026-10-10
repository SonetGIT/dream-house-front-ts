import { AUTH_INTENT_KEY, AUTH_SESSION_KEY, createAuthClient } from './authClient';

const apiUrl = import.meta.env.VITE_API_URL as string;
const reportsUrl = import.meta.env.VITE_REPORTS_URL as string;
const SESSION_EVENT = 'dreamhouse:auth-session-changed';

export const authClient = createAuthClient({
    baseUrl: apiUrl,
    allowedOrigins: [apiUrl, reportsUrl].filter(Boolean).map((url) => new URL(url).origin),
    storage: localStorage,
    fetch: (input, init) => fetch(input, init),
    lock: navigator.locks
        ? async (work) => await navigator.locks.request('dreamhouse.auth.session.v1', work)
        : null,
    notify: () => window.dispatchEvent(new Event(SESSION_EVENT)),
});

export const authenticatedFetch = authClient.authenticatedFetch;

export function subscribeAuthSession(listener: () => void) {
    const onStorage = (event: StorageEvent) => {
        if (event.key === null || [AUTH_SESSION_KEY, AUTH_INTENT_KEY, 'token'].includes(event.key)) {
            listener();
        }
    };
    window.addEventListener(SESSION_EVENT, listener);
    window.addEventListener('storage', onStorage);
    return () => {
        window.removeEventListener(SESSION_EVENT, listener);
        window.removeEventListener('storage', onStorage);
    };
}
