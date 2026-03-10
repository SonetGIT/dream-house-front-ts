export const parseNumber = (value: string | number | null | undefined): number => {
    if (value === null || value === undefined) return 0;

    if (typeof value === 'number') return value;

    const normalized = value.trim().replace(',', '.');
    const num = Number(normalized);

    return isNaN(num) ? 0 : num;
};
