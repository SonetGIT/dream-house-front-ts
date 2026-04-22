import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiRequest } from '@/utils/apiRequest';
import type { Pagination } from '@/features/users/userSlice';

const PROCESSING_WRITE_OFF_ENDPOINT = '/materialProcessingWriteOffs';

/* TYPES */

export interface ProcessingWriteOffWarehouse {
    id: number;
    name: string;
}

export interface ProcessingWriteOffItemMaterial {
    id: number;
    name: string;
}

export interface ProcessingWriteOffItem {
    id: number;
    processing_write_off_id: number;
    material_id: number;
    unit_of_measure: number | null;
    quantity: number | string;
    note: string | null;
    movement_id: number | null;
    created_at: string;
    updated_at: string;
    deleted: boolean;
    material?: ProcessingWriteOffItemMaterial | null;
}

export interface ProcessingWriteOff {
    id: number;
    project_id: number;
    warehouse_id: number;
    posted_at: string;
    status: number;
    note: string | null;
    created_user_id: number;

    foreman_user_id: number | null;
    signed_by_foreman: boolean | null;
    signed_by_foreman_time: string | null;

    planning_engineer_user_id: number | null;
    signed_by_planning_engineer: boolean | null;
    signed_by_planning_engineer_time: string | null;

    main_engineer_user_id: number | null;
    signed_by_main_engineer: boolean | null;
    signed_by_main_engineer_time: string | null;

    general_director_user_id: number | null;
    signed_by_general_director: boolean | null;
    signed_by_general_director_time: string | null;

    created_at: string;
    updated_at: string;
    deleted: boolean;

    warehouse?: ProcessingWriteOffWarehouse | null;
    items?: ProcessingWriteOffItem[];
}

/* SEARCH PARAMS */

export interface ProcessingWriteOffSearchParams {
    project_id?: number;
    warehouse_id?: number;
    status?: number;
    date_from?: string;
    date_to?: string;
    page?: number;
    size?: number;
}

/* PAYLOADS */

export interface CreateProcessingWriteOffItemPayload {
    material_id: number;
    unit_of_measure: number | null;
    quantity: number;
    note?: string | null;
}

export interface CreateProcessingWriteOffPayload {
    warehouse_id: number;
    posted_at: string;
    note?: string | null;
    items: CreateProcessingWriteOffItemPayload[];
}

export interface UpdateProcessingWriteOffPayload {
    warehouse_id?: number;
    posted_at?: string;
    note?: string | null;
    items?: CreateProcessingWriteOffItemPayload[];

    foreman_user_id: number | null;
    signed_by_foreman: boolean | null;
    signed_by_foreman_time: string | null;

    planning_engineer_user_id: number | null;
    signed_by_planning_engineer: boolean | null;
    signed_by_planning_engineer_time: string | null;

    main_engineer_user_id: number | null;
    signed_by_main_engineer: boolean | null;
    signed_by_main_engineer_time: string | null;

    general_director_user_id: number | null;
    signed_by_general_director: boolean | null;
    signed_by_general_director_time: string | null;
}

interface ProcessingWriteOffState {
    data: ProcessingWriteOff[];
    current: ProcessingWriteOff | null;
    pagination: Pagination | null;
    loading: boolean;
    submitting: boolean;
    error: string | null;
}

const initialState: ProcessingWriteOffState = {
    data: [],
    current: null,
    pagination: null,
    loading: false,
    submitting: false,
    error: null,
};

/* HELPERS */

const normalizeList = (value: unknown): ProcessingWriteOff[] => {
    const data = value as any;

    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.rows)) return data.rows;
    if (data?.id) return [data];

    return [];
};

const normalizeItem = (value: unknown): ProcessingWriteOff | null => {
    const data = value as any;

    if (!data) return null;
    if (data?.id) return data;
    if (data?.data?.id) return data.data;
    if (data?.item?.id) return data.item;

    return null;
};

const upsertItem = (state: ProcessingWriteOffState, item: ProcessingWriteOff) => {
    const index = state.data.findIndex((row) => row.id === item.id);

    if (index !== -1) {
        state.data[index] = item;
    } else {
        state.data.unshift(item);
    }

    if (state.current?.id === item.id) {
        state.current = item;
    }
};

const decrementPaginationTotal = (pagination: Pagination | null) => {
    if (!pagination) return;

    pagination.total = Math.max(Number(pagination.total || 0) - 1, 0);

    if ('pages' in pagination) {
        pagination.pages = Math.max(Math.ceil(pagination.total / pagination.size), 1);
    }
};

/* THUNKS */

// SEARCH
export const fetchProcessingWriteOffs = createAsyncThunk<
    { data: ProcessingWriteOff[]; pagination: Pagination | null },
    ProcessingWriteOffSearchParams,
    { rejectValue: string }
>('processingWriteOff/search', async (params, { rejectWithValue }) => {
    try {
        const res = await apiRequest<ProcessingWriteOff[]>(
            `${PROCESSING_WRITE_OFF_ENDPOINT}/search`,
            'POST',
            params,
        );

        return {
            data: normalizeList(res.data),
            pagination: res.pagination ?? null,
        };
    } catch (err: any) {
        return rejectWithValue(err.message || 'Ошибка загрузки списаний МБП');
    }
});

// GET BY ID
export const fetchProcessingWriteOffById = createAsyncThunk<
    ProcessingWriteOff,
    number,
    { rejectValue: string }
>('processingWriteOff/getById', async (id, { rejectWithValue }) => {
    try {
        const res = await apiRequest<ProcessingWriteOff>(
            `${PROCESSING_WRITE_OFF_ENDPOINT}/${id}`,
            'GET',
        );

        const item = normalizeItem(res.data);

        if (!item) {
            throw new Error('Списание МБП не найдено');
        }

        return item;
    } catch (err: any) {
        return rejectWithValue(err.message || 'Ошибка загрузки списания МБП');
    }
});

// CREATE
export const createProcessingWriteOff = createAsyncThunk<
    ProcessingWriteOff,
    CreateProcessingWriteOffPayload,
    { rejectValue: string }
>('processingWriteOff/create', async (payload, { rejectWithValue }) => {
    try {
        const res = await apiRequest<ProcessingWriteOff>(
            `${PROCESSING_WRITE_OFF_ENDPOINT}/create`,
            'POST',
            payload,
        );

        const item = normalizeItem(res.data);

        if (!item) {
            throw new Error('Сервер не вернул созданное списание МБП');
        }

        return item;
    } catch (err: any) {
        return rejectWithValue(err.message || 'Ошибка создания списания МБП');
    }
});

// UPDATE
export const updateProcessingWriteOff = createAsyncThunk<
    ProcessingWriteOff,
    { id: number; data: UpdateProcessingWriteOffPayload },
    { rejectValue: string }
>('processingWriteOff/update', async ({ id, data }, { rejectWithValue }) => {
    try {
        const res = await apiRequest<ProcessingWriteOff>(
            `${PROCESSING_WRITE_OFF_ENDPOINT}/update/${id}`,
            'PUT',
            data,
        );

        const item = normalizeItem(res.data);

        if (!item) {
            throw new Error('Сервер не вернул обновлённое списание МБП');
        }

        return item;
    } catch (err: any) {
        return rejectWithValue(err.message || 'Ошибка обновления списания МБП');
    }
});

// DELETE
export const deleteProcessingWriteOff = createAsyncThunk<number, number, { rejectValue: string }>(
    'processingWriteOff/delete',
    async (id, { rejectWithValue }) => {
        try {
            await apiRequest(`${PROCESSING_WRITE_OFF_ENDPOINT}/delete/${id}`, 'DELETE');
            return id;
        } catch (err: any) {
            return rejectWithValue(err.message || 'Ошибка удаления списания МБП');
        }
    },
);

// SIGN
export const signProcessingWriteOff = createAsyncThunk<
    ProcessingWriteOff,
    { id: number; stage: 'foreman' | 'planning_engineer' | 'main_engineer' | 'general_director' },
    { rejectValue: string }
>('processingWriteOff/sign', async ({ id, stage }, { rejectWithValue }) => {
    try {
        const res = await apiRequest<ProcessingWriteOff>(
            `${PROCESSING_WRITE_OFF_ENDPOINT}/sign/${id}`,
            'POST',
            {
                stage,
            },
        );

        const item = normalizeItem(res.data);

        if (!item) {
            throw new Error('Сервер не вернул подписанное списание МБП');
        }

        return item;
    } catch (err: any) {
        return rejectWithValue(err.message || 'Ошибка подписания списания МБП');
    }
});

/* SLICE */

const processingWriteOffSlice = createSlice({
    name: 'processingWriteOff',
    initialState,
    reducers: {
        clearProcessingWriteOffs: (state) => {
            state.data = [];
            state.current = null;
            state.pagination = null;
            state.loading = false;
            state.submitting = false;
            state.error = null;
        },
        clearCurrentProcessingWriteOff: (state) => {
            state.current = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // SEARCH
            .addCase(fetchProcessingWriteOffs.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProcessingWriteOffs.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchProcessingWriteOffs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Ошибка загрузки списаний МБП';
            })

            // GET BY ID
            .addCase(fetchProcessingWriteOffById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProcessingWriteOffById.fulfilled, (state, action) => {
                state.loading = false;
                state.current = action.payload;
                upsertItem(state, action.payload);
            })
            .addCase(fetchProcessingWriteOffById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Ошибка загрузки списания МБП';
            })

            // CREATE
            .addCase(createProcessingWriteOff.pending, (state) => {
                state.submitting = true;
                state.error = null;
            })
            .addCase(createProcessingWriteOff.fulfilled, (state, action) => {
                state.submitting = false;
                state.current = action.payload;
                state.data.unshift(action.payload);

                if (state.pagination) {
                    state.pagination.total += 1;

                    if ('pages' in state.pagination) {
                        state.pagination.pages = Math.max(
                            Math.ceil(state.pagination.total / state.pagination.size),
                            1,
                        );
                    }
                }
            })
            .addCase(createProcessingWriteOff.rejected, (state, action) => {
                state.submitting = false;
                state.error = action.payload ?? 'Ошибка создания списания МБП';
            })

            // UPDATE
            .addCase(updateProcessingWriteOff.pending, (state) => {
                state.submitting = true;
                state.error = null;
            })
            .addCase(updateProcessingWriteOff.fulfilled, (state, action) => {
                state.submitting = false;
                upsertItem(state, action.payload);
            })
            .addCase(updateProcessingWriteOff.rejected, (state, action) => {
                state.submitting = false;
                state.error = action.payload ?? 'Ошибка обновления списания МБП';
            })

            // DELETE
            .addCase(deleteProcessingWriteOff.pending, (state) => {
                state.submitting = true;
                state.error = null;
            })
            .addCase(deleteProcessingWriteOff.fulfilled, (state, action) => {
                state.submitting = false;
                state.data = state.data.filter((item) => item.id !== action.payload);

                if (state.current?.id === action.payload) {
                    state.current = null;
                }

                decrementPaginationTotal(state.pagination);
            })
            .addCase(deleteProcessingWriteOff.rejected, (state, action) => {
                state.submitting = false;
                state.error = action.payload ?? 'Ошибка удаления списания МБП';
            })

            // SIGN
            .addCase(signProcessingWriteOff.pending, (state) => {
                state.submitting = true;
                state.error = null;
            })
            .addCase(signProcessingWriteOff.fulfilled, (state, action) => {
                state.submitting = false;
                upsertItem(state, action.payload);
            })
            .addCase(signProcessingWriteOff.rejected, (state, action) => {
                state.submitting = false;
                state.error = action.payload ?? 'Ошибка подписания списания МБП';
            });
    },
});

export const { clearProcessingWriteOffs, clearCurrentProcessingWriteOff } =
    processingWriteOffSlice.actions;
export default processingWriteOffSlice.reducer;
