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
    bySectionId: Record<number, StageSubsection[]>;
    paginationBySectionId: Record<number, Pagination | null>;
    loading: boolean;
    error: string | null;
}

const initialState: StageSubsectionsState = {
    bySectionId: {},
    paginationBySectionId: {},
    loading: false,
    error: null,
};

/* FETCH */
export const fetchStageSubsections = createAsyncThunk<
    {
        sectionId: number;
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
            sectionId: params.stage_id,
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
    { id: number; sectionId: number },
    { id: number; sectionId: number },
    { rejectValue: string }
>('stageSubsections/delete', async ({ id, sectionId }, { rejectWithValue }) => {
    try {
        await apiRequest(`/stageSubsections/delete/${id}`, 'DELETE');
        return { id, sectionId };
    } catch (err: any) {
        return rejectWithValue(err.message || 'Ошибка удаления подраздела');
    }
});

/* SLICE */
const stageSubsectionsSlice = createSlice({
    name: 'stageSubsections',
    initialState,
    reducers: {
        clearStageSubsectionsBySection: (state, action) => {
            delete state.bySectionId[action.payload];
            delete state.paginationBySectionId[action.payload];
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

                state.bySectionId[action.payload.sectionId] = action.payload.data;

                state.paginationBySectionId[action.payload.sectionId] =
                    action.payload.pagination ?? null;
            })
            .addCase(fetchStageSubsections.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Ошибка загрузки';
            })

            .addCase(createStageSubsection.fulfilled, (state, action) => {
                const sectionId = action.payload.stage_id;

                if (!state.bySectionId[sectionId]) {
                    state.bySectionId[sectionId] = [];
                }

                state.bySectionId[sectionId].unshift(action.payload);

                const pagination = state.paginationBySectionId[sectionId];
                if (pagination) {
                    pagination.total += 1;
                }
            })

            .addCase(updateStageSubsection.fulfilled, (state, action) => {
                const sectionId = action.payload.stage_id;
                const list = state.bySectionId[sectionId];
                if (!list) return;

                const index = list.findIndex((s) => s.id === action.payload.id);

                if (index !== -1) {
                    list[index] = action.payload;
                }
            })

            .addCase(deleteStageSubsection.fulfilled, (state, action) => {
                const { id, sectionId } = action.payload;
                const list = state.bySectionId[sectionId];
                if (!list) return;

                state.bySectionId[sectionId] = list.filter((s) => s.id !== id);

                const pagination = state.paginationBySectionId[sectionId];
                if (pagination) {
                    pagination.total -= 1;
                }
            });
    },
});

export const { clearStageSubsectionsBySection } = stageSubsectionsSlice.actions;

export default stageSubsectionsSlice.reducer;
