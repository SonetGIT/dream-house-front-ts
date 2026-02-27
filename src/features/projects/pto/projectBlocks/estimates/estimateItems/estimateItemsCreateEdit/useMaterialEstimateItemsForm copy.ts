import { useCallback, useMemo, useState } from 'react';
import { nanoid } from 'nanoid';
import type { ReferenceResult } from '@/features/reference/referenceSlice';

export type EstimateItemRowType = {
    id: string;

    item_type: number | '';

    service_type: number | '';
    service_id: number | '';

    material_type: number | '';
    material_id: number | '';

    unit_of_measure: number | '';

    quantity: number | '';
    coefficient: number | '';
    price: number;
    currency: number | '';

    comment: string;
};

interface Params {
    defaultItemType?: number;
    materialTypeId?: number;
    serviceTypeId?: number;
    refs: {
        materials: ReferenceResult;
    };
    initialRows?: EstimateItemRowType[];
}

export function useMaterialEstimateItemsForm({
    defaultItemType,
    materialTypeId,
    serviceTypeId,
    refs,
    initialRows = [],
}: Params) {
    // ─────────────────────────────────────────────
    // CREATE EMPTY ROW
    // ─────────────────────────────────────────────

    const createEmptyRow = (): EstimateItemRowType => ({
        id: nanoid(),

        item_type: defaultItemType ?? '',

        service_type: '',
        service_id: '',

        material_type: '',
        material_id: '',

        unit_of_measure: '',

        quantity: 1,
        coefficient: 1,
        price: 0,
        currency: '',

        comment: '',
    });

    const [rows, setRows] = useState<EstimateItemRowType[]>(
        initialRows.length ? initialRows : [createEmptyRow()],
    );

    const reset = () => {
        setRows([createEmptyRow()]);
    };

    // ─────────────────────────────────────────────
    // ADD ROW
    // ─────────────────────────────────────────────

    const addRow = useCallback(() => {
        setRows((prev) => [...prev, createEmptyRow()]);
    }, []);

    // ─────────────────────────────────────────────
    // REMOVE ROW
    // ─────────────────────────────────────────────

    const removeRow = useCallback((index: number) => {
        setRows((prev) => prev.filter((_, i) => i !== index));
    }, []);

    // ─────────────────────────────────────────────
    // UPDATE FIELD
    // ─────────────────────────────────────────────

    const updateField = useCallback(
        (index: number, field: keyof EstimateItemRowType, value: any) => {
            setRows((prev) => {
                const updated = [...prev];
                const row = { ...updated[index] };

                (row as any)[field] = value;

                // ────────────────
                // TYPE SWITCH LOGIC
                // ────────────────

                if (field === 'item_type') {
                    // очищаем всё несовместимое
                    row.service_type = '';
                    row.service_id = '';

                    row.material_type = '';
                    row.material_id = '';
                    row.unit_of_measure = '';

                    row.quantity = '';
                    row.coefficient = '';
                }

                // ────────────────
                // SERVICE LOGIC
                // ────────────────

                if (field === 'service_type') {
                    row.service_id = '';
                }

                // ────────────────
                // MATERIAL LOGIC
                // ────────────────

                if (field === 'material_type') {
                    row.material_id = '';
                    row.unit_of_measure = '';
                }

                if (field === 'material_id') {
                    const material = refs.materials.data?.find(
                        (m) => Number(m.id) === Number(value),
                    );

                    row.unit_of_measure = material?.unit_of_measure
                        ? Number(material.unit_of_measure)
                        : '';

                    row.coefficient = material?.coefficient ? Number(material.coefficient) : '';
                }

                updated[index] = row;
                return updated;
            });
        },
        [refs.materials.data],
    );

    // ─────────────────────────────────────────────
    // ROW TOTAL
    // ─────────────────────────────────────────────
    const rowTotal = (row: EstimateItemRowType) => {
        const qty = Number(row.quantity) || 0;
        const price = Number(row.price) || 0;

        // если коэффициента нет → берём 1
        const coef =
            row.coefficient === undefined || row.coefficient === null || row.coefficient === ''
                ? 1
                : Number(row.coefficient);

        return qty * price * coef;
    };

    const grandTotal = useMemo(() => {
        return rows.reduce((sum, row) => sum + rowTotal(row), 0);
    }, [rows, rowTotal]);

    return {
        rows,
        addRow,
        removeRow,
        updateField,
        rowTotal,
        reset,
        grandTotal,
    };
}
