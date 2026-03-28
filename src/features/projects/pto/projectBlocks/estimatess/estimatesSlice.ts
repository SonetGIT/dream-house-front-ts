import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '@/utils/apiRequest';
import type { Pagination } from '@/features/users/userSlice';
import type { EstimateItem } from './estimateItems/estimateItemsSlice';

/* ================= TYPES ================= */
export interface Estimate {
    id: number;
    block_id: number;
    name: string;
    status: number | null;
    created_user_id: number;
    approved_user_id: number | null;
    approved_at: string | null;
    created_at?: string;
    updated_at?: string;
    deleted: boolean;

    items: EstimateItem[];
}

export interface EstimateFormData {
    block_id: number;
    status?: number;
    name: string;
}

/* ================= SEARCH PARAMS ================= */
interface FetchEstimatesParams {
    block_id: number;
    status?: number;
    page: number;
    size: number;
}

/* ================= STATE ================= */

interface EstimatesState {
    data: Estimate[];
    pagination: Pagination | null;
    loading: boolean;
    error: string | null;
}

const initialState: EstimatesState = {
    data: [],
    pagination: null,
    loading: false,
    error: null,
};

/* ================= SEARCH ================= */

export const fetchEstimates = createAsyncThunk<
    { data: Estimate[]; pagination?: Pagination },
    FetchEstimatesParams,
    { rejectValue: string }
>('estimates/search', async (params, { rejectWithValue }) => {
    try {
        const res = await apiRequest<Estimate[]>('/materialEstimates/search', 'POST', params);

        return {
            data: res.data,
            pagination: res.pagination ?? undefined,
        };
    } catch (err: any) {
        return rejectWithValue(err.message || 'Ошибка загрузки смет');
    }
});

/* ================= CREATE ================= */
export const createEstimate = createAsyncThunk<Estimate, EstimateFormData, { rejectValue: string }>(
    'estimates/create',
    async (data, { rejectWithValue }) => {
        try {
            const res = await apiRequest<Estimate>('/materialEstimates/create', 'POST', data);
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.message || 'Ошибка создания сметы');
        }
    },
);

/* ================= UPDATE ================= */
export const updateEstimate = createAsyncThunk<
    Estimate,
    { id: number; data: EstimateFormData },
    { rejectValue: string }
>('estimates/update', async ({ id, data }, { rejectWithValue }) => {
    try {
        const res = await apiRequest<Estimate>(`/materialEstimates/update/${id}`, 'PUT', data);
        return res.data;
    } catch (err: any) {
        return rejectWithValue(err.message || 'Ошибка обновления сметы');
    }
});

/* ================= DELETE ================= */
export const deleteEstimate = createAsyncThunk<number, number, { rejectValue: string }>(
    'estimates/delete',
    async (id, { rejectWithValue }) => {
        try {
            await apiRequest(`/materialEstimates/delete/${id}`, 'DELETE');
            console.log('id', id);
            return id;
        } catch (err: any) {
            return rejectWithValue(err.message || 'Ошибка удаления сметы');
        }
    },
);

/* ================= SLICE ================= */
const estimatesSlice = createSlice({
    name: 'estimates',
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
            .addCase(fetchEstimates.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchEstimates.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.data;
                state.pagination = action.payload.pagination ?? null;
            })
            .addCase(fetchEstimates.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Ошибка загрузки';
            })

            /* CREATE */
            .addCase(createEstimate.fulfilled, (state, action) => {
                state.data.unshift(action.payload);
                if (state.pagination) {
                    state.pagination.total += 1;
                }
            })

            /* UPDATE */
            .addCase(updateEstimate.fulfilled, (state, action) => {
                const index = state.data.findIndex((m) => m.id === action.payload.id);
                if (index !== -1) {
                    state.data[index] = action.payload;
                }
            })

            /* DELETE */
            .addCase(deleteEstimate.fulfilled, (state, action) => {
                state.data = state.data.filter((m) => m.id !== action.payload);
                if (state.pagination) {
                    state.pagination.total -= 1;
                }
            });
    },
});

export const { clearMaterialEstimates } = estimatesSlice.actions;

export default estimatesSlice.reducer;
