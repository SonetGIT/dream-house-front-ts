import { authenticatedFetch } from '@/features/auth/authSession';

export async function downloadMaterialsExcel(): Promise<void> {
    const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
    const response = await authenticatedFetch(`${baseUrl}/materials/export.xlsx`, { method: 'GET' });
    if (!response.ok) throw new Error('Не удалось выгрузить материалы в Excel');

    // Fetch reads binary responses through blob(), equivalent to responseType: 'blob'.
    const blob = await response.blob();
    if (blob.type.includes('application/json') || blob.type.includes('text/html')) {
        throw new Error('Не удалось выгрузить материалы в Excel');
    }
    const objectUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    try {
        link.href = objectUrl;
        link.download = 'Материалы.xlsx';
        document.body.appendChild(link);
        link.click();
    } finally {
        link.remove();
        window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 0);
    }
}
