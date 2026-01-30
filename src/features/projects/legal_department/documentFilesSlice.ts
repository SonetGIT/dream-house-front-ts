import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest, type ApiResponse } from '@/utils/apiRequest';

export interface DocumentFile {
    id: number;
    document_id: number;
    name: string;
    file_path: string;
    mime_type: string;
    file_size: number;
    created_at: string;
    updated_at: string;
    deleted: boolean;
}

interface DocumentFilesState {
    data: DocumentFile[];
    loading: boolean;
    error: string | null;
}

const initialState: DocumentFilesState = {
    data: [],
    loading: false,
    error: null,
};

/* ============================
   THUNKS
============================ */

// Получить список файлов документа
export const fetchDocumentFiles = createAsyncThunk<
    ApiResponse<DocumentFile[]>,
    number,
    { rejectValue: string }
>('documentFiles/fetch', async (documentId, { rejectWithValue }) => {
    try {
        return await apiRequest<DocumentFile[]>(`/documentFiles/files/${documentId}`, 'GET');
    } catch (err: any) {
        return rejectWithValue(err.message || 'Ошибка загрузки файлов');
    }
});

// Загрузить файл
export const uploadDocumentFile = createAsyncThunk<
    ApiResponse<DocumentFile>,
    { documentId: number; file: File },
    { rejectValue: string }
>('documentFiles/upload', async ({ documentId, file }, { rejectWithValue }) => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        return await apiRequest<DocumentFile>(
            `/documentFiles/upload/${documentId}`,
            'POST',
            formData,
        );
    } catch (err: any) {
        return rejectWithValue(err.message || 'Ошибка загрузки файла');
    }
});

// Скачать файл
export const downloadDocumentFile = createAsyncThunk<
    void,
    { id: number; filename: string },
    { rejectValue: string }
>('documentFiles/download', async ({ id, filename }, { rejectWithValue }) => {
    try {
        const res = await fetch(`/api/documentFiles/download/${id}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(text || 'Ошибка скачивания');
        }

        const blob = await res.blob();

        // 🔥 КРИТИЧНО: проверка, что это не JSON / HTML
        if (blob.type.includes('application/json') || blob.type.includes('text/html')) {
            throw new Error('Сервер вернул не файл');
        }

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename; // ⬅️ обязательно
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    } catch (err: any) {
        return rejectWithValue(err.message || 'Ошибка скачивания файла');
    }
});

// Удалить файл
export const deleteDocumentFile = createAsyncThunk<
    ApiResponse<null>,
    number,
    { rejectValue: string }
>('documentFiles/delete', async (fileId, { rejectWithValue }) => {
    try {
        return await apiRequest<null>(`/documentFiles/${fileId}`, 'DELETE');
    } catch (err: any) {
        return rejectWithValue(err.message || 'Ошибка удаления файла');
    }
});

/* ============================
   SLICE
============================ */
const documentFilesSlice = createSlice({
    name: 'documentFiles',
    initialState,
    reducers: {
        clearDocumentFiles(state) {
            state.data = [];
            state.loading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            /* FETCH */
            .addCase(fetchDocumentFiles.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDocumentFiles.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.data;
            })
            .addCase(fetchDocumentFiles.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Ошибка загрузки файлов';
            })

            /* UPLOAD */
            .addCase(uploadDocumentFile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(uploadDocumentFile.fulfilled, (state, action) => {
                state.loading = false;
                state.data.push(action.payload.data);
            })
            .addCase(uploadDocumentFile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Ошибка загрузки файла';
            })

            /* DELETE */
            .addCase(deleteDocumentFile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteDocumentFile.fulfilled, (state, action) => {
                state.loading = false;
                state.data = state.data.filter((file) => file.id !== action.meta.arg);
            })
            .addCase(deleteDocumentFile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Ошибка удаления файла';
            });
    },
});

/* EXPORTS */
export const { clearDocumentFiles } = documentFilesSlice.actions;
export default documentFilesSlice.reducer;
