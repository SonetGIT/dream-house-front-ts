import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '@/utils/apiRequest';
import type { Pagination } from '@/features/users/userSlice';

/* TYPES */
export interface PurchaseOrderItem {
    id: number;
    purchase_order_id: number;
    material_request_item_id: number;
    material_type: number;
    material_id: number;
    quantity: number;
    unit_of_measure: number;
    currency: number;
    currency_rate: number;
    price: number;
    summ: number;
    status: number;
    delivered_quantity: number;
    supplier_id: number;
    created_at: string;
    updated_at: string;
    deleted: boolean;
    material?: {
        id: number;
        name: string;
    };
}

/* RECEIVE (очень важно для тебя) */
export interface ReceivePurchaseOrderItemPayload {
    purchase_order_item_id: number;
    received_quantity: number;
    comment?: string;
}

export interface ReceivePurchaseOrderItemsPayload {
    warehouse_id: number;
    items: ReceivePurchaseOrderItemPayload[];
}
/* STATE */
interface PurchaseOrderItemsState {
    data: PurchaseOrderItem[];
    pagination: Pagination | null;
    loading: boolean;
    error: string | null;
}

const initialState: PurchaseOrderItemsState = {
    data: [],
    pagination: null,
    loading: false,
    error: null,
};

/*THUNKS*/

/* FETCH */
export const fetchPurchaseOrderItems = createAsyncThunk<
    { data: PurchaseOrderItem[]; pagination: Pagination | null },
    any,
    { rejectValue: string }
>('purchaseOrderItems/search', async (params, { rejectWithValue }) => {
    try {
        const res = await apiRequest<any>('/purchaseOrderItems/search', 'POST', params);

        return {
            data: res.data ?? [],
            pagination: res.pagination ?? null,
        };
    } catch (err: any) {
        return rejectWithValue(err.message || 'Ошибка загрузки элементов');
    }
});

/* CREATE */
export const createPurchaseOrderItem = createAsyncThunk<
    PurchaseOrderItem,
    Partial<PurchaseOrderItem>,
    { rejectValue: string }
>('purchaseOrderItems/create', async (data, { rejectWithValue }) => {
    try {
        const res = await apiRequest<PurchaseOrderItem>('/purchaseOrderItems/create', 'POST', data);

        return res.data;
    } catch (err: any) {
        return rejectWithValue(err.message || 'Ошибка создания');
    }
});

/* UPDATE */
export const updatePurchaseOrderItem = createAsyncThunk<
    PurchaseOrderItem,
    { id: number; data: Partial<PurchaseOrderItem> },
    { rejectValue: string }
>('purchaseOrderItems/update', async ({ id, data }, { rejectWithValue }) => {
    try {
        const res = await apiRequest<PurchaseOrderItem>(
            `/purchaseOrderItems/update/${id}`,
            'PUT',
            data,
        );

        return res.data;
    } catch (err: any) {
        return rejectWithValue(err.message || 'Ошибка обновления');
    }
});

/* DELETE */
export const deletePurchaseOrderItem = createAsyncThunk<number, number, { rejectValue: string }>(
    'purchaseOrderItems/delete',
    async (id, { rejectWithValue }) => {
        try {
            await apiRequest(`/purchaseOrderItems/delete/${id}`, 'DELETE');
            return id;
        } catch (err: any) {
            return rejectWithValue(err.message || 'Ошибка удаления');
        }
    },
);

/* RECEIVE */
export const receivePurchaseOrderItems = createAsyncThunk<
    PurchaseOrderItem[],
    ReceivePurchaseOrderItemsPayload,
    { rejectValue: string }
>('purchaseOrderItems/receive', async (payload, { rejectWithValue }) => {
    try {
        const res = await apiRequest<PurchaseOrderItem[]>(
            '/purchaseOrderItems/receive',
            'POST',
            payload,
        );

        return res.data;
    } catch (err: any) {
        return rejectWithValue(err.message || 'Ошибка приёмки');
    }
});

/*SLICE*/

const purchaseOrderItemsSlice = createSlice({
    name: 'purchaseOrderItems',
    initialState,
    reducers: {
        clearPurchaseOrderItems: (state) => {
            state.data = [];
            state.pagination = null;
            state.error = null;
        },
    },

    extraReducers: (builder) => {
        builder

            /* FETCH */
            .addCase(fetchPurchaseOrderItems.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPurchaseOrderItems.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchPurchaseOrderItems.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Ошибка загрузки';
            })

            /* CREATE */
            .addCase(createPurchaseOrderItem.fulfilled, (state, action) => {
                state.data.unshift(action.payload);

                if (state.pagination) {
                    state.pagination.total += 1;
                }
            })

            /* UPDATE */
            .addCase(updatePurchaseOrderItem.fulfilled, (state, action) => {
                const index = state.data.findIndex((i) => i.id === action.payload.id);

                if (index !== -1) {
                    state.data[index] = action.payload;
                }
            })

            /* DELETE */
            .addCase(deletePurchaseOrderItem.fulfilled, (state, action) => {
                state.data = state.data.filter((i) => i.id !== action.payload);

                if (state.pagination) {
                    state.pagination.total -= 1;
                }
            })

            /* RECEIVE */
            /* RECEIVE */
            .addCase(receivePurchaseOrderItems.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(receivePurchaseOrderItems.fulfilled, (state, action) => {
                state.loading = false;

                const updatedItems = action.payload ?? [];

                updatedItems.forEach((updated) => {
                    const index = state.data.findIndex((i) => i.id === updated.id);

                    if (index !== -1) {
                        state.data[index] = updated;
                    } else {
                        state.data.unshift(updated);
                    }
                });
            })
            .addCase(receivePurchaseOrderItems.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Ошибка приёмки';
            });
    },
});

export const { clearPurchaseOrderItems } = purchaseOrderItemsSlice.actions;

export default purchaseOrderItemsSlice.reducer;
