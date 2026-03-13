import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest, type ApiResponse } from '@/utils/apiRequest';
import { downloadFile } from '@/features/projects/legal_department/files/downloadFile';

export interface DocumentFile {
    id: number;
    document_id: number;
    name: string;
    file_path: string;
    uploaded_user_id: number;
    mime_type: string;
    file_size: number;
    created_at: string;
    updated_at: string;
    deleted: boolean;
}
export interface UploadDocumentResponse {
    success: boolean;
    uploaded: number;
    data: DocumentFile[];
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

/* THUNKS */

// FETCH
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

// UPLOAD
export const uploadDocumentFile = createAsyncThunk<
    UploadDocumentResponse,
    { documentId: number; file: File },
    { rejectValue: string }
>('documentFiles/upload', async ({ documentId, file }, { rejectWithValue }) => {
    try {
        const formData = new FormData();
        formData.append('files', file);

        const response = await apiRequest<UploadDocumentResponse>(
            `/documentFiles/upload/${documentId}`,
            'POST',
            formData,
        );

        return response.data; // ← ВАЖНО
    } catch (err: any) {
        return rejectWithValue(err.message || 'Ошибка загрузки файла');
    }
});

// DOWNLOAD
export const downloadDocumentFile = createAsyncThunk<
    void,
    { file_id: number; filename: string },
    { rejectValue: string }
>('documentFiles/download', async ({ file_id, filename }, { rejectWithValue }) => {
    try {
        await downloadFile(
            `/documentFiles/download/${file_id}`,
            filename,
            localStorage.getItem('token') || undefined,
        );
    } catch (err: any) {
        return rejectWithValue(err.message || 'Ошибка скачивания файла');
    }
});

// DELETE
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

/* SLICE */
const documentFilesSlice = createSlice({
    name: 'documentFiles',
    initialState,
    reducers: {
        clearDocumentFiles: () => initialState,
        setFiles(state, action) {
            state.data = action.payload;
        },

        removeFile(state, action) {
            state.data = state.data.filter((f) => f.id !== action.payload);
        },
    },
    extraReducers: (builder) => {
        builder
            // FETCH
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

            // UPLOAD
            .addCase(uploadDocumentFile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            /* upload success */
            .addCase(uploadDocumentFile.fulfilled, (state, action) => {
                state.loading = false;

                if (action.payload?.data) {
                    state.data.push(...action.payload.data);
                }
            })

            /* upload error */
            .addCase(uploadDocumentFile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Ошибка загрузки файла';
            })
            // DOWNLOAD
            .addCase(downloadDocumentFile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(downloadDocumentFile.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(downloadDocumentFile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Ошибка скачивания файла';
            })

            // DELETE
            .addCase(deleteDocumentFile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteDocumentFile.fulfilled, (state, action) => {
                state.loading = false;
                state.data = state.data.filter((f) => f.id !== action.meta.arg);
            })
            .addCase(deleteDocumentFile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Ошибка удаления файла';
            });
    },
});

export const { clearDocumentFiles } = documentFilesSlice.actions;
export default documentFilesSlice.reducer;
