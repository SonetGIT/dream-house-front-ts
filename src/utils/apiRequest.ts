import { getToken } from '@/features/auth/getToken';

const API_URL = import.meta.env.VITE_BASE_URL;

export interface ApiResponse<T> {
    data: T;
    pagination?: any;
    success?: boolean;
    message?: string;
}

export async function apiRequest<T = any>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    body?: unknown
): Promise<ApiResponse<T>> {
    const token = getToken();
    if (!token) {
        throw new Error('Токен отсутствует');
    }

    const res = await fetch(`${API_URL}${endpoint}`, {
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
