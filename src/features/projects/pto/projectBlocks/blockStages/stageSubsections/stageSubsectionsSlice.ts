import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Pagination } from '@/features/users/userSlice';
import { apiRequest } from '@/utils/apiRequest';

/* TYPES */
export interface StageSubsection {
    id: number;
    name: string;
    stage_id: number;
    created_at?: string;
    updated_at?: string;
    deleted: boolean;
}

export interface StageSubsectionFormData {
    name: string;
    stage_id: number;
}

interface FetchStageSubsectionsParams {
    page: number;
    size: number;
    search?: string;
    stage_id: number;
}

interface StageSubsectionsState {
    byStageId: Record<number, StageSubsection[]>;
    paginationByStageId: Record<number, Pagination | null>;
    loading: boolean;
    error: string | null;
}

const initialState: StageSubsectionsState = {
    byStageId: {},
    paginationByStageId: {},
    loading: false,
    error: null,
};

/* FETCH */
export const fetchStageSubsections = createAsyncThunk<
    {
        stageId: number;
        data: StageSubsection[];
        pagination?: Pagination;
    },
    FetchStageSubsectionsParams,
    { rejectValue: string }
>('stageSubsections/search', async (params, { rejectWithValue }) => {
    try {
        const res = await apiRequest<StageSubsection[]>('/stageSubsections/search', 'POST', params);

        console.log('fetchStageSubsections res', res.data);
        return {
            stageId: params.stage_id,
            data: res.data,
            pagination: res.pagination ?? undefined,
        };
    } catch (err: any) {
        return rejectWithValue(err.message || 'Ошибка загрузки подразделов');
    }
});

/* CREATE */
export const createStageSubsection = createAsyncThunk<
    StageSubsection,
    StageSubsectionFormData,
    { rejectValue: string }
>('stageSubsections/create', async (data, { rejectWithValue }) => {
    try {
        const res = await apiRequest<StageSubsection>('/stageSubsections/create', 'POST', data);
        return res.data;
    } catch (err: any) {
        return rejectWithValue(err.message || 'Ошибка создания подраздела');
    }
});

/* UPDATE */
export const updateStageSubsection = createAsyncThunk<
    StageSubsection,
    { id: number; data: StageSubsectionFormData },
    { rejectValue: string }
>('stageSubsections/update', async ({ id, data }, { rejectWithValue }) => {
    try {
        const res = await apiRequest<StageSubsection>(
            `/stageSubsections/update/${id}`,
            'PUT',
            data,
        );
        return res.data;
    } catch (err: any) {
        return rejectWithValue(err.message || 'Ошибка обновления подраздела');
    }
});

/* DELETE */
export const deleteStageSubsection = createAsyncThunk<
    { id: number; stageId: number },
    { id: number; stageId: number },
    { rejectValue: string }
>('stageSubsections/delete', async ({ id, stageId }, { rejectWithValue }) => {
    try {
        await apiRequest(`/stageSubsections/delete/${id}`, 'DELETE');
        return { id, stageId };
    } catch (err: any) {
        return rejectWithValue(err.message || 'Ошибка удаления подраздела');
    }
});

/* SLICE */
const stageSubsectionsSlice = createSlice({
    name: 'stageSubsections',
    initialState,
    reducers: {
        clearStageSubsectionsByStage: (state, action) => {
            delete state.byStageId[action.payload];
            delete state.paginationByStageId[action.payload];
        },
    },
    extraReducers: (builder) => {
        builder

            .addCase(fetchStageSubsections.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchStageSubsections.fulfilled, (state, action) => {
                state.loading = false;

                state.byStageId[action.payload.stageId] = action.payload.data;

                state.paginationByStageId[action.payload.stageId] =
                    action.payload.pagination ?? null;
            })
            .addCase(fetchStageSubsections.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Ошибка загрузки';
            })

            .addCase(createStageSubsection.fulfilled, (state, action) => {
                const stageId = action.payload.stage_id;

                if (!state.byStageId[stageId]) {
                    state.byStageId[stageId] = [];
                }

                state.byStageId[stageId].unshift(action.payload);

                const pagination = state.paginationByStageId[stageId];
                if (pagination) {
                    pagination.total += 1;
                }
            })

            .addCase(updateStageSubsection.fulfilled, (state, action) => {
                const stageId = action.payload.stage_id;
                const list = state.byStageId[stageId];
                if (!list) return;

                const index = list.findIndex((s) => s.id === action.payload.id);

                if (index !== -1) {
                    list[index] = action.payload;
                }
            })

            .addCase(deleteStageSubsection.fulfilled, (state, action) => {
                const { id, stageId } = action.payload;
                const list = state.byStageId[stageId];
                if (!list) return;

                state.byStageId[stageId] = list.filter((s) => s.id !== id);
                const pagination = state.paginationByStageId[stageId];
                if (pagination) {
                    pagination.total -= 1;
                }
            });
    },
});

export const { clearStageSubsectionsByStage: clearStageSubsectionsBySection } =
    stageSubsectionsSlice.actions;

export default stageSubsectionsSlice.reducer;
