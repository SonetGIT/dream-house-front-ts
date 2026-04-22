import type { Pagination } from '@/features/users/userSlice';
import { apiRequest } from '@/utils/apiRequest';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// ==================== TYPES ====================
export interface TransferItem {
    id: number;
    warehouse_transfer_id: number;
    material_id: number;
    material_type: number;
    unit_of_measure: number;
    quantity: string; // В API приходит строкой "5.000"
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
    items: TransferItem[];
}

export interface WarehouseTransferForm {
    from_warehouse_id: number;
    to_warehouse_id: number;
    comment: string | null;
    items: Array<{
        material_id: number;
        material_type: number;
        unit_of_measure: number;
        quantity: string;
    }>;
}

export type WarehouseTransferFormData = Omit<
    WarehouseTransfer,
    | 'id'
    | 'posted_at'
    | 'created_user_id'
    | 'sender_signed'
    | 'sender_signed_user_id'
    | 'sender_signed_time'
    | 'receiver_signed'
    | 'receiver_signed_user_id'
    | 'receiver_signed_time'
    | 'created_at'
    | 'updated_at'
    | 'deleted'
    | 'items'
> & {
    items: Omit<
        TransferItem,
        'id' | 'warehouse_transfer_id' | 'created_at' | 'updated_at' | 'deleted'
    >[];
};

interface WarehouseTransfersState {
    data: WarehouseTransfer[];
    map: Record<number, WarehouseTransfer>;
    pagination: Pagination | null;
    loading: boolean;
    error: string | null;
}

// ==================== INITIAL STATE ====================
const initialState: WarehouseTransfersState = {
    data: [],
    map: {},
    pagination: null,
    loading: false,
    error: null,
};

// ==================== THUNKS ====================
// GET (с пагинацией)
export const fetchTransfers = createAsyncThunk(
    'warehouseTransfers/fetch',
    async (params: { page?: number; size?: number }, { rejectWithValue }) => {
        try {
            return await apiRequest<WarehouseTransfer[]>('/warehouse-transfers', 'GET', params);
        } catch (e: any) {
            return rejectWithValue(e.message);
        }
    },
);

// CREATE
export const createTransfer = createAsyncThunk(
    'warehouseTransfers/create',
    async (data: Partial<WarehouseTransferForm>, { rejectWithValue }) => {
        try {
            return await apiRequest<WarehouseTransfer>('/warehouse-transfers/create', 'POST', data);
        } catch (e: any) {
            return rejectWithValue(e.message);
        }
    },
);

// UPDATE
export const updateTransfer = createAsyncThunk(
    'warehouseTransfers/update',
    async ({ id, data }: { id: number; data: Partial<WarehouseTransfer> }, { rejectWithValue }) => {
        try {
            return await apiRequest<WarehouseTransfer>(
                `/warehouse-transfers/update/${id}`,
                'PUT',
                data,
            );
        } catch (e: any) {
            return rejectWithValue(e.message);
        }
    },
);

// DELETE
export const deleteTransfer = createAsyncThunk(
    'warehouseTransfers/delete',
    async (id: number, { rejectWithValue }) => {
        try {
            await apiRequest(`/warehouse-transfers/delete/${id}`, 'DELETE');
            return id;
        } catch (e: any) {
            return rejectWithValue(e.message);
        }
    },
);

// ==================== SLICE ====================
const warehouseTransfersSlice = createSlice({
    name: 'warehouseTransfers',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // FETCH
            .addCase(fetchTransfers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTransfers.fulfilled, (state, action) => {
                state.loading = false;

                const data = action.payload.data;

                state.data = data;
                state.map = Object.fromEntries(data.map((t) => [t.id, t]));
                state.pagination = action.payload.pagination || null;
            })
            .addCase(fetchTransfers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // CREATE
            .addCase(createTransfer.fulfilled, (state, action) => {
                const item = action.payload.data;

                state.data.unshift(item);
                state.map[item.id] = item;
            })

            // UPDATE
            .addCase(updateTransfer.fulfilled, (state, action) => {
                const updated = action.payload.data;

                state.map[updated.id] = updated;
                state.data = state.data.map((t) => (t.id === updated.id ? updated : t));
            })

            // DELETE
            .addCase(deleteTransfer.fulfilled, (state, action) => {
                const id = action.payload;

                delete state.map[id];
                state.data = state.data.filter((t) => t.id !== id);
            });
    },
});

export default warehouseTransfersSlice.reducer;
