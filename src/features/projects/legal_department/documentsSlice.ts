import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { Pagination, Users } from '@/features/users/userSlice';
import { apiRequest, type ApiResponse } from '@/utils/apiRequest';

/* TYPES */
export interface Documents {
    id: number;
    project_id: number;
    stage_id: number;
    name: string;
    status: number;
    price?: number;
    description: string;
    deadline: null;
    responsible_users: Users[];
    created_at: string;
    updated_at: string;
    deleted: boolean;
}

interface DocumentsSearchParams {
    project_id?: number;
    stage_id?: number;
    status?: number;
    name?: string;
    page?: number;
    size?: number;
}

interface DocumentsState {
    data: Documents[];
    pagination: Pagination | null;
    loading: boolean;
    error: string | null;
}

/* INITIAL STATE */
const initialState: DocumentsState = {
    data: [],
    pagination: null,
    loading: false,
    error: null,
};

/* THUNK */
export const fetchDocuments = createAsyncThunk<
    ApiResponse<Documents[]>,
    DocumentsSearchParams,
    { rejectValue: string }
>('documents/search', async (params, { rejectWithValue }) => {
    try {
        return await apiRequest<Documents[]>('/documents/search', 'POST', params);
    } catch (error: any) {
        return rejectWithValue(error.message || 'Ошибка загрузки документов');
    }
});

export const createDocuments = createAsyncThunk<
    Documents,
    Partial<Documents>,
    { rejectValue: string }
>('documents/create', async (documents, { rejectWithValue }) => {
    try {
        const res = await apiRequest<Documents>('/documents/create', 'POST', documents);
        return res.data;
    } catch (err: any) {
        return rejectWithValue(err.message);
    }
});

export const updateDocuments = createAsyncThunk<
    Documents,
    { id: number; data: Partial<Documents> },
    { rejectValue: string }
>('documents/update', async ({ id, data }, { rejectWithValue }) => {
    try {
        const res = await apiRequest<Documents>(`/documents/update/${id}`, 'PUT', data);
        return res.data;
    } catch (err: any) {
        return rejectWithValue(err.message);
    }
});

/* SLICE */
const documentsSlice = createSlice({
    name: 'documents',
    initialState,
    reducers: {
        clearDocuments(state) {
            state.data = [];
            state.pagination = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchDocuments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDocuments.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchDocuments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(createDocuments.fulfilled, (state, action) => {
                state.data.unshift(action.payload);
            })
            .addCase(updateDocuments.fulfilled, (state, action) => {
                const index = state.data.findIndex((s) => s.id === action.payload.id);
                if (index !== -1) state.data[index] = action.payload;
            });
    },
});

export const { clearDocuments } = documentsSlice.actions;
export default documentsSlice.reducer;
