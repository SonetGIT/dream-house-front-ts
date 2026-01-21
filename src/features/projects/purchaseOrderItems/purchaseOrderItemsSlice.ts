import { createAsyncThunk } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { apiRequest } from '@/utils/apiRequest';
import type { PurchaseOrderItem } from '../purchaseOrders/purchaseOrdersSlice';
const API_URL = import.meta.env.VITE_BASE_URL;

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

//Исправлено: правильное написание (но лучше "received")
export type ReceiveItemPayload = {
    purchase_order_item_id: number;
    received_quantity: number;
    comment?: string;
};
export const receivePurchaseOrderItems = createAsyncThunk(
    'purchaseOrderItems/receive',
    async (
        payload: {
            warehouse_id: number;
            items: {
                purchase_order_item_id: number;
                received_quantity: number;
                comment?: string;
            }[];
        },
        { rejectWithValue }
    ) => {
        try {
            console.log('payload', payload);
            // const response = await apiRequest(`${API_URL}/materialRequests/search`, 'POST', body);
            const res = await apiRequest(`${API_URL}/purchaseOrderItems/receive`, 'POST', payload);
            console.log('res', res);
            return res;
        } catch (err: any) {
            return rejectWithValue(err || err.message);
        }
    }
);

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
                if (Array.isArray(action.payload)) {
                    state.items = action.payload;
                }
            })

            .addCase(receivePurchaseOrderItems.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { setPurchaseOrderItems, clearPurchaseOrderItems } = purchaseOrderItemsSlice.actions;

export default purchaseOrderItemsSlice.reducer;
