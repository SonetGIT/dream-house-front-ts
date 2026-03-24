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
        items: {
            id: number;
            material_id: number;
            quantity: number;
            price: number;
            currency: number;
            currency_rate: number;
            item_type: number;
        }[];
    }
>('materialRequests/approveFullFlow', async (payload, { dispatch, rejectWithValue }) => {
    try {
        const { requestId, items, material_estimate_id, role_id, userId } = payload;

        // 🔥 только manual
        const manualItems = items.filter((i) => Number(i.item_type) === 2);

        // 1. CREATE ESTIMATE ITEMS

        if (manualItems.length > 0) {
            await dispatch(
                createEstimateItems(
                    manualItems.map((i) => ({
                        material_estimate_id,
                        material_id: i.material_id,
                        quantity_planned: i.quantity,
                        price: i.price,
                        currency: i.currency,
                        currency_rate: i.currency_rate,
                        item_type: i.item_type, //материал или услуга
                        entry_type: 2, //дополнительно
                        stage_id: null,
                        subsection_id: null,
                        coefficient: 1,
                        comment: '',
                    })),
                ),
            ).unwrap();
        }

        // 2. UPDATE MATERIAL REQUEST ITEMS

        if (manualItems.length > 0) {
            await dispatch(
                updateMaterialRequest({
                    id: requestId,
                    items: manualItems.map((i) => ({
                        id: i.id,
                        price: i.price,
                        currency: i.currency,
                        currency_rate: i.currency_rate,
                    })),
                }),
            ).unwrap();
        }

        // 3. SIGN

        await dispatch(
            signMaterialRequest({
                id: requestId,
                role_id,
                userId,
            }),
        ).unwrap();
    } catch (e: any) {
        return rejectWithValue(e.message);
    }
});
