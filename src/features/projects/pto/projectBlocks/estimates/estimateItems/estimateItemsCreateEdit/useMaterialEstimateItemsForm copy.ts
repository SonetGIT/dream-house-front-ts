import { useMemo, useState } from 'react';

export interface TypeMaterialEstimateItemFormRow {
    subsection_id: string;
    item_type: string;
    service_type: string;
    service_id: string;
    material_type: string;
    material_id: string;
    unit_of_measure: string;
    quantity_planned: string;
    coefficient: string;
    currency: string;
    price: string;
    comment: string;
}

export const emptyRow = (): TypeMaterialEstimateItemFormRow => ({
    subsection_id: '',
    item_type: '',
    service_type: '',
    service_id: '',
    material_type: '',
    material_id: '',
    unit_of_measure: '',
    quantity_planned: '',
    coefficient: '',
    currency: '',
    price: '',
    comment: '',
});

export function useMaterialEstimateItemsFormCf(initial: TypeMaterialEstimateItemFormRow[]) {
    const [rows, setRows] = useState(initial);

    const updateField = (
        index: number,
        field: keyof TypeMaterialEstimateItemFormRow,
        value: string,
    ) => {
        setRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
    };

    const addRow = () => setRows((prev) => [...prev, emptyRow()]);

    const removeRow = (index: number) => setRows((prev) => prev.filter((_, i) => i !== index));

    const rowTotal = (row: TypeMaterialEstimateItemFormRow) => {
        const qty = Number(row.quantity_planned) || 0;
        const price = Number(row.price) || 0;
        const coef = Number(row.coefficient) || 1;
        return qty * price * coef;
    };

    const grandTotal = useMemo(() => rows.reduce((sum, r) => sum + rowTotal(r), 0), [rows]);

    const isRowValid = (row: TypeMaterialEstimateItemFormRow) =>
        row.subsection_id && row.item_type && row.material_id && row.quantity_planned && row.price;

    const isFormValid = rows.every(isRowValid);

    return {
        rows,
        updateField,
        addRow,
        removeRow,
        rowTotal,
        grandTotal,
        isFormValid,
        setRows,
    };
}
