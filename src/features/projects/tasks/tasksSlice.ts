import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Pagination } from '@/features/users/userSlice';
import { apiRequest } from '@/utils/apiRequest';

/*TYPES*/

export interface Task {
    id: number;
    project_id: number;
    title: string;
    description: string;
    created_user_id: number;
    responsible_user_id: number;
    deadline: string;
    status: number;
    priority: number;
    notify_3_days: boolean;
    notify_1_day: boolean;
    created_at: string;
    updated_at: string;
    deleted: boolean;
}

export interface FetchTasksPayload {
    page?: number;
    size?: number;
    project_id?: number;
    status?: number;
}

/*STATE*/

interface TasksState {
    items: Task[];
    pagination: Pagination | null;
    loading: boolean;
    error: string | null;
}

const initialState: TasksState = {
    items: [],
    pagination: null,
    loading: false,
    error: null,
};

/*THUNKS*/

//FETCH
export const fetchTasks = createAsyncThunk(
    'tasks/fetchTasks',
    async (params: FetchTasksPayload = {}, { rejectWithValue }) => {
        try {
            const res = await apiRequest<Task[]>('/tasks/search', 'POST', params);

            return {
                data: res.data,
                pagination: res.pagination,
            };
        } catch (e: any) {
            return rejectWithValue(e.message);
        }
    },
);

//CREATE
export const createTask = createAsyncThunk(
    'tasks/createTask',
    async (payload: Partial<Task>, { rejectWithValue }) => {
        try {
            const res = await apiRequest<Task>('/tasks/create', 'POST', payload);

            return res.data;
        } catch (e: any) {
            return rejectWithValue(e.message);
        }
    },
);

//UPDATE
export const updateTask = createAsyncThunk(
    'tasks/updateTask',
    async ({ id, data }: { id: number; data: Partial<Task> }, { rejectWithValue }) => {
        try {
            const res = await apiRequest<Task>(`/tasks/update/${id}`, 'PUT', data);

            return res.data;
        } catch (e: any) {
            return rejectWithValue(e.message);
        }
    },
);

//DELETE
export const deleteTask = createAsyncThunk(
    'tasks/deleteTask',
    async (id: number, { rejectWithValue }) => {
        try {
            await apiRequest(`/tasks/delete/${id}`, 'DELETE');
            return id;
        } catch (e: any) {
            return rejectWithValue(e.message);
        }
    },
);

/*SLICE*/
const tasksSlice = createSlice({
    name: 'tasks',
    initialState,
    reducers: {
        clearTasks: (state) => {
            state.items = [];
            state.pagination = null;
        },
    },
    extraReducers: (builder) => {
        builder
            /*FETCH*/
            .addCase(fetchTasks.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTasks.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.data;
                state.pagination = action.payload.pagination || null;
            })
            .addCase(fetchTasks.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            /*CREATE*/
            .addCase(createTask.fulfilled, (state, action) => {
                state.items.unshift(action.payload);
            })

            /*UPDATE*/
            .addCase(updateTask.fulfilled, (state, action) => {
                const index = state.items.findIndex((t) => t.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })

            /*DELETE*/
            .addCase(deleteTask.fulfilled, (state, action) => {
                state.items = state.items.filter((t) => t.id !== action.payload);
            });
    },
});

export const { clearTasks } = tasksSlice.actions;
export default tasksSlice.reducer;
