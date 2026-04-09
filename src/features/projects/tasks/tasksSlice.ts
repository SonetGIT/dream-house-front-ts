import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Pagination } from '@/features/users/userSlice';
import { apiRequest } from '@/utils/apiRequest';

/* TYPES */
export interface Task {
    id: number;
    project_id: number;
    title: string;
    description: string;
    created_user_id: number;
    responsible_user_id: number | null;
    deadline: string;
    status: number;
    priority: number | null;
    notify_3_days: boolean;
    notify_1_day: boolean;
    created_at: string;
    updated_at: string;
    deleted: boolean;
}

export interface TaskForm {
    title: string;
    description: string;
    responsible_user_id: number | null;
    deadline: string;
    priority: number | null;
}

export type TaskFormData = Omit<
    Task,
    'id' | 'notify_3_days' | 'notify_1_day' | 'created_at' | 'updated_at' | 'deleted'
>;

export interface FetchTasksPayload {
    page?: number;
    size?: number;
    project_id?: number;
    status?: number;
    user_id?: number;
}

export interface TasksStats {
    statuses: Record<number, number>;
    overdueCount: number;
}

export interface TasksResponse {
    data: Task[];
    stats: TasksStats | null;
    pagination: Pagination | null;
}

/* STATE */
interface TasksState {
    items: Task[];
    stats: TasksStats | null;
    pagination: Pagination | null;
    loading: boolean;
    error: string | null;
}

const initialState: TasksState = {
    items: [],
    stats: null,
    pagination: null,
    loading: false,
    error: null,
};

/* THUNKS */

/* FETCH */
export const fetchTasks = createAsyncThunk<
    TasksResponse,
    FetchTasksPayload | undefined,
    { rejectValue: string }
>('tasks/fetchTasks', async (params = {}, { rejectWithValue }) => {
    try {
        const res = await apiRequest<any>('/tasks/search', 'POST', params);

        const rawStatuses = res.stats?.statuses ?? {};
        const normalizedStatuses: Record<number, number> = Object.fromEntries(
            Object.entries(rawStatuses).map(([k, v]) => [Number(k), Number(v)]),
        );

        return {
            data: res.data ?? [],
            pagination: res.pagination ?? null,
            stats: res.stats
                ? {
                      ...res.stats,
                      statuses: normalizedStatuses,
                      overdueCount: Number(res.stats.overdueCount ?? 0),
                  }
                : null,
        };
    } catch (e: any) {
        return rejectWithValue(e.message || 'Ошибка загрузки задач');
    }
});

/* CREATE */
export const createTask = createAsyncThunk<Task, Partial<Task>, { rejectValue: string }>(
    'tasks/createTask',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await apiRequest<Task>('/tasks/create', 'POST', payload);
            return res.data;
        } catch (e: any) {
            return rejectWithValue(e.message || 'Ошибка создания задачи');
        }
    },
);

/* UPDATE */
export const updateTask = createAsyncThunk<
    Task,
    { id: number; data: Partial<Task> },
    { rejectValue: string }
>('tasks/updateTask', async ({ id, data }, { rejectWithValue }) => {
    try {
        const res = await apiRequest<Task>(`/tasks/update/${id}`, 'PUT', data);
        return res.data;
    } catch (e: any) {
        return rejectWithValue(e.message || 'Ошибка обновления задачи');
    }
});

/* DELETE */
export const deleteTask = createAsyncThunk<number, number, { rejectValue: string }>(
    'tasks/deleteTask',
    async (id, { rejectWithValue }) => {
        try {
            await apiRequest(`/tasks/delete/${id}`, 'DELETE');
            return id;
        } catch (e: any) {
            return rejectWithValue(e.message || 'Ошибка удаления задачи');
        }
    },
);

/* SLICE */
const tasksSlice = createSlice({
    name: 'tasks',
    initialState,
    reducers: {
        clearTasks: (state) => {
            state.items = [];
            state.pagination = null;
            state.stats = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            /* FETCH */
            .addCase(fetchTasks.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTasks.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.data;
                state.pagination = action.payload.pagination;
                state.stats = action.payload.stats;
            })
            .addCase(fetchTasks.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Ошибка загрузки задач';
            })

            /* CREATE */
            .addCase(createTask.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createTask.fulfilled, (state, action) => {
                state.loading = false;
                state.items.unshift(action.payload);

                if (state.pagination) {
                    state.pagination.total += 1;
                }

                if (state.stats) {
                    const status = action.payload.status;
                    state.stats.statuses[status] = (state.stats.statuses[status] || 0) + 1;
                }
            })
            .addCase(createTask.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Ошибка создания задачи';
            })

            /* UPDATE */
            .addCase(updateTask.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateTask.fulfilled, (state, action) => {
                state.loading = false;

                const index = state.items.findIndex((t) => t.id === action.payload.id);
                if (index !== -1) {
                    const oldStatus = state.items[index].status;
                    const newStatus = action.payload.status;

                    state.items[index] = action.payload;

                    if (state.stats && oldStatus !== newStatus) {
                        state.stats.statuses[oldStatus] = Math.max(
                            (state.stats.statuses[oldStatus] || 1) - 1,
                            0,
                        );

                        state.stats.statuses[newStatus] =
                            (state.stats.statuses[newStatus] || 0) + 1;
                    }
                }
            })
            .addCase(updateTask.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Ошибка обновления задачи';
            })

            /* DELETE */
            .addCase(deleteTask.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteTask.fulfilled, (state, action) => {
                state.loading = false;

                const deletedTask = state.items.find((t) => t.id === action.payload);
                state.items = state.items.filter((t) => t.id !== action.payload);

                if (state.pagination) {
                    state.pagination.total = Math.max(state.pagination.total - 1, 0);
                }

                if (state.stats && deletedTask) {
                    const status = deletedTask.status;
                    state.stats.statuses[status] = Math.max(
                        (state.stats.statuses[status] || 1) - 1,
                        0,
                    );
                }
            })
            .addCase(deleteTask.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Ошибка удаления задачи';
            });
    },
});

/* EXPORTS */
export const { clearTasks } = tasksSlice.actions;
export default tasksSlice.reducer;
