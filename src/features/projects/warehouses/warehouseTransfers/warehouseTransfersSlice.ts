import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiRequest } from '@/utils/apiRequest';
import type { Pagination } from '@/features/users/userSlice';

/* TYPES */

export interface WarehouseTransfer {
    id: number;
    name: string;
}

export interface WarehouseTransferItemMaterial {
    id: number;
    name: string;
}

export interface WarehouseTransferItem {
    id: number;
    warehouse_transfer_id: number;
    material_id: number;
    material_type: number;
    unit_of_measure: number;
    quantity: string;
    created_at: string;
    updated_at: string;
    deleted: boolean;
}

export interface WarehouseTransfer {
    id: number;
    posted_at: string;
    from_warehouse_id: number;
    to_warehouse_id: number;
    created_user_id: number;
    status: number;
    comment: string | null;
    sender_signed: boolean;
    sender_signed_user_id: number | null;
    sender_signed_time: string | null;
    receiver_signed: boolean;
    receiver_signed_user_id: number | null;
    receiver_signed_time: string | null;
    created_at: string;
    updated_at: string;
    deleted: boolean;
    items: WarehouseTransferItem[];
    // Опционально: вложенные данные, если бэкенд их подгружает
    from_warehouse?: { id: number; name: string } | null;
    to_warehouse?: { id: number; name: string } | null;
    created_user?: { id: number; name: string } | null;
}

/* SEARCH PARAMS */

export interface WarehouseTransferSearchParams {
    project_id?: number;
    warehouse_id?: number;
    status?: number;
    page?: number;
    size?: number;
}

/* PAYLOADS */

export interface CreateWarehouseTransferItemPayload {
    material_id: number;
    material_type: number;
    unit_of_measure: number;
    quantity: string;
}

export interface CreateWarehouseTransferPayload {
    from_warehouse_id: number;
    to_warehouse_id: number;
    posted_at?: string;
    comment?: string | null;
    items: CreateWarehouseTransferItemPayload[];
}

// export interface UpdateWarehouseTransferPayload {
//     warehouse_id?: number;
//     posted_at?: string;
//     note?: string | null;
//     items?: CreateWarehouseTransferItemPayload[];

//     foreman_user_id: number | null;
//     signed_by_foreman: boolean | null;
//     signed_by_foreman_time: string | null;

//     planning_engineer_user_id: number | null;
//     signed_by_planning_engineer: boolean | null;
//     signed_by_planning_engineer_time: string | null;

//     main_engineer_user_id: number | null;
//     signed_by_main_engineer: boolean | null;
//     signed_by_main_engineer_time: string | null;

//     general_director_user_id: number | null;
//     signed_by_general_director: boolean | null;
//     signed_by_general_director_time: string | null;
// }

interface WarehouseTransferState {
    data: WarehouseTransfer[];
    current: WarehouseTransfer | null;
    pagination: Pagination | null;
    loading: boolean;
    submitting: boolean;
    error: string | null;
}

const initialState: WarehouseTransferState = {
    data: [],
    current: null,
    pagination: null,
    loading: false,
    submitting: false,
    error: null,
};

/* HELPERS */

const normalizeList = (value: unknown): WarehouseTransfer[] => {
    const data = value as any;

    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.rows)) return data.rows;
    if (data?.id) return [data];

    return [];
};

const normalizeItem = (value: unknown): WarehouseTransfer | null => {
    const data = value as any;

    if (!data) return null;
    if (data?.id) return data;
    if (data?.data?.id) return data.data;
    if (data?.item?.id) return data.item;

    return null;
};

const upsertItem = (state: WarehouseTransferState, item: WarehouseTransfer) => {
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

/* THUNKS */
// SEARCH
export const fetchWarehouseTransfers = createAsyncThunk<
    { data: WarehouseTransfer[]; pagination: Pagination | null },
    WarehouseTransferSearchParams,
    { rejectValue: string }
>('warehouseTransfers/search', async (params, { rejectWithValue }) => {
    try {
        const res = await apiRequest<WarehouseTransfer[]>(
            '/warehouseTransfers/search',
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
export const fetchWarehouseTransferById = createAsyncThunk<
    WarehouseTransfer,
    number,
    { rejectValue: string }
>('warehouseTransfers/getById', async (id, { rejectWithValue }) => {
    try {
        const res = await apiRequest<WarehouseTransfer>(`/warehouseTransfers/${id}`, 'GET');

        const item = normalizeItem(res.data);

        if (!item) {
            throw new Error('Наклданая не найдена');
        }

        return item;
    } catch (err: any) {
        return rejectWithValue(err.message || 'Ошибка загрузки накладной');
    }
});

// CREATE
export const createWarehouseTransfer = createAsyncThunk<
    WarehouseTransfer,
    CreateWarehouseTransferPayload,
    { rejectValue: string }
>('warehouseTransfers/create', async (payload, { rejectWithValue }) => {
    try {
        const res = await apiRequest<WarehouseTransfer>(
            '/warehouseTransfers/create',
            'POST',
            payload,
        );

        const item = normalizeItem(res.data);

        if (!item) {
            throw new Error('Сервер не вернул созданный накладной');
        }

        return item;
    } catch (err: any) {
        return rejectWithValue(err.message || 'Ошибка создания списания накладной');
    }
});

// SIGN
export const signWarehouseTransfer = createAsyncThunk<
    WarehouseTransfer,
    { id: number; side: 'sender' | 'receiver' },
    { rejectValue: string }
>('warehouseTransfers/sign', async ({ id, side }, { rejectWithValue }) => {
    try {
        const res = await apiRequest<WarehouseTransfer>(`/warehouseTransfers/sign/${id}`, 'POST', {
            side,
        });

        const item = normalizeItem(res.data);

        if (!item) {
            throw new Error('Сервер не вернул подписанное перемещение');
        }

        return item;
    } catch (err: any) {
        return rejectWithValue(err.message || 'Ошибка в подписании в перемещении');
    }
});

/* SLICE */
const warehouseTransferSlice = createSlice({
    name: 'warehouseTransfers',
    initialState,
    reducers: {
        clearWarehouseTransfers: (state) => {
            state.data = [];
            state.current = null;
            state.pagination = null;
            state.loading = false;
            state.submitting = false;
            state.error = null;
        },
        clearCurrentWarehouseTransfer: (state) => {
            state.current = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // SEARCH
            .addCase(fetchWarehouseTransfers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchWarehouseTransfers.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchWarehouseTransfers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Ошибка загрузки списаний МБП';
            })

            // GET BY ID
            .addCase(fetchWarehouseTransferById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchWarehouseTransferById.fulfilled, (state, action) => {
                state.loading = false;
                state.current = action.payload;
                upsertItem(state, action.payload);
            })
            .addCase(fetchWarehouseTransferById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Ошибка загрузки списания МБП';
            })

            // CREATE
            .addCase(createWarehouseTransfer.pending, (state) => {
                state.submitting = true;
                state.error = null;
            })
            .addCase(createWarehouseTransfer.fulfilled, (state, action) => {
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
            .addCase(createWarehouseTransfer.rejected, (state, action) => {
                state.submitting = false;
                state.error = action.payload ?? 'Ошибка создания списания МБП';
            })

            // SIGN
            .addCase(signWarehouseTransfer.pending, (state) => {
                state.submitting = true;
                state.error = null;
            })
            .addCase(signWarehouseTransfer.fulfilled, (state, action) => {
                state.submitting = false;
                upsertItem(state, action.payload);
            })
            .addCase(signWarehouseTransfer.rejected, (state, action) => {
                state.submitting = false;
                state.error = action.payload ?? 'Ошибка подписания списания МБП';
            });
    },
});

export const { clearWarehouseTransfers, clearCurrentWarehouseTransfer } =
    warehouseTransferSlice.actions;
export default warehouseTransferSlice.reducer;
