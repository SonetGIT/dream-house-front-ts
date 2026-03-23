import { useState } from 'react';
import { useCurrencyRates } from '@/utils/useCurrencyRates';

import type { EstimateItem } from '../../pto/projectBlocks/estimatess/estimateItems/estimateItemsSlice';
import type { ReferenceResult } from '@/features/reference/referenceSlice';

/* ================= TYPES ================= */

export interface MaterialRow {
    stage_id: number | null;
    subsection_id: number | null;

    material_type: number | null;
    material_id: number | null;
    unit_of_measure: number | null;

    quantity: number;
    coefficient: number;

    currency: number | null;
    currency_rate: number;

    price: number;
    comment: string;

    isFromEstimate: boolean;
}

interface UseMaterialRowsParams {
    initialItems: EstimateItem[];
    refs: Record<string, ReferenceResult>;
}

/* ================= HOOK ================= */

export function useMaterialRows({ initialItems, refs }: UseMaterialRowsParams) {
    const rates = useCurrencyRates();

    const materials = refs.materials?.data || [];

    /* ================= MAPPERS ================= */

    const mapFromEstimate = (items: EstimateItem[]): MaterialRow[] =>
        items.map((i) => ({
            stage_id: i.stage_id,
            subsection_id: i.subsection_id,

            material_type: i.material_type,
            material_id: i.material_id,
            unit_of_measure: i.unit_of_measure,

            quantity: i.quantity_planned || 0,
            coefficient: i.coefficient || 1,

            currency: i.currency,
            currency_rate: i.currency_rate || 1,

            price: i.price || 0,
            comment: i.comment || '',

            isFromEstimate: true,
        }));

    const createEmptyRow = (): MaterialRow => ({
        stage_id: null,
        subsection_id: null,

        material_type: null,
        material_id: null,
        unit_of_measure: null,

        quantity: 0,
        coefficient: 1,

        currency: null,
        currency_rate: 1,

        price: 0,
        comment: '',

        isFromEstimate: false,
    });

    /* ================= STATE ================= */

    const [rows, setRows] = useState<MaterialRow[]>(mapFromEstimate(initialItems));

    /* ================= ACTIONS ================= */

    const updateRow = <K extends keyof MaterialRow>(
        index: number,
        key: K,
        value: MaterialRow[K],
    ) => {
        setRows((prev) => {
            const updated = [...prev];
            const row: MaterialRow = { ...updated[index], [key]: value };

            // зависимости
            if (key === 'stage_id') {
                row.subsection_id = null;
            }

            if (key === 'material_type') {
                row.material_id = null;
                row.unit_of_measure = null;
            }

            if (key === 'material_id') {
                const material = materials.find((m: any) => Number(m.id) === Number(value));
                row.unit_of_measure = material?.unit_of_measure ?? null;
            }

            if (key === 'currency') {
                const rate = rates.find((r) => Number(r.currency_id) === Number(value))?.rate;

                row.currency_rate = rate ?? 1;
            }

            updated[index] = row;
            return updated;
        });
    };

    const addRow = () => {
        setRows((prev) => [...prev, createEmptyRow()]);
    };

    const removeRow = (index: number) => {
        setRows((prev) => prev.filter((_, i) => i !== index));
    };

    /* ================= RETURN ================= */

    return {
        rows,
        updateRow,
        addRow,
        removeRow,
    };
}
