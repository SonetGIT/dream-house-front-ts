import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Pagination } from '@/features/users/userSlice';
import { apiRequest } from '@/utils/apiRequest';

export interface Project {
    id: number;
    name: string;
    code: string;
    type: number;
    address: string;
    customer_name: string;

    start_date: string;
    end_date: string;

    planned_budget: number;
    actual_budget: number;

    status: number;

    manager_id: number;
    foreman_id: number | null;
    master_id: number | null;
    warehouse_manager_id: number | null;

    description: string;

    created_at: string;
    updated_at: string;
    deleted: boolean;

    progress_percent: number;
}

export interface ProjectForm {
    name: string;
    code: string;
    type: number | null;
    address: string;
    customer_name: string;
    start_date: string;
    end_date: string;
    planned_budget: number | null;
    actual_budget: number | null;
    status: number | null;
    manager_id: number | null;
    foreman_id: number | null;
    master_id: number | null;
    warehouse_manager_id: number | null;
    description: string;
    progress_percent: number;
}

interface ProjectsState {
    items: Project[];
    pagination: Pagination | null;
    loading: boolean;
    error: string | null;
    currentProject: Project | null;
}

const initialState: ProjectsState = {
    items: [],
    pagination: null,
    loading: false,
    error: null,
    currentProject: null,
};

interface SearchPayload {
    search?: string;
    page?: number;
    size?: number;
}
export type ProjectFormData = Omit<Project, 'id' | 'created_at' | 'updated_at' | 'deleted'>;

export const fetchProjects = createAsyncThunk(
    'projects/search',
    async (params: SearchPayload = {}, { rejectWithValue }) => {
        try {
            const res = await apiRequest<Project[]>('/projects/search', 'POST', params);
            return res;
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    },
);

export const createProject = createAsyncThunk(
    'projects/create',
    async (data: Partial<Project>, { rejectWithValue }) => {
        try {
            const res = await apiRequest<Project>('/projects/create', 'POST', data);

            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    },
);

export const updateProject = createAsyncThunk(
    'projects/update',
    async ({ id, data }: { id: number; data: Partial<Project> }, { rejectWithValue }) => {
        try {
            const res = await apiRequest<Project>(`/projects/update/${id}`, 'PUT', data);

            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    },
);

export const deleteProject = createAsyncThunk(
    'projects/delete',
    async (id: number, { rejectWithValue }) => {
        try {
            await apiRequest(`/projects/delete/${id}`, 'DELETE');
            return id;
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
const projectsSlice = createSlice({
    name: 'projects',
    initialState,
    reducers: {},

    extraReducers: (builder) => {
        builder

            // fetch
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

            // create
            .addCase(createProject.fulfilled, (state, action) => {
                state.items.unshift(action.payload);
            })

            // update
            .addCase(updateProject.fulfilled, (state, action) => {
                const index = state.items.findIndex((p) => p.id === action.payload.id);

                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })

            // delete
            .addCase(deleteProject.fulfilled, (state, action) => {
                state.items = state.items.filter((p) => p.id !== action.payload);
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

export default projectsSlice.reducer;
