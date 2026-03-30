import { useState } from 'react';
import { useCurrencyRates } from '@/utils/useCurrencyRates';

import type { EstimateItem } from '../../pto/projectBlocks/estimatess/estimateItems/estimateItemsSlice';
import type { ReferenceResult } from '@/features/reference/referenceSlice';

/*TYPES*/

export interface MaterialRow {
    id: number | string;
    item_type: number;
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

/*HOOK*/

export function useMaterialRows({ initialItems, refs }: UseMaterialRowsParams) {
    const rates = useCurrencyRates();
    const materials = refs.materials?.data || [];

    /*MAPPERS*/
    const mapFromEstimate = (items: EstimateItem[]): MaterialRow[] =>
        items.map((i) => ({
            id: i.id,

            stage_id: i.stage_id,
            subsection_id: i.subsection_id,

            material_type: i.material_type,
            material_id: i.material_id,
            unit_of_measure: i.unit_of_measure,

            quantity: i.quantity_planned || 0,
            coefficient: i.coefficient || 1,

            currency: i.currency || 1,
            currency_rate: i.currency_rate || 1,

            price: i.price || 0,
            comment: i.comment || '',
            item_type: i.entry_type,
            isFromEstimate: true,
        }));

    const createEmptyRow = (): MaterialRow => ({
        id: Math.random().toString(36).substr(2, 9),
        item_type: 2,
        stage_id: null,
        subsection_id: null,

        material_type: null,
        material_id: null,
        unit_of_measure: null,

        quantity: 0,
        coefficient: 1,

        currency: 1,
        currency_rate: 1,

        price: 0,
        comment: '',

        isFromEstimate: false,
    });

    /*STATE*/
    const [rows, setRows] = useState<MaterialRow[]>(mapFromEstimate(initialItems));

    /*ACTIONS*/

    const updateRow = (
        id: number | string,
        field: keyof MaterialRow,
        value: string | number | null,
    ) => {
        setRows((prev) =>
            prev.map((row) => {
                if (row.id !== id) return row;

                const updated: MaterialRow = { ...row, [field]: value };

                // зависимости
                if (field === 'stage_id') {
                    updated.subsection_id = null;
                }

                if (field === 'material_type') {
                    updated.material_id = null;
                    updated.unit_of_measure = null;
                }

                if (field === 'material_id') {
                    const material = materials.find((m: any) => Number(m.id) === Number(value));
                    updated.unit_of_measure = material?.unit_of_measure ?? null;
                }

                if (field === 'currency') {
                    const rate = rates.find((r) => Number(r.currency_id) === Number(value))?.rate;

                    updated.currency_rate = rate ?? 1;
                }

                return updated;
            }),
        );
    };

    const addRow = () => {
        setRows((prev) => [...prev, createEmptyRow()]);
    };

    const removeRow = (id: number | string) => {
        setRows((prev) => prev.filter((row) => row.id !== id));
    };

    /*RETURN*/
    return {
        rows,
        updateRow,
        addRow,
        removeRow,
    };
}
