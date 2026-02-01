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
    body?: unknown,
): Promise<ApiResponse<T>> {
    const token = getToken();
    if (!token) {
        throw new Error('Токен отсутствует');
    }

    const isFormData = body instanceof FormData;

    const res = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers: {
            Authorization: `Bearer ${token}`,
            ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        },
        body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
    });

    // ⛔️ для blob / download json не читаем
    const contentType = res.headers.get('content-type');

    if (contentType?.includes('application/json')) {
        const data = await res.json();

        if (!res.ok || data?.success === false) {
            throw new Error(data?.message || 'Ошибка запроса');
        }

        return data;
    }

    // fallback (редко, но безопасно)
    if (!res.ok) {
        throw new Error('Ошибка запроса');
    }

    return {} as ApiResponse<T>;
}

// import { getToken } from '@/features/auth/getToken';

// const API_URL = import.meta.env.VITE_BASE_URL;

// export interface ApiResponse<T> {
//     data: T;
//     pagination?: any;
//     success?: boolean;
//     message?: string;
// }

// export async function apiRequest<T = any>(
//     endpoint: string,
//     method: 'GET' | 'POST' | 'PUT' | 'DELETE',
//     body?: unknown
// ): Promise<ApiResponse<T>> {
//     const token = getToken();
//     if (!token) {
//         throw new Error('Токен отсутствует');
//     }

//     const res = await fetch(`${API_URL}${endpoint}`, {
//         method,
//         headers: {
//             'Content-Type': 'application/json',
//             Authorization: `Bearer ${token}`,
//         },
//         body: body ? JSON.stringify(body) : undefined,
//     });

//     const data = await res.json().catch(() => ({}));

//     if (!res.ok || data?.success === false) {
//         throw new Error(data?.message || 'Ошибка запроса');
//     }

//     return data;
// }
