import { useState } from 'react';
import { useCurrencyRates } from '@/utils/useCurrencyRates';

import type { ReferenceResult } from '@/features/reference/referenceSlice';
import type { EstimateItem } from '../../projectBlocks/estimatess/estimateItems/estimateItemsSlice';

/*TYPES*/

export interface ServiceRow {
    id: number | string;
    item_type: number;
    stage_id: number | null;
    subsection_id: number | null;

    service_type: number | null;
    service_id: number | null;
    unit_of_measure: number | null;

    quantity: number;

    currency: number | null;
    currency_rate: number;

    price: number;
    comment: string;

    isFromEstimate: boolean;
}

interface UseServiceRowsParams {
    initialItems: EstimateItem[];
    refs: Record<string, ReferenceResult>;
}

/*HOOK*/

export function useServiceRows({ initialItems, refs }: UseServiceRowsParams) {
    const rates = useCurrencyRates();
    const services = refs.services?.data || [];

    /*MAPPERS*/
    const mapFromEstimate = (items: EstimateItem[]): ServiceRow[] =>
        items.map((i) => ({
            id: i.id,

            stage_id: i.stage_id,
            subsection_id: i.subsection_id,

            service_type: i.service_type,
            service_id: i.service_id,

            unit_of_measure: i.unit_of_measure,

            quantity: i.quantity_planned || 0,

            currency: i.currency || 1,
            currency_rate: i.currency_rate || 1,

            price: i.price || 0,
            comment: i.comment || '',
            item_type: i.entry_type,
            isFromEstimate: true,
        }));

    const createEmptyRow = (): ServiceRow => ({
        id: Math.random().toString(36).substr(2, 9),
        item_type: 2,
        stage_id: null,
        subsection_id: null,

        service_type: null,
        service_id: null,
        unit_of_measure: null,

        quantity: 0,
        currency: 1,
        currency_rate: 1,

        price: 0,
        comment: '',

        isFromEstimate: false,
    });

    /*STATE*/
    const [rows, setRows] = useState<ServiceRow[]>(mapFromEstimate(initialItems));

    /*ACTIONS*/

    const updateRow = (
        id: number | string,
        field: keyof ServiceRow,
        value: string | number | null,
    ) => {
        setRows((prev) =>
            prev.map((row) => {
                if (row.id !== id) return row;

                const updated: ServiceRow = { ...row, [field]: value };

                // зависимости
                if (field === 'stage_id') {
                    updated.subsection_id = null;
                }

                if (field === 'service_type') {
                    updated.service_id = null;
                    updated.unit_of_measure = null;
                }

                if (field === 'service_id') {
                    const service = services.find((m: any) => Number(m.id) === Number(value));
                    updated.unit_of_measure = service?.unit_of_measure ?? null;
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
