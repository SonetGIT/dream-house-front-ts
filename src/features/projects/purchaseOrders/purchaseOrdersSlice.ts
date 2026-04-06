import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '@/utils/apiRequest';
import type { Pagination } from '@/features/users/userSlice';
import type { PurchaseOrderItem } from '../purchaseOrderItems/purchaseOrderItemsSlice';

/* TYPES */

// export interface PurchaseOrderItem {
//     id: number;
//     purchase_order_id: number;
//     material_request_item_id: number;
//     material_type: number;
//     material_id: number;
//     quantity: number;
//     unit_of_measure: number;
//     currency: number;
//     currency_rate: number;
//     price: number;
//     summ: number;
//     status: number;
//     delivered_quantity: number;
//     supplier_id: number;
//     material?: {
//         id: number;
//         name: string;
//     };
// }

export interface PurchaseOrder {
    id: number;
    project_id: number;
    block_id: number;
    status: number;
    created_user_id: number;
    created_at: string;
    updated_at: string;
    deleted: boolean;

    project?: { id: number; name: string };
    block?: { id: number; name: string };

    items: PurchaseOrderItem[];
}

/* DTO TYPES */

export interface PurchaseOrderItemPayload {
    material_request_item_id: number;
    material_type: number;
    material_id: number;
    quantity: number;
    unit_of_measure: number;
    currency: number;
    currency_rate: number;
    price: number;
    summ: number;
    supplier_id?: number;
}

export interface CreatePurchaseOrderPayload {
    project_id: number;
    block_id: number;
    status: number;
    created_user_id: number;
    items: PurchaseOrderItemPayload[];
}

export interface UpdatePurchaseOrderPayload {
    project_id?: number;
    block_id?: number;
    status?: number;
    items?: PurchaseOrderItemPayload[];
}

/* STATE */

interface PurchaseOrdersState {
    data: PurchaseOrder[];
    pagination: Pagination | null;
    loading: boolean;
    error: string | null;
}

const initialState: PurchaseOrdersState = {
    data: [],
    pagination: null,
    loading: false,
    error: null,
};

/* ================== THUNKS ================== */

/* FETCH */
export const fetchPurchaseOrders = createAsyncThunk<
    { data: PurchaseOrder[]; pagination: Pagination | null },
    Record<string, any>,
    { rejectValue: string }
>('purchaseOrders/search', async (params, { rejectWithValue }) => {
    try {
        const res = await apiRequest<any>('/purchaseOrders/search', 'POST', params);

        return {
            data: res.data ?? [],
            pagination: res.pagination ?? null,
        };
    } catch (err: any) {
        return rejectWithValue(err.message || 'Ошибка загрузки закупок');
    }
});

/* CREATE */
export const createPurchaseOrder = createAsyncThunk<
    PurchaseOrder,
    CreatePurchaseOrderPayload,
    { rejectValue: string }
>('purchaseOrders/create', async (data, { rejectWithValue }) => {
    try {
        const res = await apiRequest<PurchaseOrder>('/purchaseOrders/create', 'POST', data);
        return res.data;
    } catch (err: any) {
        return rejectWithValue(err.message || 'Ошибка создания');
    }
});

/* UPDATE */
export const updatePurchaseOrder = createAsyncThunk<
    PurchaseOrder,
    { id: number; data: UpdatePurchaseOrderPayload },
    { rejectValue: string }
>('purchaseOrders/update', async ({ id, data }, { rejectWithValue }) => {
    try {
        const res = await apiRequest<PurchaseOrder>(`/purchaseOrders/update/${id}`, 'PUT', data);
        return res.data;
    } catch (err: any) {
        return rejectWithValue(err.message || 'Ошибка обновления');
    }
});

/* DELETE */
export const deletePurchaseOrder = createAsyncThunk<number, number, { rejectValue: string }>(
    'purchaseOrders/delete',
    async (id, { rejectWithValue }) => {
        try {
            await apiRequest(`/purchaseOrders/delete/${id}`, 'DELETE');
            return id;
        } catch (err: any) {
            return rejectWithValue(err.message || 'Ошибка удаления');
        }
    },
);

/* ================== SLICE ================== */

const purchaseOrdersSlice = createSlice({
    name: 'purchaseOrders',
    initialState,
    reducers: {
        clearPurchaseOrders: (state) => {
            state.data = [];
            state.pagination = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder

            /* FETCH */
            .addCase(fetchPurchaseOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPurchaseOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchPurchaseOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Ошибка загрузки';
            })

            /* CREATE */
            .addCase(createPurchaseOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createPurchaseOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.data.unshift(action.payload);

                if (state.pagination) {
                    state.pagination.total += 1;
                }
            })
            .addCase(createPurchaseOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Ошибка создания';
            })

            /* UPDATE */
            .addCase(updatePurchaseOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updatePurchaseOrder.fulfilled, (state, action) => {
                state.loading = false;

                const index = state.data.findIndex((o) => o.id === action.payload.id);
                if (index !== -1) {
                    state.data[index] = action.payload;
                }
            })
            .addCase(updatePurchaseOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Ошибка обновления';
            })

            /* DELETE */
            .addCase(deletePurchaseOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deletePurchaseOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.data = state.data.filter((o) => o.id !== action.payload);

                if (state.pagination) {
                    state.pagination.total -= 1;
                }
            })
            .addCase(deletePurchaseOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Ошибка удаления';
            });
    },
});

export const { clearPurchaseOrders } = purchaseOrdersSlice.actions;

export default purchaseOrdersSlice.reducer;
