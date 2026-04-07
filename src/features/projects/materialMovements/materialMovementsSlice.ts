import type { Pagination } from '@/features/users/userSlice';
import { apiRequest } from '@/utils/apiRequest';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

//TYPES
export type OperationType = '+' | '-';

export interface WarehouseMovement {
    id: number;
    project_id: number;
    date: string;
    from_warehouse_id: number | null;
    to_warehouse_id: number | null;
    user_id: number;
    note: string;
    material_id: number;
    quantity: number;
    operation: OperationType;
    status: number;
    created_at: string;
    updated_at: string;
    deleted: boolean;
}
interface WarehouseMovementsState {
    items: WarehouseMovement[];
    map: Record<number, WarehouseMovement>;
    pagination: Pagination | null;
    loading: boolean;
    error: string | null;
}

//INITIAL

const initialState: WarehouseMovementsState = {
    items: [],
    map: {},
    pagination: null,
    loading: false,
    error: null,
};

//THUNKS

//GET
export const fetchMaterialMovements = createAsyncThunk(
    'materialMovements/fetch',
    async (
        params: {
            warehouse_id: number;
            page?: number;
            size?: number;
        },
        { rejectWithValue },
    ) => {
        try {
            return await apiRequest<WarehouseMovement[]>(
                '/materialMovements/search',
                'POST',
                params,
            );
        } catch (e: any) {
            return rejectWithValue(e.message);
        }
    },
);

//CREATE
export const createMovement = createAsyncThunk(
    'materialMovements/create',
    async (
        payload: {
            project_id: number;
            material_id: number;
            quantity: number;
            operation: OperationType;
            from_warehouse_id?: number | null;
            to_warehouse_id?: number | null;
            note?: string;
        },
        { rejectWithValue },
    ) => {
        try {
            return await apiRequest<WarehouseMovement>(
                '/materialMovements/create',
                'POST',
                payload,
            );
        } catch (e: any) {
            return rejectWithValue(e.message);
        }
    },
);

//UPDATE (если разрешено backend)
export const updateMovement = createAsyncThunk(
    'materialMovements/update',
    async ({ id, data }: { id: number; data: Partial<WarehouseMovement> }, { rejectWithValue }) => {
        try {
            return await apiRequest<WarehouseMovement>(
                `/materialMovements/update/${id}`,
                'PUT',
                data,
            );
        } catch (e: any) {
            return rejectWithValue(e.message);
        }
    },
);

//DELETE
export const deleteMovement = createAsyncThunk(
    'materialMovements/delete',
    async (id: number, { rejectWithValue }) => {
        try {
            await apiRequest(`/materialMovements/delete/${id}`, 'DELETE');
            return id;
        } catch (e: any) {
            return rejectWithValue(e.message);
        }
    },
);

//SLICE

const materialMovementsSlice = createSlice({
    name: 'materialMovements',
    initialState,
    reducers: {
        clearMovements: (state) => {
            state.items = [];
            state.map = {};
            state.pagination = null;
        },
    },

    extraReducers: (builder) => {
        builder

            // ===== FETCH =====
            .addCase(fetchMaterialMovements.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMaterialMovements.fulfilled, (state, action) => {
                state.loading = false;

                const items = action.payload.data;

                state.items = items;
                state.map = Object.fromEntries(items.map((i) => [i.id, i]));
                state.pagination = action.payload.pagination || null;
            })
            .addCase(fetchMaterialMovements.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // ===== CREATE =====
            .addCase(createMovement.fulfilled, (state, action) => {
                const item = action.payload.data;

                state.items.unshift(item);
                state.map[item.id] = item;
            })

            // ===== UPDATE =====
            .addCase(updateMovement.fulfilled, (state, action) => {
                const updated = action.payload.data;

                state.map[updated.id] = updated;
                state.items = state.items.map((i) => (i.id === updated.id ? updated : i));
            })

            // ===== DELETE =====
            .addCase(deleteMovement.fulfilled, (state, action) => {
                const id = action.payload;

                delete state.map[id];
                state.items = state.items.filter((i) => i.id !== id);
            });
    },
});

export const { clearMovements } = materialMovementsSlice.actions;

export default materialMovementsSlice.reducer;
