import { reportRequest } from '@/features/projects/reports/reportRequest';

export async function downloadEstimateReport(blockId: number, blockName: string): Promise<void> {
    if (!Number.isSafeInteger(blockId) || blockId <= 0) throw new Error('Некорректный блок сметы');
    const baseUrl = (import.meta.env.VITE_REPORTS_URL || '').replace(/\/+$/, '');
    if (!baseUrl) throw new Error('Не настроен адрес сервиса отчётов');

    const params = new URLSearchParams({ blockId: String(blockId), format: 'xlsx' });
    const response = await reportRequest(`${baseUrl}/report/estimate-stage?${params}`);
    const contentType = response.contentType.toLowerCase();
    if (contentType.includes('json') || contentType.includes('text/html')) {
        throw new Error('Сервис отчётов не вернул файл Excel');
    }

    const name = blockName.trim().replace(/[<>:"/\\|?*]/g, '_');
    const link = document.createElement('a');
    const objectUrl = window.URL.createObjectURL(response.blob);
    try {
        link.href = objectUrl;
        link.download = response.fileName || `Смета${name ? ` — ${name}` : ''}.xlsx`;
        document.body.appendChild(link);
        link.click();
    } finally {
        link.remove();
        window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 0);
    }
}
