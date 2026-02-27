import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '@/utils/apiRequest';
import type { Pagination } from '@/features/users/userSlice';

/* TYPES */

export interface ProjectBlock {
    id: number;
    name: string;
    project_id: number;
    planned_budget: number;
    total_area: number;
    sale_area: number;
    created_at?: string;
    updated_at?: string;
    deleted: boolean;
}

export interface ProjectBlockFormData {
    name: string;
    project_id: number;
    planned_budget: number;
    total_area: number;
    sale_area: number;
}

interface FetchProjectBlocksParams {
    page: number;
    size: number;
    search?: string;
    project_id?: number;
}

interface ProjectBlocksState {
    data: ProjectBlock[];
    pagination: Pagination | null;
    loading: boolean;
    error: string | null;
}

const initialState: ProjectBlocksState = {
    data: [],
    pagination: null,
    loading: false,
    error: null,
};

/* FETCH */

export const fetchProjectBlocks = createAsyncThunk<
    { data: ProjectBlock[]; pagination?: Pagination },
    FetchProjectBlocksParams,
    { rejectValue: string }
>('projectBlocks/search', async (params, { rejectWithValue }) => {
    try {
        return await apiRequest('/projectBlocks/search', 'POST', params);
    } catch (error: any) {
        return rejectWithValue(error.message || 'Ошибка загрузки блоков');
    }
});

/* CREATE */

export const createProjectBlock = createAsyncThunk<
    ProjectBlock,
    ProjectBlockFormData,
    { rejectValue: string }
>('projectBlocks/create', async (data, { rejectWithValue }) => {
    try {
        const res = await apiRequest<ProjectBlock>('/projectBlocks/create', 'POST', data);
        return res.data;
    } catch (err: any) {
        return rejectWithValue(err.message || 'Ошибка создания блока');
    }
});

/* UPDATE */

export const updateProjectBlock = createAsyncThunk<
    ProjectBlock,
    { id: number; data: ProjectBlockFormData },
    { rejectValue: string }
>('projectBlocks/update', async ({ id, data }, { rejectWithValue }) => {
    try {
        const res = await apiRequest<ProjectBlock>(`/projectBlocks/update/${id}`, 'PUT', data);
        return res.data;
    } catch (err: any) {
        return rejectWithValue(err.message || 'Ошибка обновления блока');
    }
});

/* DELETE */

export const deleteProjectBlock = createAsyncThunk<number, number, { rejectValue: string }>(
    'projectBlocks/delete',
    async (id, { rejectWithValue }) => {
        try {
            await apiRequest(`/projectBlocks/delete/${id}`, 'DELETE');
            return id;
        } catch (err: any) {
            return rejectWithValue(err.message || 'Ошибка удаления блока');
        }
    },
);

/* SLICE */

const projectBlocksSlice = createSlice({
    name: 'projectBlocks',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder

            /* FETCH */
            .addCase(fetchProjectBlocks.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProjectBlocks.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.data;
                state.pagination = action.payload.pagination ?? null;
            })
            .addCase(fetchProjectBlocks.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Ошибка загрузки';
            })

            /* CREATE */
            .addCase(createProjectBlock.pending, (state) => {
                state.loading = true;
            })
            .addCase(createProjectBlock.fulfilled, (state, action) => {
                state.loading = false;
                state.data.unshift(action.payload);
                if (state.pagination) {
                    state.pagination.total += 1;
                }
            })
            .addCase(createProjectBlock.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Ошибка создания';
            })

            /* UPDATE */
            .addCase(updateProjectBlock.fulfilled, (state, action) => {
                const index = state.data.findIndex((b) => b.id === action.payload.id);
                if (index !== -1) {
                    state.data[index] = action.payload;
                }
            })

            /* DELETE */
            .addCase(deleteProjectBlock.fulfilled, (state, action) => {
                state.data = state.data.filter((b) => b.id !== action.payload);
                if (state.pagination) {
                    state.pagination.total -= 1;
                }
            });
    },
});

export default projectBlocksSlice.reducer;
