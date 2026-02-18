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
        { rejectWithValue },
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
    },
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
    },
);

export const createProject = createAsyncThunk<Project, Partial<Project>, { rejectValue: string }>(
    'projects/create',
    async (projects, { rejectWithValue }) => {
        try {
            const res = await apiRequest<Project>('/projects/create', 'POST', projects);
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    },
);

export const updateProject = createAsyncThunk<
    Project,
    { id: number; data: Partial<Project> },
    { rejectValue: string }
>('projects/update', async ({ id, data }, { rejectWithValue }) => {
    try {
        const res = await apiRequest<Project>(`/projects/update/${id}`, 'PUT', data);
        return res.data;
    } catch (err: any) {
        return rejectWithValue(err.message);
    }
});

export const deleteProject = createAsyncThunk(
    'projects/delete',
    async (id: number, { rejectWithValue }) => {
        try {
            await apiRequest<Project>(`/projects/delete/${id}`, 'DELETE');
            return id;
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    },
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
                state.pagination = action.payload.pagination ?? null;
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
            })
            .addCase(createProject.fulfilled, (state, action) => {
                state.items.unshift(action.payload);
            })
            .addCase(updateProject.fulfilled, (state, action) => {
                const index = state.items.findIndex((s) => s.id === action.payload.id);
                if (index !== -1) state.items[index] = action.payload;
            })
            // DELETE
            .addCase(deleteProject.fulfilled, (state, action) => {
                state.items = state.items.filter((u) => u.id !== action.payload);
            });
    },
});

export const { setSearch, setFilters, clearFilters } = projectsSlice.actions;

export default projectsSlice.reducer;
