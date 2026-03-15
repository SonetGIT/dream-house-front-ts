export const formatCurrency = (amount: number | null) => {
    if (!amount) return '—';
    return new Intl.NumberFormat('ru-KG', {
        style: 'currency',
        currency: 'KGS',
        maximumFractionDigits: 0,
    }).format(amount);
};
