import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Pagination } from '@/features/users/userSlice';
import { apiRequest } from '@/utils/apiRequest';
import { DOCUMENT_STATUS } from './documentStatus';

export interface LegalDocument {
    id: number;
    name: string;
    status: number;
    price: number;
    description: string;
    deadline: string;
    loaction: string;
    responsible_users: number[];
    entity_type: string;
    entity_id: number;
    created_at: string;
    updated_at: string;
    deleted: boolean;
}

export interface LegalDocumentForm {
    name: string;
    status: number;
    price: number;
    description: string;
    deadline: string;
    loaction: string;
    responsible_users: number[];
    entity_type: string;
    entity_id: number;
}
interface LegalDocSearchParams {
    entity_type?: string;
    entity_id: number;
    status?: number;
    name?: string;
    page?: number;
    size?: number;
}
interface LegalDocumentsState {
    items: LegalDocument[];
    pagination: Pagination | null;
    loading: boolean;
    error: string | null;
}

const initialState: LegalDocumentsState = {
    items: [],
    pagination: null,
    loading: false,
    error: null,
};

// fetch DOCUMENTS
export const fetchLegalDocuments = createAsyncThunk<
    { data: LegalDocument[]; pagination?: Pagination },
    LegalDocSearchParams,
    { rejectValue: string }
>('legalDocuments/search', async (params, { rejectWithValue }) => {
    try {
        const res = await apiRequest('/documents/search', 'POST', params);
        return {
            data: res.data,
            pagination: res.pagination ?? undefined,
        };
    } catch (error: any) {
        return rejectWithValue(error.message || 'Ошибка загрузки этапов');
    }
});

// CREATE DOCUMENT
export const createLegalDocument = createAsyncThunk(
    'legalDocuments/create',
    async (payload: Partial<LegalDocument>) => {
        const res = await apiRequest<LegalDocument>('/documents/create', 'POST', payload);

        return res.data;
    },
);

// UPDATE DOCUMENT
export const updateLegalDocument = createAsyncThunk(
    'legalDocuments/update',
    async ({ id, data }: { id: number; data: Partial<LegalDocument> }) => {
        const res = await apiRequest<LegalDocument>(`/documents/update/${id}`, 'PUT', data);

        return res.data;
    },
);

// DELETE DOCUMENT
export const deleteLegalDocument = createAsyncThunk<
    { id: number; stageId: number },
    { id: number; stageId: number },
    { rejectValue: string }
>('legalDocuments/delete', async ({ id, stageId }, { rejectWithValue }) => {
    try {
        await apiRequest(`/documents/delete/${id}`, 'DELETE');

        return { id, stageId };
    } catch (err: any) {
        return rejectWithValue(err.message || 'Ошибка удаления документа');
    }
});

export const setDocumentStatus = createAsyncThunk<
    number,
    { id: number; status: number },
    { rejectValue: string }
>('legalDocuments/setStatus', async ({ id, status }, { rejectWithValue }) => {
    try {
        await apiRequest(`/documents/update/${id}`, 'PUT', { status });
        return id;
    } catch (err: any) {
        return rejectWithValue(err.message || 'Ошибка смены статуса');
    }
});
export const archiveDocument = (id: number) =>
    setDocumentStatus({ id, status: DOCUMENT_STATUS.ARCHIVED });

export const underReviewDocument = (id: number) =>
    setDocumentStatus({ id, status: DOCUMENT_STATUS.UNDER_REVIEW });

export const signDocument = (id: number) =>
    setDocumentStatus({ id, status: DOCUMENT_STATUS.SIGNED });

// SLICE
const legalDocumentSlice = createSlice({
    name: 'legalDocuments',
    initialState,
    reducers: {},

    extraReducers: (builder) => {
        // FETCH
        builder.addCase(fetchLegalDocuments.pending, (state) => {
            state.loading = true;
            state.error = null;
        });

        builder.addCase(fetchLegalDocuments.fulfilled, (state, action) => {
            state.loading = false;
            state.items = action.payload.data;
            state.pagination = action.payload.pagination ?? null;
        });

        builder.addCase(fetchLegalDocuments.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message || 'Ошибка загрузки документов';
        });

        // CREATE
        builder.addCase(createLegalDocument.fulfilled, (state, action) => {
            state.items.unshift(action.payload);
        });

        // UPDATE
        builder.addCase(updateLegalDocument.fulfilled, (state, action) => {
            const index = state.items.findIndex((doc) => doc.id === action.payload.id);

            if (index !== -1) {
                state.items[index] = action.payload;
            }
        });

        // DELETE
        builder.addCase(deleteLegalDocument.fulfilled, (state, action) => {
            state.items = state.items.filter((doc) => doc.id !== action.payload.id);
        });

        builder.addCase(setDocumentStatus.fulfilled, (state, action) => {
            const doc = state.items.find((d) => d.id === action.payload);
            if (doc) {
                doc.status = action.meta.arg.status;
            }
        });
    },
});

export default legalDocumentSlice.reducer;
