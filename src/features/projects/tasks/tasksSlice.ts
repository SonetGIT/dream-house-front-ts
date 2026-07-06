import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { Pagination } from '@/features/users/userSlice';
import { apiRequest } from '@/utils/apiRequest';

export interface TaskAssignee {
    id?: number;
    user_id: number;
    status: number | null;
    user?: {
        id?: number;
        name?: string | null;
        first_name?: string | null;
        last_name?: string | null;
    } | null;
}

export interface Task {
    id: number;
    project_id: number;
    title: string;
    description: string;
    created_user_id: number;
    responsible_user_id: number | null;
    assignee_user_ids: number[];
    assignees: TaskAssignee[];
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
    assignee_user_ids: number[];
    deadline: string;
    priority: number | null;
}

export interface CreateTaskPayload {
    project_id: number;
    title: string;
    description: string;
    priority: number | null;
    deadline: string;
    assignee_user_ids: number[];
}

export interface UpdateTaskPayload {
    title?: string;
    description?: string;
    priority?: number | null;
    deadline?: string;
    status?: number;
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
    id?: number;
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

const getErrorMessage = (error: unknown, fallback: string) =>
    error instanceof Error ? error.message : fallback;

type RawTask = Record<string, unknown> & {
    id: number | string;
    project_id: number | string;
    title?: string | null;
    description?: string | null;
    created_user_id: number | string;
    responsible_user_id?: number | string | null;
    assignee_user_ids?: Array<number | string>;
    assignees?: Array<Record<string, unknown>>;
    deadline?: string | null;
    status: number | string;
    priority?: number | string | null;
    notify_3_days?: boolean | number | string | null;
    notify_1_day?: boolean | number | string | null;
    created_at?: string | null;
    updated_at?: string | null;
    deleted?: boolean | number | string | null;
};

const normalizeBoolean = (value: unknown) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value === 1;
    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();
        return normalized === '1' || normalized === 'true';
    }

    return false;
};

const normalizeTaskAssignees = (task: RawTask): TaskAssignee[] => {
    if (Array.isArray(task?.assignees) && task.assignees.length) {
        return task.assignees
            .map((item) => ({
                id: item?.id ? Number(item.id) : undefined,
                user_id: Number(item?.user_id || item?.id || 0),
                status:
                    item?.status === null || item?.status === undefined
                        ? null
                        : Number(item.status),
                user: item?.user || item?.user_ref || null,
            }))
            .filter((item) => item.user_id > 0);
    }

    if (Array.isArray(task?.assignee_user_ids) && task.assignee_user_ids.length) {
        return task.assignee_user_ids
            .map((userId: number | string) => Number(userId))
            .filter(Boolean)
            .map((user_id) => ({
                user_id,
                status: null,
                user: null,
            }));
    }

    if (task?.responsible_user_id) {
        return [
            {
                user_id: Number(task.responsible_user_id),
                status: task?.status === undefined ? null : Number(task.status),
                user: null,
            },
        ];
    }

    return [];
};

export const getTaskAssigneeIds = (task: Partial<Task> | null | undefined) => {
    if (!task) return [];

    if (Array.isArray(task.assignee_user_ids) && task.assignee_user_ids.length) {
        return task.assignee_user_ids.map((id) => Number(id)).filter(Boolean);
    }

    if (Array.isArray(task.assignees) && task.assignees.length) {
        return task.assignees.map((item) => Number(item.user_id)).filter(Boolean);
    }

    return task.responsible_user_id ? [Number(task.responsible_user_id)] : [];
};

const normalizeTask = (task: RawTask): Task => {
    const assignees = normalizeTaskAssignees(task);
    const assignee_user_ids = assignees.map((item) => Number(item.user_id)).filter(Boolean);

    return {
        id: Number(task.id),
        project_id: Number(task.project_id),
        title: String(task.title ?? ''),
        description: String(task.description ?? ''),
        created_user_id: Number(task.created_user_id),
        responsible_user_id:
            task?.responsible_user_id != null
                ? Number(task.responsible_user_id)
                : assignee_user_ids[0] || null,
        assignee_user_ids,
        assignees,
        deadline: String(task.deadline ?? ''),
        status: Number(task.status),
        priority: task?.priority == null ? null : Number(task.priority),
        notify_3_days: normalizeBoolean(task.notify_3_days),
        notify_1_day: normalizeBoolean(task.notify_1_day),
        created_at: String(task.created_at ?? ''),
        updated_at: String(task.updated_at ?? ''),
        deleted: normalizeBoolean(task.deleted),
    };
};

export const fetchTasks = createAsyncThunk<
    TasksResponse,
    FetchTasksPayload | undefined,
    { rejectValue: string }
>('tasks/fetchTasks', async (params = {}, { rejectWithValue }) => {
    try {
        const res = await apiRequest<RawTask[]>('/tasks/search', 'POST', params);

        const rawStatuses = res.stats?.statuses ?? {};
        const normalizedStatuses: Record<number, number> = Object.fromEntries(
            Object.entries(rawStatuses).map(([k, v]) => [Number(k), Number(v)]),
        );

        return {
            data: (res.data ?? []).map((task) => normalizeTask(task)),
            pagination: res.pagination ?? null,
            stats: res.stats
                ? {
                      ...res.stats,
                      statuses: normalizedStatuses,
                      overdueCount: Number(res.stats.overdueCount ?? 0),
                  }
                : null,
        };
    } catch (error: unknown) {
        return rejectWithValue(getErrorMessage(error, 'Ошибка загрузки задач'));
    }
});

export const createTask = createAsyncThunk<
    Task,
    CreateTaskPayload,
    { rejectValue: string }
>('tasks/createTask', async (payload, { rejectWithValue }) => {
    try {
        const res = await apiRequest<RawTask>('/tasks/create', 'POST', payload);
        return normalizeTask(res.data);
    } catch (error: unknown) {
        return rejectWithValue(getErrorMessage(error, 'Ошибка создания задачи'));
    }
});

export const updateTask = createAsyncThunk<
    Task,
    { id: number; data: UpdateTaskPayload },
    { rejectValue: string }
>('tasks/updateTask', async ({ id, data }, { rejectWithValue }) => {
    try {
        const res = await apiRequest<RawTask>(`/tasks/update/${id}`, 'PUT', data);
        return normalizeTask(res.data);
    } catch (error: unknown) {
        return rejectWithValue(getErrorMessage(error, 'Ошибка обновления задачи'));
    }
});

export const addTaskAssignees = createAsyncThunk<
    { taskId: number; assignee_user_ids: number[] },
    { taskId: number; assignee_user_ids: number[] },
    { rejectValue: string }
>('tasks/addTaskAssignees', async ({ taskId, assignee_user_ids }, { rejectWithValue }) => {
    try {
        try {
            await apiRequest(`/tasks/${taskId}/assignees/add`, 'POST', {
                assignee_user_ids,
            });
        } catch {
            await apiRequest(`/tasks/${taskId}/assignees/ad`, 'POST', {
                assignee_user_ids,
            });
        }

        return { taskId, assignee_user_ids };
    } catch (error: unknown) {
        return rejectWithValue(getErrorMessage(error, 'Ошибка добавления исполнителей'));
    }
});

export const updateOwnTaskAssigneeStatus = createAsyncThunk<
    { taskId: number; status: number },
    { taskId: number; status: number },
    { rejectValue: string }
>('tasks/updateOwnTaskAssigneeStatus', async ({ taskId, status }, { rejectWithValue }) => {
    try {
        await apiRequest(`/tasks/${taskId}/assignees/status`, 'PUT', { status });
        return { taskId, status };
    } catch (error: unknown) {
        return rejectWithValue(getErrorMessage(error, 'Ошибка изменения статуса'));
    }
});

export const deleteTask = createAsyncThunk<number, number, { rejectValue: string }>(
    'tasks/deleteTask',
    async (id, { rejectWithValue }) => {
        try {
            await apiRequest(`/tasks/delete/${id}`, 'DELETE');
            return id;
        } catch (error: unknown) {
            return rejectWithValue(getErrorMessage(error, 'Ошибка удаления задачи'));
        }
    },
);

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
            .addCase(updateTask.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateTask.fulfilled, (state, action) => {
                state.loading = false;

                const index = state.items.findIndex((task) => task.id === action.payload.id);
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
            .addCase(addTaskAssignees.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addTaskAssignees.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(addTaskAssignees.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Ошибка добавления исполнителей';
            })
            .addCase(updateOwnTaskAssigneeStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateOwnTaskAssigneeStatus.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(updateOwnTaskAssigneeStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Ошибка изменения статуса';
            })
            .addCase(deleteTask.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteTask.fulfilled, (state, action) => {
                state.loading = false;

                const deletedTask = state.items.find((task) => task.id === action.payload);
                state.items = state.items.filter((task) => task.id !== action.payload);

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

export const { clearTasks } = tasksSlice.actions;
export default tasksSlice.reducer;
