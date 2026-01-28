import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Pagination } from '../users/userSlice';
import { apiRequest } from '@/utils/apiRequest';

export interface Project {
    id: number;
    name: string;
    code: string;
    type: number;
    address: string;
    status: number;
    created_at: string;
    updated_at: string;
}

export interface ProjectsState {
    items: Project[];
    pagination: Pagination | null;
    search: string;
    filters: Record<string, any>;
    loading: boolean;
    error: string | null;
    currentProject: Project | null;
}

const initialState: ProjectsState = {
    items: [],
    pagination: null,
    search: '',
    filters: {},
    loading: false,
    error: null,
    currentProject: null,
};

// Thunk
export const fetchProjects = createAsyncThunk(
    'projects/fetch',
    async (
        params: { page?: number; size?: number; search?: string; filters?: any },
        { rejectWithValue }
    ) => {
        try {
            const body = {
                page: params.page ?? 1,
                size: params.size ?? 10,
                search: params.search ?? '',
                ...(params.filters || {}),
            };
            const data = await apiRequest<Project[]>(`/projects/search`, 'POST', body);
            return data;
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

export const getProjectById = createAsyncThunk(
    'projects/getById',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await apiRequest<Project>(`/projects/getById/${id}`, 'GET');
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

// Slice
const projectsSlice = createSlice({
    name: 'projects',
    initialState,
    reducers: {
        setSearch: (state, action) => {
            state.search = action.payload;
        },
        setFilters: (state, action) => {
            state.filters = action.payload;
        },
        clearFilters: (state) => {
            state.filters = {};
            state.search = '';
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProjects.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProjects.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchProjects.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(getProjectById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getProjectById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentProject = action.payload;
            })
            .addCase(getProjectById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { setSearch, setFilters, clearFilters } = projectsSlice.actions;

export default projectsSlice.reducer;
