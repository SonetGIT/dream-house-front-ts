import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest, type ApiResponse } from '@/utils/apiRequest';
import type { Pagination } from '@/features/users/userSlice';

/* TYPES */
export interface DocumentStages {
    id: number;
    project_id: number;
    name: string;
    created_at: string;
    updated_at: string;
    deleted: boolean;
}

/* STATE */
interface DocumentStageState {
    data: DocumentStages[];
    pagination: Pagination | null;
    loading: boolean;
    error: string | null;
}

const initialState: DocumentStageState = {
    data: [],
    pagination: null,
    loading: false,
    error: null,
};

/* THUNK */

export const fetchDocumentStages = createAsyncThunk<
    ApiResponse<DocumentStages[]>,
    void,
    { rejectValue: string }
>('documentStages/get', async (_, { rejectWithValue }) => {
    try {
        return await apiRequest<DocumentStages[]>('/documentStages/gets', 'GET');
    } catch (error: any) {
        return rejectWithValue(error.message || 'Ошибка загрузки этапов документов');
    }
});

/* SLICE */
const documentStagesSlice = createSlice({
    name: 'documentStages',
    initialState,
    reducers: {
        clearDocumentStages(state) {
            state.data = [];
            state.pagination = null;
            state.loading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchDocumentStages.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDocumentStages.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.data;
                state.pagination = action.payload.pagination ?? null;
            })
            .addCase(fetchDocumentStages.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Ошибка загрузки этапов';
            });
    },
});

/* EXPORTS */
export const { clearDocumentStages } = documentStagesSlice.actions;
export default documentStagesSlice.reducer;
