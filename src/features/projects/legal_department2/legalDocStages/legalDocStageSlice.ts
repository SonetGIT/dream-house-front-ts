import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest, type ApiResponse } from '@/utils/apiRequest';
import type { Pagination } from '@/features/users/userSlice';

/* TYPES */
export interface LegalDocStages {
    id: number;
    project_id: number;
    name: string;
    created_at: string;
    updated_at: string;
    deleted: boolean;
}

/* STATE */
interface LegalDocStageState {
    data: LegalDocStages[];
    pagination: Pagination | null;
    loading: boolean;
    error: string | null;
}

const initialState: LegalDocStageState = {
    data: [],
    pagination: null,
    loading: false,
    error: null,
};

/* THUNK */

export const fetchLegalDocStages = createAsyncThunk<
    ApiResponse<LegalDocStages[]>,
    void,
    { rejectValue: string }
>('legalDocStages/get', async (_, { rejectWithValue }) => {
    try {
        return await apiRequest<LegalDocStages[]>('/documentStages/gets', 'GET');
    } catch (error: any) {
        return rejectWithValue(error.message || 'Ошибка загрузки этапов документов');
    }
});

/* SLICE */
const legalDocStageSlice = createSlice({
    name: 'legalDocStages',
    initialState,
    reducers: {
        clearLegalDocStages(state) {
            state.data = [];
            state.pagination = null;
            state.loading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchLegalDocStages.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchLegalDocStages.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.data;
                state.pagination = action.payload.pagination ?? null;
            })
            .addCase(fetchLegalDocStages.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Ошибка загрузки юр. этапов';
            });
    },
});

/* EXPORTS */
export const { clearLegalDocStages } = legalDocStageSlice.actions;
export default legalDocStageSlice.reducer;
