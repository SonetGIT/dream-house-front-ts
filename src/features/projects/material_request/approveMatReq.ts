import { createAsyncThunk } from '@reduxjs/toolkit';
import { createEstimateItems } from '../pto/projectBlocks/estimatess/estimateItems/estimateItemsSlice';
import { signMaterialRequest, updateMaterialRequest } from './materialRequestsSlice';

export const approveMatReq = createAsyncThunk<
    void,
    {
        requestId: number;
        role_id: number;
        userId: number;
        material_estimate_id: number;
        isLast: boolean;
        items: {
            id: number;
            stage_id: number;
            subsection_id: number;
            material_id: number;
            material_type: number;
            quantity: number;
            coefficient: number;
            price: number;
            currency: number;
            currency_rate: number;
            item_type: number;
            comment?: string;
            unit_of_measure: number;
        }[];
    }
>('materialRequests/approveFullFlow', async (payload, { dispatch, rejectWithValue }) => {
    try {
        const { requestId, items, material_estimate_id, role_id, userId, isLast } = payload;

        const manualItems = items.filter((i) => Number(i.item_type) === 2);

        let createdItems: any[] = [];

        /* ---------------- CREATE ESTIMATE ITEMS ---------------- */
        if (isLast && manualItems.length > 0) {
            const res = await dispatch(
                createEstimateItems(
                    manualItems.map((i) => ({
                        material_estimate_id,
                        item_type: 1,
                        entry_type: i.item_type,
                        stage_id: i.stage_id,
                        subsection_id: i.subsection_id,
                        material_id: i.material_id,
                        material_type: i.material_type,
                        unit_of_measure: i.unit_of_measure,
                        quantity_planned: i.quantity,
                        coefficient: i.coefficient,
                        currency: i.currency,
                        currency_rate: i.currency_rate,
                        price: i.price,
                        comment: i.comment || '',
                    })),
                ),
            ).unwrap();

            if (!res || !Array.isArray(res)) {
                throw new Error('Ошибка создания элементов сметы');
            }

            createdItems = res;
        }

        /* ---------------- UPDATE REQUEST ITEMS ---------------- */
        if (isLast && manualItems.length > 0) {
            const updatePayload = manualItems.map((i, index) => {
                const created = createdItems[index];

                if (!created?.id) {
                    throw new Error('Не удалось получить ID элемента сметы');
                }

                return {
                    id: i.id,
                    material_estimate_item_id: created.id, // ✅ теперь корректно
                    quantity: i.quantity,
                    price: i.price,
                    coefficient: i.coefficient, // ✅ добавили
                    currency: i.currency,
                    currency_rate: i.currency_rate,
                };
            });

            await dispatch(
                updateMaterialRequest({
                    id: requestId,
                    items: updatePayload,
                }),
            ).unwrap();
        }

        /* ---------------- SIGN ---------------- */
        await dispatch(
            signMaterialRequest({
                id: requestId,
                role_id,
                userId,
            }),
        ).unwrap();
    } catch (e: any) {
        return rejectWithValue(e.message || 'Ошибка approveMatReq');
    }
});
