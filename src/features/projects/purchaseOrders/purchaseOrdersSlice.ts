import type { Pagination } from '@/features/users/userSlice';
import { apiRequest } from '@/utils/apiRequest';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
const API_URL = import.meta.env.VITE_BASE_URL;

// payload для создания заказа
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
    delivered_quantity: number;
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
export const createPurchaseOrder = createAsyncThunk(
    'purchaseOrders/create',
    async (payload: PurchaseOrderCreatePayload, { rejectWithValue }) => {
        console.log('PAYLOAD', payload);
        try {
            const res = await apiRequest(`${API_URL}/purchaseOrders/create`, 'POST', payload);
            return res;
        } catch (err: any) {
            return rejectWithValue(err.response?.data || 'Ошибка создания заказа');
        }
    }
);

//AsyncThunk для поиска / фильтрации заявок
export const fetchPurchaseOrders = createAsyncThunk(
    'purchaseOrders/fetch',
    async (
        params: {
            project_id?: number;
            supplier_id?: number;
            created_user_id?: number;
            status?: number;
            page: number;
            size: number;
        },
        { rejectWithValue }
    ) => {
        try {
            const response = await apiRequest(`${API_URL}/purchaseOrders/search`, 'POST', params);

            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || 'Ошибка загрузки');
        }
    }
);

//SLICE
const purchaseOrdersSlice = createSlice({
    name: 'purchaseOrders',
    initialState,
    reducers: {
        resetPurchaseOrderState: (state) => {
            state.loading = false;
            state.error = null;
            state.success = false;
        },
    },
    extraReducers: (builder) => {
        builder
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
                state.error = action.payload as string;
            })

            //fetchPurchaseOrders
            .addCase(fetchPurchaseOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPurchaseOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.data || [];
                state.pagination = action.payload.pagination || null;
            })
            .addCase(fetchPurchaseOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Ошибка при загрузке заявок';
            });
    },
});

export const { resetPurchaseOrderState } = purchaseOrdersSlice.actions;
export default purchaseOrdersSlice.reducer;
