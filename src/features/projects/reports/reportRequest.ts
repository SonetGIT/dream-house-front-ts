import { getToken } from '@/features/auth/getToken';

export interface ReportResponse {
    blob: Blob;
    fileName: string | null;
    contentType: string;
}

const getFileName = (contentDisposition: string | null) => {
    if (!contentDisposition) return null;

    const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
    if (utf8Match?.[1]) {
        try {
            return decodeURIComponent(utf8Match[1]);
        } catch {
            return utf8Match[1];
        }
    }

    return contentDisposition.match(/filename="?([^";]+)"?/i)?.[1] ?? null;
};

const getErrorMessage = async (response: Response) => {
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
        const json = await response.json().catch(() => null);
        return json?.message || json?.error || `Ошибка формирования отчёта (${response.status})`;
    }

    const text = await response.text().catch(() => '');
    return text.trim() || `Ошибка формирования отчёта (${response.status})`;
};

export async function reportRequest(url: string): Promise<ReportResponse> {
    const token = getToken();

    if (!token) {
        throw new Error('Не найден токен авторизации. Войдите в систему заново.');
    }

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: '*/*',
            },
        });

        if (!response.ok) {
            throw new Error(await getErrorMessage(response));
        }

        return {
            blob: await response.blob(),
            fileName: getFileName(response.headers.get('content-disposition')),
            contentType: response.headers.get('content-type') || 'application/octet-stream',
        };
    } catch (error) {
        if (error instanceof TypeError) {
            throw new Error('Не удалось подключиться к сервису отчётов');
        }

        throw error;
    }
}
