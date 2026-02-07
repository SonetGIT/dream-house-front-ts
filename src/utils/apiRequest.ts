import { getToken } from '@/features/auth/getToken';
import type { Pagination } from '@/features/users/userSlice';

const API_URL = import.meta.env.VITE_BASE_URL;

export interface ApiResponse<T> {
    data: T;
    pagination?: Pagination;
    success?: boolean;
    message?: string;
}

export async function apiRequest<T = any>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    body?: unknown,
): Promise<ApiResponse<T>> {
    try {
        const token = getToken();
        const isFormData = body instanceof FormData;

        // Заголовки
        const headers: HeadersInit = {};
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
        if (method !== 'GET' && !isFormData) {
            headers['Content-Type'] = 'application/json';
        }

        // Обработка GET-параметров
        if (method === 'GET' && body) {
            const params = new URLSearchParams();
            Object.entries(body as Record<string, any>).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    params.append(key, String(value));
                }
            });
            endpoint = `${endpoint}?${params}`;
        }

        const config: RequestInit = { method, headers };
        if (method !== 'GET' && body) {
            config.body = isFormData ? body : JSON.stringify(body);
        }

        const res = await fetch(`${API_URL}${endpoint}`, config);

        // Обработка не-JSON ответов (файлы, изображения)
        const contentType = res.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
            if (!res.ok) throw new Error('Ошибка запроса');
            const blob = await res.blob();
            return { data: blob as unknown as T } as ApiResponse<T>;
        }

        // Обработка JSON
        const data = await res.json();
        if (!res.ok || data?.success === false) {
            throw new Error(data?.message || 'Ошибка запроса');
        }

        return data;
    } catch (error) {
        if (error instanceof TypeError) {
            throw new Error('Нет подключения к интернету');
        }
        throw error;
    }
}
