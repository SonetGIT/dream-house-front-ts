import type { MaterialRequest } from './materialRequestsSlice';
import { reportRequest } from '../reports/reportRequest';

export async function downloadMaterialRequestReport(request: Pick<MaterialRequest, 'id' | 'number'>): Promise<void> {
    const baseUrl = (import.meta.env.VITE_REPORTS_URL || '').replace(/\/+$/, '');
    if (!baseUrl) throw new Error('Не настроен адрес сервиса отчётов');

    const response = await reportRequest(`${baseUrl}/report/materialRequest/${request.id}?format=xlsx`);
    if (response.contentType.toLowerCase().includes('json')) {
        const payload: unknown = await response.blob.text().then((text) => JSON.parse(text)).catch(() => null);
        const message = payload && typeof payload === 'object' && 'message' in payload &&
            typeof payload.message === 'string' ? payload.message : null;
        throw new Error(message || 'Сервис отчётов не вернул файл Excel');
    }

    const number = request.number == null ? '' : String(request.number).trim().replace(/[<>:"/\\|?*]/g, '_');
    const defaultName = `Заявка-на-материалы${number ? `-${number}` : ''}.xlsx`;
    const link = document.createElement('a');
    const objectUrl = window.URL.createObjectURL(response.blob);
    try {
        link.href = objectUrl;
        link.download = response.fileName || defaultName;
        document.body.appendChild(link);
        link.click();
    } finally {
        link.remove();
        window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 0);
    }
}
