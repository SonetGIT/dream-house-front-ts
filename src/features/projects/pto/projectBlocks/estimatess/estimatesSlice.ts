import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '@/utils/apiRequest';
import type { Pagination } from '@/features/users/userSlice';
import type { EstimateItem } from './estimateItems/estimateItemsSlice';

/*  TYPES  */
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
    main_engineer_user_id: number | null;
    signed_by_main_engineer: boolean | null;
    signed_by_main_engineer_time: string | null;
    planning_engineer_user_id: number | null;
    signed_by_planning_engineer: boolean | null;
    signed_by_planning_engineer_time: string | null;
    general_director_user_id: number | null;
    signed_by_general_director: boolean | null;
    signed_by_general_director_time: string | null;

    items: EstimateItem[];
}

export interface EstimateFormData {
    block_id: number;
    status?: number;
    name: string;
}

export interface EstimateSearchResponse {
    data: Estimate[];
    pagination?: Pagination;
}

/*  SEARCH PARAMS  */
interface FetchEstimatesParams {
    block_id: number;
    status?: number;
    page: number;
    size: number;
}

/*  STATE  */

interface EstimatesState {
    data: Estimate[];
    pagination: Pagination | null;
    loading: boolean;
    submitting: boolean;
    error: string | null;
}

const initialState: EstimatesState = {
    data: [],
    pagination: null,
    loading: false,
    submitting: false,
    error: null,
};

const normalizeItem = (value: unknown): Estimate | null => {
    if (!value || typeof value !== 'object') return null;

    const data = value as Estimate & {
        data?: Estimate;
        item?: Estimate;
    };

    if (data?.id) return data;
    if (data?.data?.id) return data.data;
    if (data?.item?.id) return data.item;

    return null;
};

const getErrorMessage = (error: unknown, fallback: string) => {
    return error instanceof Error ? error.message : fallback;
};

const upsertItem = (state: EstimatesState, item: Estimate) => {
    const index = state.data.findIndex((row) => row.id === item.id);

    if (index !== -1) {
        state.data[index] = item;
    } else {
        state.data.unshift(item);
    }
};

/*  SEARCH  */

export const fetchEstimates = createAsyncThunk<
    EstimateSearchResponse,
    FetchEstimatesParams,
    { rejectValue: string }
>('estimates/search', async (params, { rejectWithValue }) => {
    try {
        const res = await apiRequest<Estimate[]>('/materialEstimates/search', 'POST', params);

        return {
            data: res.data,
            pagination: res.pagination ?? undefined,
        };
    } catch (error: unknown) {
        return rejectWithValue(getErrorMessage(error, 'Ошибка загрузки смет'));
    }
});

/*  CREATE  */
export const createEstimate = createAsyncThunk<Estimate, EstimateFormData, { rejectValue: string }>(
    'estimates/create',
    async (data, { rejectWithValue }) => {
        try {
            const res = await apiRequest<Estimate>('/materialEstimates/create', 'POST', data);
            return res.data;
        } catch (error: unknown) {
            return rejectWithValue(getErrorMessage(error, 'Ошибка создания сметы'));
        }
    },
);

/*  UPDATE  */
export const updateEstimate = createAsyncThunk<
    Estimate,
    { id: number; data: EstimateFormData },
    { rejectValue: string }
>('estimates/update', async ({ id, data }, { rejectWithValue }) => {
    try {
        const res = await apiRequest<Estimate>(`/materialEstimates/update/${id}`, 'PUT', data);
        return res.data;
    } catch (error: unknown) {
        return rejectWithValue(getErrorMessage(error, 'Ошибка обновления сметы'));
    }
});

/*  DELETE  */
export const deleteEstimate = createAsyncThunk<number, number, { rejectValue: string }>(
    'estimates/delete',
    async (id, { rejectWithValue }) => {
        try {
            await apiRequest(`/materialEstimates/delete/${id}`, 'DELETE');
            return id;
        } catch (error: unknown) {
            return rejectWithValue(getErrorMessage(error, 'Ошибка удаления сметы'));
        }
    },
);

/*  SIGN  */
export const signEstimate = createAsyncThunk<
    Estimate,
    { id: number; stage: 'planning_engineer' | 'main_engineer' | 'general_director' },
    { rejectValue: string }
>('estimates/sign', async ({ id, stage }, { rejectWithValue }) => {
    try {
        const res = await apiRequest<Estimate>(`/materialEstimates/sign/${id}`, 'POST', {
            stage,
        });

        const item = normalizeItem(res.data);

        if (!item) {
            throw new Error('Сервер не вернул подписанную смету');
        }

        return item;
    } catch (error: unknown) {
        return rejectWithValue(getErrorMessage(error, 'Ошибка подписания сметы'));
    }
});

/*  SLICE  */
const estimatesSlice = createSlice({
    name: 'estimates',
    initialState,
    reducers: {
        clearMaterialEstimates: (state) => {
            state.data = [];
            state.pagination = null;
            state.loading = false;
            state.submitting = false;
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
            })

            /* SIGN */
            .addCase(signEstimate.pending, (state) => {
                state.submitting = true;
                state.error = null;
            })
            .addCase(signEstimate.fulfilled, (state, action) => {
                state.submitting = false;
                upsertItem(state, action.payload);
            })
            .addCase(signEstimate.rejected, (state, action) => {
                state.submitting = false;
                state.error = action.payload ?? 'Ошибка подписания сметы';
            });
    },
});

export const { clearMaterialEstimates } = estimatesSlice.actions;

export default estimatesSlice.reducer;
