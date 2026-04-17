import type { Pagination } from '@/features/users/userSlice';
import { apiRequest } from '@/utils/apiRequest';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

//TYPES
export interface MaterialShort {
    id: number;
    name: string;
}

export interface WarehouseItem {
    id: number;
    warehouse_id: number;
    material_type: number | null;
    material_id: number | null;
    unit_of_measure: number | null;
    quantity: number;
    min: number;
    max: number;
    created_at: string;
    updated_at: string;
    deleted: boolean;
}

interface WarehouseItemsState {
    list: WarehouseItem[];
    map: Record<number, WarehouseItem>;
    pagination: Pagination | null;
    loading: boolean;
    error: string | null;
}

// INITIAL
const initialState: WarehouseItemsState = {
    list: [],
    map: {},
    pagination: null,
    loading: false,
    error: null,
};

// THUNKS
export const fetchWarehouseItems = createAsyncThunk(
    'warehouseStocks/fetch',
    async (params: { warehouse_id: number; page?: number; size?: number }, { rejectWithValue }) => {
        try {
            return await apiRequest<WarehouseItem[]>('/warehouseStocks/search', 'POST', params);
        } catch (e: any) {
            return rejectWithValue(e.message);
        }
    },
);

//CREATE
export const createWarehouseItem = createAsyncThunk(
    'warehouseStocks/create',
    async (payload: Partial<WarehouseItem>, { rejectWithValue }) => {
        try {
            return await apiRequest<WarehouseItem>('/warehouseStocks/create', 'POST', payload);
        } catch (e: any) {
            return rejectWithValue(e.message);
        }
    },
);

//UPDATE
export const updateWarehouseItem = createAsyncThunk(
    'warehouseStocks/update',
    async ({ id, data }: { id: number; data: Partial<WarehouseItem> }, { rejectWithValue }) => {
        try {
            return await apiRequest<WarehouseItem>(`/warehouseStocks/update/${id}`, 'PUT', data);
        } catch (e: any) {
            return rejectWithValue(e.message);
        }
    },
);

//DELETE
export const deleteWarehouseItem = createAsyncThunk(
    'warehouseStocks/delete',
    async (id: number, { rejectWithValue }) => {
        try {
            await apiRequest(`/warehouseStocks/delete/${id}`, 'DELETE');
            return id;
        } catch (e: any) {
            return rejectWithValue(e.message);
        }
    },
);

// SLICE
const warehouseItemsSlice = createSlice({
    name: 'warehouseStocks',
    initialState,
    reducers: {
        //локальное обновление (очень полезно для UI)
        updateItemLocally: (state, action) => {
            const item = action.payload as WarehouseItem;
            state.map[item.id] = item;
            state.list = state.list.map((i) => (i.id === item.id ? item : i));
        },

        //очистка (например при смене склада)
        clearItems: (state) => {
            state.list = [];
            state.map = {};
            state.pagination = null;
        },
    },

    extraReducers: (builder) => {
        builder

            //FETCH
            .addCase(fetchWarehouseItems.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchWarehouseItems.fulfilled, (state, action) => {
                state.loading = false;

                const list = action.payload.data;

                state.list = list;
                state.map = Object.fromEntries(list.map((i) => [i.id, i]));
                state.pagination = action.payload.pagination || null;
            })
            .addCase(fetchWarehouseItems.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            //CREATE
            .addCase(createWarehouseItem.fulfilled, (state, action) => {
                const item = action.payload.data;

                state.list.unshift(item);
                state.map[item.id] = item;
            })

            //UPDATE
            .addCase(updateWarehouseItem.fulfilled, (state, action) => {
                const updated = action.payload.data;

                state.map[updated.id] = updated;
                state.list = state.list.map((i) => (i.id === updated.id ? updated : i));
            })

            //DELETE
            .addCase(deleteWarehouseItem.fulfilled, (state, action) => {
                const id = action.payload;

                delete state.map[id];
                state.list = state.list.filter((i) => i.id !== id);
            });
    },
});

export const { updateItemLocally, clearItems } = warehouseItemsSlice.actions;

export default warehouseItemsSlice.reducer;
