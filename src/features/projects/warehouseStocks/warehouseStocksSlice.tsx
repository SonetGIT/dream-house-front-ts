import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Pagination } from '@/features/users/userSlice';
import { apiRequestNew } from '@/utils/apiRequestNew';

export interface WarehouseStocks {
    id: number;
    warehouse_id: number;
    material_id: number;
    material_type: number;
    unit_of_measure: number;
    quantity: number;
    created_at: string;
    updated_at: string;
    deleted: boolean;
}

interface WarehouseStocksState {
    data: WarehouseStocks[];
    pagination?: Pagination | null;
    loading: boolean;
    error: string | null;
}

const initialState: WarehouseStocksState = {
    data: [],
    pagination: null,
    loading: false,
    error: null,
};

export const fetchWarehouseStocks = createAsyncThunk(
    'warehouseStocks/fetch',
    async (
        params: {
            project_id?: number;
            warehouse_id?: number;
            material_id?: number;
            page: number;
            size: number;
        },
        { rejectWithValue }
    ) => {
        try {
            const response = await apiRequestNew<WarehouseStocks[]>(
                `/warehouseStocks/search`,
                'POST',
                params
            );
            return {
                data: response.data,
                pagination: response.pagination,
            };
        } catch (error: any) {
            return rejectWithValue(error.response?.data || 'Ошибка загрузки');
        }
    }
);

export const warehouseStocksSlice = createSlice({
    name: 'warehouseStocks',
    initialState,
    reducers: {
        clearWarehouseStocks: (state) => {
            state.data = [];
            state.loading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            //fetchPurchaseOrders
            .addCase(fetchWarehouseStocks.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchWarehouseStocks.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.data || [];
                state.pagination = action.payload.pagination || null;
            })
            .addCase(fetchWarehouseStocks.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Ошибка при загрузке заявок';
            });
    },
});

export const { clearWarehouseStocks } = warehouseStocksSlice.actions;
export default warehouseStocksSlice.reducer;
