import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '@/utils/apiRequest';
import type { Pagination } from '@/features/users/userSlice';
import type { MaterialEstimateItem } from './estimateItems/materialEstimateItemsSlice';

/* ================= TYPES ================= */
export interface MaterialEstimate {
    id: number;
    block_id: number;
    planned_budget: number | null;
    total_area: number | null;
    sale_area: number | null;
    status: number | null;
    created_user_id: number;
    approved_user_id: number | null;
    approved_at: string | null;
    created_at?: string;
    updated_at?: string;
    deleted: boolean;

    items: MaterialEstimateItem[];

    total_price_material: number;
    total_price_service: number;
    total_price: number;
}

export interface MaterialEstimateFormData {
    block_id: number;
    planned_budget?: number | null;
    total_area?: number | null;
    sale_area?: number | null;
    status?: number;
}

/* ================= SEARCH PARAMS ================= */

interface FetchMaterialEstimatesParams {
    block_id: number;
    status?: number;
    page: number;
    size: number;
}

/* ================= STATE ================= */

interface MaterialEstimatesState {
    data: MaterialEstimate[];
    pagination: Pagination | null;
    loading: boolean;
    error: string | null;
}

const initialState: MaterialEstimatesState = {
    data: [],
    pagination: null,
    loading: false,
    error: null,
};

/* ================= SEARCH ================= */

export const fetchMaterialEstimates = createAsyncThunk<
    { data: MaterialEstimate[]; pagination?: Pagination },
    FetchMaterialEstimatesParams,
    { rejectValue: string }
>('materialEstimates/search', async (params, { rejectWithValue }) => {
    try {
        const res = await apiRequest<MaterialEstimate[]>(
            '/materialEstimates/search',
            'POST',
            params,
        );

        return {
            data: res.data,
            pagination: res.pagination ?? undefined,
        };
    } catch (err: any) {
        return rejectWithValue(err.message || 'Ошибка загрузки смет');
    }
});

/* ================= CREATE ================= */

export const createMaterialEstimate = createAsyncThunk<
    MaterialEstimate,
    MaterialEstimateFormData,
    { rejectValue: string }
>('materialEstimates/create', async (data, { rejectWithValue }) => {
    try {
        const res = await apiRequest<MaterialEstimate>('/materialEstimates/create', 'POST', data);
        return res.data;
    } catch (err: any) {
        return rejectWithValue(err.message || 'Ошибка создания сметы');
    }
});

/* ================= UPDATE ================= */

export const updateMaterialEstimate = createAsyncThunk<
    MaterialEstimate,
    { id: number; data: MaterialEstimateFormData },
    { rejectValue: string }
>('materialEstimates/update', async ({ id, data }, { rejectWithValue }) => {
    try {
        const res = await apiRequest<MaterialEstimate>(
            `/materialEstimates/update/${id}`,
            'PUT',
            data,
        );
        return res.data;
    } catch (err: any) {
        return rejectWithValue(err.message || 'Ошибка обновления сметы');
    }
});

/* ================= DELETE ================= */

export const deleteMaterialEstimate = createAsyncThunk<number, number, { rejectValue: string }>(
    'materialEstimates/delete',
    async (id, { rejectWithValue }) => {
        try {
            await apiRequest(`/materialEstimates/delete/${id}`, 'DELETE');
            return id;
        } catch (err: any) {
            return rejectWithValue(err.message || 'Ошибка удаления сметы');
        }
    },
);

/* ================= SLICE ================= */

const materialEstimatesSlice = createSlice({
    name: 'materialEstimates',
    initialState,
    reducers: {
        clearMaterialEstimates: (state) => {
            state.data = [];
            state.pagination = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder

            /* SEARCH */
            .addCase(fetchMaterialEstimates.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMaterialEstimates.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.data;
                state.pagination = action.payload.pagination ?? null;
            })
            .addCase(fetchMaterialEstimates.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Ошибка загрузки';
            })

            /* CREATE */
            .addCase(createMaterialEstimate.fulfilled, (state, action) => {
                state.data.unshift(action.payload);
                if (state.pagination) {
                    state.pagination.total += 1;
                }
            })

            /* UPDATE */
            .addCase(updateMaterialEstimate.fulfilled, (state, action) => {
                const index = state.data.findIndex((m) => m.id === action.payload.id);
                if (index !== -1) {
                    state.data[index] = action.payload;
                }
            })

            /* DELETE */
            .addCase(deleteMaterialEstimate.fulfilled, (state, action) => {
                state.data = state.data.filter((m) => m.id !== action.payload);
                if (state.pagination) {
                    state.pagination.total -= 1;
                }
            });
    },
});

export const { clearMaterialEstimates } = materialEstimatesSlice.actions;

export default materialEstimatesSlice.reducer;
