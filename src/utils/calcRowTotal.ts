export const calcRowTotal = (row: any) => {
    const total =
        Number(row.quantity_planned || 0) *
        Number(row.price || 0) *
        Number(row.coefficient || 1) *
        Number(row.currency_rate || 1);

    return Number(total.toFixed(2));
};
