import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { Pagination } from '@/features/users/userSlice';
import { apiRequestNew, type ApiResponse } from '@/utils/apiRequestNew';

/* TYPES */
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
}

interface WarehousesSearchParams {
    project_id: number;
    manager_id?: number;
    name?: string;
    page?: number;
    size?: number;
}

interface WarehousesState {
    data: Warehouse[];
    pagination: Pagination | null;
    loading: boolean;
    error: string | null;
}

/* INITIAL STATE */
const initialState: WarehousesState = {
    data: [],
    pagination: null,
    loading: false,
    error: null,
};

/* THUNK */
export const fetchWarehouses = createAsyncThunk<
    ApiResponse<Warehouse[]>,
    WarehousesSearchParams,
    { rejectValue: string }
>('suppliers/search', async (params, { rejectWithValue }) => {
    try {
        return await apiRequestNew<Warehouse[]>('/warehouses/search', 'POST', params);
    } catch (error: any) {
        return rejectWithValue(error.message || 'Ошибка загрузки движений');
    }
});

/* SLICE */
const warehousesSlice = createSlice({
    name: 'warehouses',
    initialState,
    reducers: {
        clearWarehouses(state) {
            state.data = [];
            state.pagination = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchWarehouses.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchWarehouses.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchWarehouses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearWarehouses } = warehousesSlice.actions;
export default warehousesSlice.reducer;
