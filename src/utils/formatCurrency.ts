export const formatCurrency = (amount: string | number | null | undefined) => {
    if (amount == null || amount === '') return '—';

    const value = Number(amount);

    return new Intl.NumberFormat('ru-KG', {
        style: 'currency',
        currency: 'KGS',
        maximumFractionDigits: 0,
    }).format(value);
};
// export const formatCurrency = (amount: number | null) => {
//     if (!amount) return '—';
//     return new Intl.NumberFormat('ru-KG', {
//         style: 'currency',
//         currency: 'KGS',
//         maximumFractionDigits: 0,
//     }).format(amount);
// };
