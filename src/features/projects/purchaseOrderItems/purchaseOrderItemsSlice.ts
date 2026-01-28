import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiRequest } from '@/utils/apiRequest';
import type { PurchaseOrderItem } from '../purchaseOrders/purchaseOrdersSlice';

interface PurchaseOrderItemsState {
    items: PurchaseOrderItem[];
    loading: boolean;
    error: string | null;
}

const initialState: PurchaseOrderItemsState = {
    items: [],
    loading: false,
    error: null,
};

// payload для приёмки
export type ReceiveItemPayload = {
    purchase_order_item_id: number;
    received_quantity: number;
    comment?: string;
};

export const receivePurchaseOrderItems = createAsyncThunk<
    PurchaseOrderItem[],
    {
        warehouse_id: number;
        items: ReceiveItemPayload[];
    },
    { rejectValue: string }
>('purchaseOrderItems/receive', async (payload, { rejectWithValue }) => {
    try {
        const res = await apiRequest<PurchaseOrderItem[]>(
            '/purchaseOrderItems/receive',
            'POST',
            payload
        );

        return res.data;
    } catch (err: any) {
        return rejectWithValue(err.message || 'Ошибка при приёмке товаров');
    }
});

const purchaseOrderItemsSlice = createSlice({
    name: 'purchaseOrderItems',
    initialState,
    reducers: {
        setPurchaseOrderItems(state, action) {
            state.items = action.payload;
        },
        clearPurchaseOrderItems(state) {
            state.items = [];
        },
    },
    extraReducers: (builder) => {
        builder
            /* ================= RECEIVE ================= */
            .addCase(receivePurchaseOrderItems.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(receivePurchaseOrderItems.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(receivePurchaseOrderItems.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Ошибка при приёмке';
            });
    },
});

export const { setPurchaseOrderItems, clearPurchaseOrderItems } = purchaseOrderItemsSlice.actions;

export default purchaseOrderItemsSlice.reducer;
