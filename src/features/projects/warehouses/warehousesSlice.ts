import type { Pagination } from '@/features/users/userSlice';
import { apiRequest } from '@/utils/apiRequest';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

//TYPES
export interface WarehouseItem {
    id: number;
    warehouse_id: number;
    material_id: number;
    material_type: number;
    unit_of_measure: number;
    quantity: number;
    min: number;
    max: number;
    created_at: string;
    updated_at: string;
    deleted: boolean;
}

export interface Warehouse {
    id: number;
    project_id: number;
    name: string;
    code: string;
    address: string;
    manager_id: number;
    phone: string;
    created_at: string;
    updated_at: string;
    deleted: boolean;
    items: WarehouseItem[];
}
export interface WarehouseForm {
    name: string;
    code: string;
    address: string;
    manager_id: number | null;
    phone: string | null;
}
export type WarehouseFormData = Omit<
    Warehouse,
    'id' | 'project_id' | 'items' | 'created_at' | 'updated_at' | 'deleted'
>;

interface WarehousesState {
    data: Warehouse[];
    map: Record<number, Warehouse>;
    pagination: Pagination | null;
    loading: boolean;
    error: string | null;
}

//INITIAL
const initialState: WarehousesState = {
    data: [],
    map: {},
    pagination: null,
    loading: false,
    error: null,
};

//THUNKS
//GET
export const fetchWarehouses = createAsyncThunk(
    'warehouses/fetch',
    async (params: { project_id: number; page?: number; size?: number }, { rejectWithValue }) => {
        try {
            return await apiRequest<Warehouse[]>('/warehouses/search', 'POST', params);
        } catch (e: any) {
            return rejectWithValue(e.message);
        }
    },
);

//CREATE
export const createWarehouse = createAsyncThunk(
    'warehouses/create',
    async (
        { project_id, data }: { project_id: number; data: Partial<Warehouse> },
        { rejectWithValue },
    ) => {
        try {
            return await apiRequest<Warehouse>('/warehouses/create', 'POST', {
                ...data,
                project_id,
            });
        } catch (e: any) {
            return rejectWithValue(e.message);
        }
    },
);

// UPDATE
export const updateWarehouse = createAsyncThunk(
    'warehouses/update',
    async ({ id, data }: { id: number; data: Partial<Warehouse> }, { rejectWithValue }) => {
        try {
            return await apiRequest<Warehouse>(`/warehouses/update/${id}`, 'PUT', data);
        } catch (e: any) {
            return rejectWithValue(e.message);
        }
    },
);

//DELETE
export const deleteWarehouse = createAsyncThunk(
    'warehouses/delete',
    async (id: number, { rejectWithValue }) => {
        try {
            await apiRequest(`/warehouses/delete/${id}`, 'DELETE');
            return id; // важно вернуть id
        } catch (e: any) {
            return rejectWithValue(e.message);
        }
    },
);

//SLICE
const warehousesSlice = createSlice({
    name: 'warehouses',
    initialState,
    reducers: {},

    extraReducers: (builder) => {
        builder

            //FETCH
            .addCase(fetchWarehouses.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchWarehouses.fulfilled, (state, action) => {
                state.loading = false;

                const data = action.payload.data;

                state.data = data;
                state.map = Object.fromEntries(data.map((w) => [w.id, w]));
                state.pagination = action.payload.pagination || null;
            })
            .addCase(fetchWarehouses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            //CREATE
            .addCase(createWarehouse.fulfilled, (state, action) => {
                const item = action.payload.data;

                state.data.unshift(item);
                state.map[item.id] = item;
            })

            //UPDATE
            .addCase(updateWarehouse.fulfilled, (state, action) => {
                const updated = action.payload.data;

                state.map[updated.id] = updated;
                state.data = state.data.map((w) => (w.id === updated.id ? updated : w));
            })

            //DELETE
            .addCase(deleteWarehouse.fulfilled, (state, action) => {
                const id = action.payload;

                delete state.map[id];
                state.data = state.data.filter((w) => w.id !== id);
            });
    },
});

export default warehousesSlice.reducer;
