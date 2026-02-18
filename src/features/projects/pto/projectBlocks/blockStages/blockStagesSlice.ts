import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '@/utils/apiRequest';
import type { Pagination } from '@/features/users/userSlice';

/* TYPES */

export interface BlockStage {
    id: number;
    name: string;
    block_id: number;
    created_at?: string;
    updated_at?: string;
    deleted: boolean;
}

export interface BlockStageFormData {
    name: string;
    block_id: number;
}

interface FetchBlockStagesParams {
    page: number;
    size: number;
    search?: string;
    block_id?: number;
}

interface BlockStagesState {
    data: BlockStage[];
    pagination: Pagination | null;
    loading: boolean;
    error: string | null;
}

const initialState: BlockStagesState = {
    data: [],
    pagination: null,
    loading: false,
    error: null,
};

/* FETCH */

export const fetchBlockStages = createAsyncThunk<
    { data: BlockStage[]; pagination?: Pagination },
    FetchBlockStagesParams,
    { rejectValue: string }
>('blockStages/search', async (params, { rejectWithValue }) => {
    try {
        return await apiRequest('/blockStages/search', 'POST', params);
    } catch (error: any) {
        return rejectWithValue(error.message || 'Ошибка загрузки блоков');
    }
});

/* CREATE */
export const createBlockStage = createAsyncThunk<
    BlockStage,
    BlockStageFormData,
    { rejectValue: string }
>('blockStages/create', async (data, { rejectWithValue }) => {
    try {
        const res = await apiRequest<BlockStage>('/blockStages/create', 'POST', data);
        return res.data;
    } catch (err: any) {
        return rejectWithValue(err.message || 'Ошибка создания блока');
    }
});

/* UPDATE */
export const updateBlockStage = createAsyncThunk<
    BlockStage,
    { id: number; data: BlockStageFormData },
    { rejectValue: string }
>('blockStages/update', async ({ id, data }, { rejectWithValue }) => {
    try {
        const res = await apiRequest<BlockStage>(`/blockStages/update/${id}`, 'PUT', data);
        return res.data;
    } catch (err: any) {
        return rejectWithValue(err.message || 'Ошибка обновления блока');
    }
});

/* DELETE */
export const deleteBlockStage = createAsyncThunk<number, number, { rejectValue: string }>(
    'blockStages/delete',
    async (id, { rejectWithValue }) => {
        try {
            await apiRequest(`/blockStages/delete/${id}`, 'DELETE');
            return id;
        } catch (err: any) {
            return rejectWithValue(err.message || 'Ошибка удаления блока');
        }
    },
);

/* SLICE */
const blockStagesSlice = createSlice({
    name: 'blockStages',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder

            /* FETCH */
            .addCase(fetchBlockStages.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBlockStages.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.data;
                state.pagination = action.payload.pagination ?? null;
            })
            .addCase(fetchBlockStages.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Ошибка загрузки';
            })

            /* CREATE */
            .addCase(createBlockStage.pending, (state) => {
                state.loading = true;
            })
            .addCase(createBlockStage.fulfilled, (state, action) => {
                state.loading = false;
                state.data.unshift(action.payload);
                if (state.pagination) {
                    state.pagination.total += 1;
                }
            })
            .addCase(createBlockStage.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Ошибка создания';
            })

            /* UPDATE */
            .addCase(updateBlockStage.fulfilled, (state, action) => {
                const index = state.data.findIndex((b) => b.id === action.payload.id);
                if (index !== -1) {
                    state.data[index] = action.payload;
                }
            })

            /* DELETE */
            .addCase(deleteBlockStage.fulfilled, (state, action) => {
                state.data = state.data.filter((b) => b.id !== action.payload);
                if (state.pagination) {
                    state.pagination.total -= 1;
                }
            });
    },
});

export default blockStagesSlice.reducer;
