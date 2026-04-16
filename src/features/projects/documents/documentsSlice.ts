import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Pagination } from '@/features/users/userSlice';
import { apiRequest } from '@/utils/apiRequest';

export interface Document {
    id: number;
    name: string;
    status: number;
    price: number | null;
    description: string | null;
    deadline: string | null;
    responsible_users: number[];
    entity_type: string;
    entity_id: number;
    created_at: string;
    updated_at: string;
    deleted: boolean;
}

export interface DocumentForm {
    name: string;
    status: number;
    price?: number | null;
    description?: string | null;
    deadline?: string | null;
    responsible_users?: number[];
    entity_type: string;
    entity_id: number;
}

interface DocumentSearchParams {
    entity_type?: string;
    entity_id?: number;
    status?: number;
    name?: string;
    page?: number;
    size?: number;
}

interface DocumentsState {
    items: Document[];
    pagination: Pagination | null;
    loading: boolean;
    error: string | null;
}

const initialState: DocumentsState = {
    items: [],
    pagination: null,
    loading: false,
    error: null,
};

export const fetchDocuments = createAsyncThunk<
    { data: Document[]; pagination?: Pagination },
    DocumentSearchParams,
    { rejectValue: string }
>('documents/search', async (params, { rejectWithValue }) => {
    try {
        const res = await apiRequest<Document[]>('/documents/search', 'POST', params);

        return {
            data: res.data ?? [],
            pagination: res.pagination ?? undefined,
        };
    } catch (error: any) {
        return rejectWithValue(error.message || 'Ошибка загрузки документов');
    }
});

export const createDocument = createAsyncThunk<
    Document,
    Partial<DocumentForm>,
    { rejectValue: string }
>('documents/create', async (payload, { rejectWithValue }) => {
    try {
        const res = await apiRequest<Document>('/documents/create', 'POST', payload);
        return res.data;
    } catch (error: any) {
        return rejectWithValue(error.message || 'Ошибка создания документа');
    }
});

export const updateDocument = createAsyncThunk<
    Document,
    { id: number; data: Partial<DocumentForm> },
    { rejectValue: string }
>('documents/update', async ({ id, data }, { rejectWithValue }) => {
    try {
        const res = await apiRequest<Document>(`/documents/update/${id}`, 'PUT', data);
        return res.data;
    } catch (error: any) {
        return rejectWithValue(error.message || 'Ошибка обновления документа');
    }
});

export const deleteDocument = createAsyncThunk<number, number, { rejectValue: string }>(
    'documents/delete',
    async (id, { rejectWithValue }) => {
        try {
            await apiRequest(`/documents/delete/${id}`, 'DELETE');
            return id;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Ошибка удаления документа');
        }
    },
);

export const setDocumentStatus = createAsyncThunk<
    { id: number; status: number },
    { id: number; status: number },
    { rejectValue: string }
>('documents/setStatus', async ({ id, status }, { rejectWithValue }) => {
    try {
        await apiRequest(`/documents/update/${id}`, 'PUT', { status });
        return { id, status };
    } catch (error: any) {
        return rejectWithValue(error.message || 'Ошибка смены статуса');
    }
});

const documentsSlice = createSlice({
    name: 'documents',
    initialState,
    reducers: {
        clearDocuments: (state) => {
            state.items = [];
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
                state.items = action.payload.data;
                state.pagination = action.payload.pagination ?? null;
            })
            .addCase(fetchDocuments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Ошибка загрузки документов';
            })

            .addCase(createDocument.fulfilled, (state, action) => {
                state.items.unshift(action.payload);

                if (state.pagination) {
                    state.pagination.total += 1;
                }
            })

            .addCase(updateDocument.fulfilled, (state, action) => {
                const index = state.items.findIndex((doc) => doc.id === action.payload.id);

                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })

            .addCase(deleteDocument.fulfilled, (state, action) => {
                state.items = state.items.filter((doc) => doc.id !== action.payload);

                if (state.pagination) {
                    state.pagination.total = Math.max(state.pagination.total - 1, 0);
                }
            })

            .addCase(setDocumentStatus.fulfilled, (state, action) => {
                const doc = state.items.find((d) => d.id === action.payload.id);

                if (doc) {
                    doc.status = action.payload.status;
                }
            });
    },
});

export const { clearDocuments } = documentsSlice.actions;

export default documentsSlice.reducer;
