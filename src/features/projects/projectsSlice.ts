import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getToken } from '../auth/getToken';
import type { Pagination } from '../users/userSlice';
const API_URL = import.meta.env.VITE_BASE_URL;

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
export const fetchProjects = createAsyncThunk<
    { data: Project[]; pagination: Pagination },
    { page?: number; size?: number; search?: string; filters?: any },
    { rejectValue: string }
>('projects/fetch', async (params, { rejectWithValue }) => {
    const { page = 1, size = 10, search = '', filters = {} } = params;
    const body = { page, size, search, ...filters };

    const token = getToken();
    if (!token) return rejectWithValue('Токен отсутствует');

    try {
        const response = await fetch(`${API_URL}/projects/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok || data.success === false) {
            return rejectWithValue(data.message || 'Ошибка загрузки данных');
        }

        return data;
    } catch (error: any) {
        return rejectWithValue(error.message || 'Неизвестная ошибка при загрузке данных');
    }
});

export const getProjectById = createAsyncThunk<
    Project,
    number, // что принимаем (ID)
    { rejectValue: string }
>('projects/getById', async (id, { rejectWithValue }) => {
    const token = getToken();
    if (!token) return rejectWithValue('Токен отсутствует');

    try {
        const response = await fetch(`${API_URL}/projects/getById/${id}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const data = await response.json().catch(() => null);
            return rejectWithValue(data?.message || 'Ошибка получения проекта');
        }

        const result = await response.json();
        return result.data;
    } catch (error: any) {
        return rejectWithValue(error.message || 'Ошибка сети');
    }
});

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
                state.error = action.payload ?? 'Ошибка запроса';
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
                state.error = action.payload || 'Ошибка';
            });
    },
});

export const { setSearch, setFilters, clearFilters } = projectsSlice.actions;

export default projectsSlice.reducer;
