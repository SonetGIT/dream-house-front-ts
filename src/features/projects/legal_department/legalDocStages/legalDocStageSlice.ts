import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '@/utils/apiRequest';
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
interface LegalDocStagesParams {
    page: number;
    size: number;
    search?: string;
    project_id: number;
}
export interface LegalDocStagePayload {
    project_id: number;
    name: string;
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

/*GET*/
export const fetchLegalDocStages = createAsyncThunk<
    { data: LegalDocStages[]; pagination?: Pagination },
    LegalDocStagesParams,
    { rejectValue: string }
>('legalDocStages/search', async (params, { rejectWithValue }) => {
    try {
        const res = await apiRequest('/documentStages/search', 'POST', params);
        return {
            data: res.data,
            pagination: res.pagination ?? undefined,
        };
    } catch (error: any) {
        return rejectWithValue(error.message || 'Ошибка загрузки этапов документов');
    }
});

/*CREATE*/
export const createLegalDocStage = createAsyncThunk<
    LegalDocStages,
    LegalDocStagePayload,
    { rejectValue: string }
>('legalDocStages/create', async (payload, { rejectWithValue }) => {
    try {
        const res = await apiRequest<LegalDocStages>('/documentStages/create', 'POST', payload);

        return res.data;
    } catch (error: any) {
        return rejectWithValue(error.message || 'Ошибка создания этапа');
    }
});

/*UPDATE*/
export const updateLegalDocStage = createAsyncThunk<
    LegalDocStages,
    { id: number; data: Partial<LegalDocStagePayload> },
    { rejectValue: string }
>('legalDocStages/update', async ({ id, data }, { rejectWithValue }) => {
    try {
        const res = await apiRequest<LegalDocStages>(`/documentStages/update/${id}`, 'PUT', data);

        return res.data;
    } catch (error: any) {
        return rejectWithValue(error.message || 'Ошибка обновления этапа');
    }
});

/*DELETE*/
export const deleteLegalDocStage = createAsyncThunk<number, number, { rejectValue: string }>(
    'legalDocStages/delete',
    async (id, { rejectWithValue }) => {
        try {
            await apiRequest(`/documentStages/delete/${id}`, 'DELETE');
            return id;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Ошибка удаления этапа');
        }
    },
);

/*SLICE*/
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

            /* FETCH */
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
                state.error = action.payload ?? 'Ошибка загрузки';
            })

            /* CREATE */
            .addCase(createLegalDocStage.fulfilled, (state, action) => {
                state.data.unshift(action.payload);
            })

            /* UPDATE */
            .addCase(updateLegalDocStage.fulfilled, (state, action) => {
                const index = state.data.findIndex((stage) => stage.id === action.payload.id);

                if (index !== -1) {
                    state.data[index] = action.payload;
                }
            })

            /* DELETE */
            .addCase(deleteLegalDocStage.fulfilled, (state, action) => {
                state.data = state.data.filter((stage) => stage.id !== action.payload);
            });
    },
});

/* EXPORTS */
export const { clearLegalDocStages } = legalDocStageSlice.actions;

export default legalDocStageSlice.reducer;
