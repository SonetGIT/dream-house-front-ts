import { getToken } from '@/features/auth/getToken';

type WorkPerformedReportFormat = 'pdf' | 'xlsx' | 'docx' | 'html';

export const REPORT_BASE_URL = 'http://77.235.27.71:8080';

const getFileNameFromContentDisposition = (contentDisposition: string | null) => {
    if (!contentDisposition) return null;

    const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
    if (utf8Match?.[1]) {
        return decodeURIComponent(utf8Match[1]);
    }

    const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
    return fileNameMatch?.[1] ?? null;
};

const getDefaultFileName = (id: number, format: WorkPerformedReportFormat) => {
    if (format === 'html') return `АВР-${id}.html`;
    return `АВР-${id}.${format}`;
};

export const downloadWorkPerformedReport = async (
    id: number,
    format: WorkPerformedReportFormat,
) => {
    const token = getToken();

    const response = await fetch(`${REPORT_BASE_URL}/report/workPerformed/${id}?format=${format}`, {
        method: 'GET',
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    const contentType = response.headers.get('Content-Type');

    if (!response.ok) {
        let message = 'Не удалось скачать отчёт';

        if (contentType?.includes('application/json')) {
            const json = await response.json();
            message = json?.message || json?.error || message;
        }

        throw new Error(message);
    }

    const blob = await response.blob();

    const fileName =
        getFileNameFromContentDisposition(response.headers.get('Content-Disposition')) ||
        getDefaultFileName(id, format);

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);
};
