const API_URL = import.meta.env.VITE_BASE_URL;

export async function downloadFile(endpoint: string, filename: string, token?: string) {
    const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'GET',
        headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
        },
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Ошибка скачивания файла');
    }

    const blob = await res.blob();

    if (blob.type.includes('application/json') || blob.type.includes('text/html')) {
        throw new Error('Сервер вернул не файл');
    }

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    a.remove();
    window.URL.revokeObjectURL(url);
}
