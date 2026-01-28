import type { Pagination } from '@/features/users/userSlice';
import { apiRequest } from '@/utils/apiRequest';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

export interface PurchaseOrderItemPayload {
    material_request_item_id: number | string;
    material_type: number;
    material_id: number;
    unit_of_measure: number;
    quantity: number;
    price: number | null;
    summ: number | null;
}

export interface PurchaseOrderCreatePayload {
    project_id: number;
    supplier_id: number | string | null;
    created_user_id: number;
    comment?: string;
    items: PurchaseOrderItemPayload[];
}
export interface PurchaseOrderItem {
    id: number;
    purchase_order_id: number;
    material_request_item_id: number;
    material_type: number;
    material_id: number;
    quantity: number;
    unit_of_measure: number;
    price: number;
    summ: number;
    status: number;
    comment?: string;
    delivered_quantity: number;
    received_quantity: number;
    created_at: string;
    updated_at: string;
    deleted: boolean;
}

export interface PurchaseOrder {
    id: number;
    project_id: number;
    supplier_id: number;
    status: number;
    created_user_id: number;
    created_at: string;
    updated_at: string;
    deleted: boolean;
    items: PurchaseOrderItem[];
}

//TYPE FOR SLICE
interface PurchaseOrdersState {
    data: PurchaseOrder[];
    pagination: Pagination | null;
    loading: boolean;
    error: string | null;
    success: boolean;
}

const initialState: PurchaseOrdersState = {
    data: [],
    pagination: null,
    loading: false,
    error: null,
    success: false,
};

//THUNK
export const fetchPurchaseOrders = createAsyncThunk<
    {
        data: PurchaseOrder[];
        pagination?: Pagination;
    },
    {
        project_id?: number;
        supplier_id?: number;
        created_user_id?: number;
        status?: number;
        page: number;
        size: number;
    },
    { rejectValue: string }
>('purchaseOrders/fetch', async (params, { rejectWithValue }) => {
    try {
        return await apiRequest<PurchaseOrder[]>('/purchaseOrders/search', 'POST', params);
    } catch (error: any) {
        return rejectWithValue(error.message || 'Ошибка загрузки');
    }
});

export const createPurchaseOrder = createAsyncThunk<
    PurchaseOrder,
    PurchaseOrderCreatePayload,
    { rejectValue: string }
>('purchaseOrders/create', async (payload, { rejectWithValue }) => {
    try {
        const res = await apiRequest<PurchaseOrder>('/purchaseOrders/create', 'POST', payload);

        return res.data;
    } catch (err: any) {
        return rejectWithValue(err.message || 'Ошибка создания заказа');
    }
});

//SLICE
const purchaseOrdersSlice = createSlice({
    name: 'purchaseOrders',
    initialState,
    reducers: {
        resetPurchaseOrderState(state) {
            state.loading = false;
            state.error = null;
            state.success = false;
        },
    },
    extraReducers: (builder) => {
        builder
            // CREATE
            .addCase(createPurchaseOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(createPurchaseOrder.fulfilled, (state) => {
                state.loading = false;
                state.success = true;
            })
            .addCase(createPurchaseOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Ошибка создания заказа';
            })

            // FETCH
            .addCase(fetchPurchaseOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPurchaseOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.data;
                state.pagination = action.payload.pagination ?? null;
            })
            .addCase(fetchPurchaseOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Ошибка при загрузке заявок';
            });
    },
});

export const { resetPurchaseOrderState } = purchaseOrdersSlice.actions;
export default purchaseOrdersSlice.reducer;
