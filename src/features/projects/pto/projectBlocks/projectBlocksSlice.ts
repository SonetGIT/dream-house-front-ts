import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '@/utils/apiRequest';
import type { Pagination } from '@/features/users/userSlice';

/*TYPES*/
export interface ProjectBlock {
    id: number;
    name: string;
    project_id: number;

    planned_budget: number;
    total_area: number;
    sale_area: number;

    planned_volume: number;
    done_volume: number;
    remaining_volume: number;
    progress_percent: number;

    services_count: number;
    subsections_count: number;

    created_at?: string;
    updated_at?: string;
}

interface FetchBlocksParams {
    project_id: number;
    page: number;
    size: number;
}

/*STATE*/
interface BlocksState {
    data: ProjectBlock[];
    pagination: Pagination | null;
    loading: boolean;
    error: string | null;
}

const initialState: BlocksState = {
    data: [],
    pagination: null,
    loading: false,
    error: null,
};

/*FETCH*/
export const fetchProjectBlocks = createAsyncThunk<
    { data: ProjectBlock[]; pagination: Pagination | null },
    FetchBlocksParams,
    { rejectValue: string }
>('projectBlocks/search', async (params, { rejectWithValue }) => {
    try {
        const res = await apiRequest<any>('/projectBlocks/search', 'POST', params);

        return {
            data: res.data ?? [],
            pagination: res.pagination ?? null,
        };
    } catch (err: any) {
        return rejectWithValue(err.message || 'Ошибка загрузки блоков');
    }
});

/*CREATE*/

export const createProjectBlock = createAsyncThunk<
    ProjectBlock,
    Partial<ProjectBlock>,
    { rejectValue: string }
>('projectBlocks/create', async (data, { rejectWithValue }) => {
    try {
        const res = await apiRequest<ProjectBlock>('/projectBlocks/create', 'POST', data);

        return res.data;
    } catch (err: any) {
        return rejectWithValue(err.message || 'Ошибка создания блока');
    }
});

/*UPDATE*/

export const updateProjectBlock = createAsyncThunk<
    ProjectBlock,
    { id: number; data: Partial<ProjectBlock> },
    { rejectValue: string }
>('projectBlocks/update', async ({ id, data }, { rejectWithValue }) => {
    try {
        const res = await apiRequest<ProjectBlock>(`/projectBlocks/update/${id}`, 'PUT', data);

        return res.data;
    } catch (err: any) {
        return rejectWithValue(err.message || 'Ошибка обновления блока');
    }
});

/*DELETE*/

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

/*SLICE*/

const projectBlocksSlice = createSlice({
    name: 'projectBlocks',
    initialState,

    reducers: {
        clearProjectBlocks: (state) => {
            state.data = [];
            state.pagination = null;
            state.error = null;
        },
    },

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
                state.pagination = action.payload.pagination;
            })

            .addCase(fetchProjectBlocks.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Ошибка загрузки';
            })

            /* CREATE */
            .addCase(createProjectBlock.fulfilled, (state, action) => {
                state.data.unshift(action.payload);

                if (state.pagination) {
                    state.pagination.total += 1;
                }
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

export const { clearProjectBlocks } = projectBlocksSlice.actions;

export default projectBlocksSlice.reducer;
