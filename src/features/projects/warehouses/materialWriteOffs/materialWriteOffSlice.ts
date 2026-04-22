import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiRequest } from '@/utils/apiRequest';
import type { Pagination } from '@/features/users/userSlice';

const MATERIAL_WRITE_OFF_ENDPOINT = '/materialWriteOffs';

/* TYPES */

export interface MaterialWriteOffWarehouse {
    id: number;
    name: string;
}

export interface MaterialWriteOffWorkPerformed {
    id: number;
    code: string | null;
    performed_person_name: string | null;
}

export interface MaterialWriteOffWorkPerformedItem {
    id: number;
    service_id: number | null;
    service_type?: number | null;
    stage_id: number | null;
    subsection_id: number | null;
    quantity: number;
}

export interface MaterialWriteOffItemMaterial {
    id: number;
    name: string;
}

export interface MaterialWriteOffItem {
    id: number;
    material_write_off_id: number;
    material_id: number;
    unit_of_measure: number | null;
    quantity: number;
    note: string | null;
    movement_id: number | null;
    created_at: string;
    updated_at: string;
    deleted: boolean;
    material?: MaterialWriteOffItemMaterial | null;
}

export interface MaterialWriteOff {
    id: number;
    project_id: number;
    block_id: number;
    warehouse_id: number;
    work_performed_id: number;
    work_performed_item_id: number;
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

    posted_at: string | null;
    created_at: string;
    updated_at: string;
    deleted: boolean;

    warehouse?: MaterialWriteOffWarehouse | null;
    work_performed?: MaterialWriteOffWorkPerformed | null;
    work_performed_item?: MaterialWriteOffWorkPerformedItem | null;
    items?: MaterialWriteOffItem[];
}

/* SEARCH PARAMS */

export interface MaterialWriteOffSearchParams {
    project_id?: number;
    block_id?: number;
    warehouse_id?: number;
    work_performed_id?: number;
    work_performed_item_id?: number;
    status?: number;
    date_from?: string;
    date_to?: string;
    page?: number;
    size?: number;
}

/* PAYLOADS */

export interface CreateMaterialWriteOffItemPayload {
    material_id: number;
    unit_of_measure: number | null;
    quantity: number;
    note?: string | null;
}

export interface CreateMaterialWriteOffPayload {
    warehouse_id: number;
    work_performed_item_id: number;
    note?: string | null;
    items: CreateMaterialWriteOffItemPayload[];
}

export interface UpdateMaterialWriteOffPayload {
    warehouse_id?: number;
    work_performed_item_id?: number;
    note?: string | null;
    items?: CreateMaterialWriteOffItemPayload[];

    signed_by_foreman?: boolean | null;
    signed_by_foreman_time?: string | null;

    signed_by_planning_engineer?: boolean | null;
    signed_by_planning_engineer_time?: string | null;

    signed_by_main_engineer?: boolean | null;
    signed_by_main_engineer_time?: string | null;

    signed_by_general_director?: boolean | null;
    signed_by_general_director_time?: string | null;

    posted_at?: string | null;
}

interface MaterialWriteOffState {
    data: MaterialWriteOff[];
    current: MaterialWriteOff | null;
    pagination: Pagination | null;
    loading: boolean;
    submitting: boolean;
    error: string | null;
}

const initialState: MaterialWriteOffState = {
    data: [],
    current: null,
    pagination: null,
    loading: false,
    submitting: false,
    error: null,
};

/* HELPERS */
const normalizeList = (value: unknown): MaterialWriteOff[] => {
    const data = value as any;

    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.rows)) return data.rows;
    if (data?.id) return [data];

    return [];
};

const normalizeItem = (value: unknown): MaterialWriteOff | null => {
    const data = value as any;

    if (!data) return null;
    if (data?.id) return data;
    if (data?.data?.id) return data.data;
    if (data?.item?.id) return data.item;

    return null;
};

const upsertItem = (state: MaterialWriteOffState, item: MaterialWriteOff) => {
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
export const fetchMaterialWriteOffs = createAsyncThunk<
    { data: MaterialWriteOff[]; pagination: Pagination | null },
    MaterialWriteOffSearchParams,
    { rejectValue: string }
>('materialWriteOff/search', async (params, { rejectWithValue }) => {
    try {
        const res = await apiRequest<MaterialWriteOff[]>(
            `${MATERIAL_WRITE_OFF_ENDPOINT}/search`,
            'POST',
            params,
        );

        return {
            data: normalizeList(res.data),
            pagination: res.pagination ?? null,
        };
    } catch (err: any) {
        return rejectWithValue(err.message || 'Ошибка загрузки списаний материалов');
    }
});

// GET BY ID
export const fetchMaterialWriteOffById = createAsyncThunk<
    MaterialWriteOff,
    number,
    { rejectValue: string }
>('materialWriteOff/getById', async (id, { rejectWithValue }) => {
    try {
        const res = await apiRequest<MaterialWriteOff>(
            `${MATERIAL_WRITE_OFF_ENDPOINT}/${id}`,
            'GET',
        );

        const item = normalizeItem(res.data);

        if (!item) {
            throw new Error('Списание материалов не найдено');
        }

        return item;
    } catch (err: any) {
        return rejectWithValue(err.message || 'Ошибка загрузки списания материалов');
    }
});

// CREATE
export const createMaterialWriteOff = createAsyncThunk<
    MaterialWriteOff,
    CreateMaterialWriteOffPayload,
    { rejectValue: string }
>('materialWriteOff/create', async (payload, { rejectWithValue }) => {
    try {
        const res = await apiRequest<MaterialWriteOff>(
            `${MATERIAL_WRITE_OFF_ENDPOINT}/create`,
            'POST',
            payload,
        );

        const item = normalizeItem(res.data);

        if (!item) {
            throw new Error('Сервер не вернул созданное списание материалов');
        }

        return item;
    } catch (err: any) {
        return rejectWithValue(err.message || 'Ошибка создания списания материалов');
    }
});

// UPDATE
export const updateMaterialWriteOff = createAsyncThunk<
    MaterialWriteOff,
    { id: number; data: UpdateMaterialWriteOffPayload },
    { rejectValue: string }
>('materialWriteOff/update', async ({ id, data }, { rejectWithValue }) => {
    try {
        const res = await apiRequest<MaterialWriteOff>(
            `${MATERIAL_WRITE_OFF_ENDPOINT}/update/${id}`,
            'PUT',
            data,
        );

        const item = normalizeItem(res.data);

        if (!item) {
            throw new Error('Сервер не вернул обновлённое списание материалов');
        }

        return item;
    } catch (err: any) {
        return rejectWithValue(err.message || 'Ошибка обновления списания материалов');
    }
});

// DELETE
export const deleteMaterialWriteOff = createAsyncThunk<number, number, { rejectValue: string }>(
    'materialWriteOff/delete',
    async (id, { rejectWithValue }) => {
        try {
            await apiRequest(`${MATERIAL_WRITE_OFF_ENDPOINT}/delete/${id}`, 'DELETE');
            return id;
        } catch (err: any) {
            return rejectWithValue(err.message || 'Ошибка удаления списания материалов');
        }
    },
);

// STATUS
export const updateMaterialWriteOffStatus = createAsyncThunk<
    MaterialWriteOff,
    { id: number; status: number },
    { rejectValue: string }
>('materialWriteOff/updateStatus', async ({ id, status }, { rejectWithValue }) => {
    try {
        const res = await apiRequest<MaterialWriteOff>(
            `${MATERIAL_WRITE_OFF_ENDPOINT}/update/${id}`,
            'PUT',
            { status },
        );

        const item = normalizeItem(res.data);

        if (!item) {
            throw new Error('Сервер не вернул обновлённый статус');
        }

        return item;
    } catch (err: any) {
        return rejectWithValue(err.message || 'Ошибка изменения статуса списания');
    }
});

export const signMaterialWriteOff = createAsyncThunk<
    MaterialWriteOff,
    { id: number; stage: 'foreman' | 'planning_engineer' | 'main_engineer' | 'general_director' },
    { rejectValue: string }
>('materialWriteOff/sign', async ({ id, stage }, { rejectWithValue }) => {
    try {
        const res = await apiRequest<MaterialWriteOff>(`/materialWriteOffs/sign/${id}`, 'POST', {
            stage,
        });

        const item = normalizeItem(res.data);

        if (!item) {
            throw new Error('Сервер не вернул подписанное списание');
        }

        return item;
    } catch (err: any) {
        return rejectWithValue(err.message || 'Ошибка подписания списания');
    }
});

/* SLICE */

const materialWriteOffSlice = createSlice({
    name: 'materialWriteOff',
    initialState,
    reducers: {
        clearMaterialWriteOffs: (state) => {
            state.data = [];
            state.current = null;
            state.pagination = null;
            state.loading = false;
            state.submitting = false;
            state.error = null;
        },

        clearCurrentMaterialWriteOff: (state) => {
            state.current = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // SEARCH
            .addCase(fetchMaterialWriteOffs.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMaterialWriteOffs.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchMaterialWriteOffs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Ошибка загрузки списаний материалов';
            })

            // GET BY ID
            .addCase(fetchMaterialWriteOffById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMaterialWriteOffById.fulfilled, (state, action) => {
                state.loading = false;
                state.current = action.payload;
                upsertItem(state, action.payload);
            })
            .addCase(fetchMaterialWriteOffById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Ошибка загрузки списания материалов';
            })

            // CREATE
            .addCase(createMaterialWriteOff.pending, (state) => {
                state.submitting = true;
                state.error = null;
            })
            .addCase(createMaterialWriteOff.fulfilled, (state, action) => {
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
            .addCase(createMaterialWriteOff.rejected, (state, action) => {
                state.submitting = false;
                state.error = action.payload ?? 'Ошибка создания списания материалов';
            })

            // UPDATE
            .addCase(updateMaterialWriteOff.pending, (state) => {
                state.submitting = true;
                state.error = null;
            })
            .addCase(updateMaterialWriteOff.fulfilled, (state, action) => {
                state.submitting = false;
                upsertItem(state, action.payload);
            })
            .addCase(updateMaterialWriteOff.rejected, (state, action) => {
                state.submitting = false;
                state.error = action.payload ?? 'Ошибка обновления списания материалов';
            })

            // DELETE
            .addCase(deleteMaterialWriteOff.pending, (state) => {
                state.submitting = true;
                state.error = null;
            })
            .addCase(deleteMaterialWriteOff.fulfilled, (state, action) => {
                state.submitting = false;
                state.data = state.data.filter((item) => item.id !== action.payload);

                if (state.current?.id === action.payload) {
                    state.current = null;
                }

                decrementPaginationTotal(state.pagination);
            })
            .addCase(deleteMaterialWriteOff.rejected, (state, action) => {
                state.submitting = false;
                state.error = action.payload ?? 'Ошибка удаления списания материалов';
            })

            // STATUS
            .addCase(updateMaterialWriteOffStatus.pending, (state) => {
                state.submitting = true;
                state.error = null;
            })
            .addCase(updateMaterialWriteOffStatus.fulfilled, (state, action) => {
                state.submitting = false;
                upsertItem(state, action.payload);
            })
            .addCase(updateMaterialWriteOffStatus.rejected, (state, action) => {
                state.submitting = false;
                state.error = action.payload ?? 'Ошибка изменения статуса списания';
            })

            .addCase(signMaterialWriteOff.pending, (state) => {
                state.submitting = true;
                state.error = null;
            })
            .addCase(signMaterialWriteOff.fulfilled, (state, action) => {
                state.submitting = false;
                upsertItem(state, action.payload);
            })
            .addCase(signMaterialWriteOff.rejected, (state, action) => {
                state.submitting = false;
                state.error = action.payload ?? 'Ошибка подписания списания';
            });
    },
});

export const { clearMaterialWriteOffs, clearCurrentMaterialWriteOff } =
    materialWriteOffSlice.actions;

export default materialWriteOffSlice.reducer;
