import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiRequest } from '@/utils/apiRequest';
import type { Pagination } from '@/features/users/userSlice';
const API_URL = import.meta.env.VITE_BASE_URL;

// types.ts
export interface MaterialRequestItems {
    id: number;
    material_type: number;
    material_id: number;
    unit_of_measure: number;
    quantity: number;
    price: number | null;
    summ: number | null;
    comment: string | null;
    currency: number | null;
    material_request_id: number;
    status: number;
    created_at: string;
    updated_at: string;
    deleted: boolean;
    total_ordered: number;
    remaining_quantity: number;
}

export interface PurchasingAgentSearchResponse {
    success: boolean;
    data: MaterialRequestItems[];
    pagination: Pagination;
}

interface SearchParams {
    project_id?: number;
    material_type?: number;
    material_id?: number;
    page?: number;
    size?: number;
    // status?: number;
}

interface PurchasingAgentState {
    items: MaterialRequestItems[];
    pagination: Pagination | null;
    loading: boolean;
    error: string | null;
}

const initialState: PurchasingAgentState = {
    items: [],
    pagination: null,
    loading: false,
    error: null,
};

export interface PurchasingAgentSearchResponse {
    success: boolean;
    data: MaterialRequestItems[];
    pagination: Pagination;
}

interface SearchParams {
    project_id?: number;
    material_type?: number;
    material_id?: number;
    page?: number;
    size?: number;
    // status?: number;
}

export const fetchPurchasingAgentItems = createAsyncThunk<
    PurchasingAgentSearchResponse,
    SearchParams | void
>('materialRequestItems/purchasingAgentSearch', async (params, { rejectWithValue }) => {
    try {
        const response = await apiRequest(
            `${API_URL}/materialRequestItems/purchasingAgentSearch`,
            'POST',
            params
        );
        console.log('');
        return response;
    } catch (error: any) {
        return rejectWithValue(error.response?.data || 'Ошибка загрузки');
    }
});

const materialRequestItemsSlice = createSlice({
    name: 'materialRequestItems',
    initialState,
    reducers: {
        clearPurchasingAgentItems(state) {
            state.items = [];
            state.pagination = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPurchasingAgentItems.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPurchasingAgentItems.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchPurchasingAgentItems.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearPurchasingAgentItems } = materialRequestItemsSlice.actions;

export default materialRequestItemsSlice.reducer;
