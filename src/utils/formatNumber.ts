// export const formatNumber = (n: number) => n.toLocaleString('ru-RU', { minimumFractionDigits: 2 });

export function formatNumber(value: unknown, digits = 0): string {
    const num = Number(value || 0);
    if (!Number.isFinite(num)) return '0';
    return num.toLocaleString('ru-RU', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
    });
}

export function formatArea(value: unknown): string {
    const num = Number(value || 0);
    if (!Number.isFinite(num) || num <= 0) return '—';
    return `${formatNumber(num, Number.isInteger(num) ? 0 : 1)} м²`;
}
