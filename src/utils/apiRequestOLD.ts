import { getToken } from '@/features/auth/getToken';

// COMMON FETCH HELPER
export async function apiRequestOLD(url: string, method: string, body?: any) {
    const token = getToken();
    if (!token) throw new Error('Токен отсутствует');

    const res = await fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || data?.success === false) {
        throw new Error(data?.message || 'Ошибка запроса');
    }

    return data;
}
