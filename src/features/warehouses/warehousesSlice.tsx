// warehousesSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '@/utils/apiRequest'; // твоя функция fetch wrapper
const API_URL = import.meta.env.VITE_BASE_URL;
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
interface WarehousesState {
    data: Warehouse[];
    pagination?: { total: number };
    loading: boolean;
    error: string | null;
}

const initialState: WarehousesState = {
    data: [],
    pagination: undefined,
    loading: false,
    error: null,
};

export const fetchWarehouses = createAsyncThunk<
    { data: Warehouse[]; pagination?: { total: number } },
    void,
    { rejectValue: string }
>('warehouses/fetchWarehouses', async (_, { rejectWithValue }) => {
    try {
        const url = `${API_URL}/warehouses/gets`;
        const res = await apiRequest(url, 'GET');
        return {
            data: res.data,
            pagination: res.pagination,
        };
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || err.message);
    }
});

export const warehousesSlice = createSlice({
    name: 'warehouses',
    initialState,
    reducers: {
        clearWarehouses: (state) => {
            state.data = [];
            state.loading = false;
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
                state.error = action.payload || 'Ошибка при загрузке складов';
            });
    },
});

export const { clearWarehouses } = warehousesSlice.actions;
export default warehousesSlice.reducer;
