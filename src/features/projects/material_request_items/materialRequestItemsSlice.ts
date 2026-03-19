import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '@/utils/apiRequest';
import type { Pagination } from '@/features/users/userSlice';

// ================= TYPES =================

export interface Material {
    id: number;
    name: string;
}

export interface MaterialRequestItem {
    id: number;
    material_request_id: number;
    material_estimate_item_id: number | null;
    material_type: number;
    material_id: number;
    unit_of_measure: number;
    quantity: number;
    price: number | null;
    currency: number | null;
    currency_rate: number | null;
    summ: number | null;
    status: number;
    stage_id: number;
    subsection_id: number;
    comment: string;
    created_at: string;
    updated_at: string;
    deleted: boolean;

    material?: Material;
    total_ordered?: number;
    remaining_quantity?: number;
}

export interface MaterialRequestItemsSearchPayload {
    material_request_id?: number;
    status?: number;
    page?: number;
    size?: number;
}

// ================= THUNKS =================

// 🔍 SEARCH
export const fetchMaterialRequestItems = createAsyncThunk(
    'materialRequestItems/fetch',
    async (payload: MaterialRequestItemsSearchPayload, { rejectWithValue }) => {
        try {
            const res = await apiRequest<MaterialRequestItem[]>(
                '/materialRequestItems/search',
                'POST',
                payload,
            );

            return {
                items: res.data,
                pagination: res.pagination,
            };
        } catch (e: any) {
            return rejectWithValue(e.message);
        }
    },
);

// ➕ CREATE
export const createMaterialRequestItem = createAsyncThunk(
    'materialRequestItems/create',
    async (payload: Partial<MaterialRequestItem>, { rejectWithValue }) => {
        try {
            const res = await apiRequest<MaterialRequestItem>(
                '/materialRequestItems/create',
                'POST',
                payload,
            );

            return res.data;
        } catch (e: any) {
            return rejectWithValue(e.message);
        }
    },
);

// ✏️ UPDATE
export const updateMaterialRequestItem = createAsyncThunk(
    'materialRequestItems/update',
    async (
        { id, data }: { id: number; data: Partial<MaterialRequestItem> },
        { rejectWithValue },
    ) => {
        try {
            const res = await apiRequest<MaterialRequestItem>(
                `/materialRequestItems/update/${id}`,
                'PUT',
                data,
            );

            return res.data;
        } catch (e: any) {
            return rejectWithValue(e.message);
        }
    },
);

// ❌ DELETE
export const deleteMaterialRequestItem = createAsyncThunk(
    'materialRequestItems/delete',
    async (id: number, { rejectWithValue }) => {
        try {
            await apiRequest(`/materialRequestItems/delete/${id}`, 'DELETE');

            return id;
        } catch (e: any) {
            return rejectWithValue(e.message);
        }
    },
);

// ================= SLICE =================

interface MaterialRequestItemsState {
    items: MaterialRequestItem[];
    pagination: Pagination | null;
    loading: boolean;
    error: string | null;
}

const initialState: MaterialRequestItemsState = {
    items: [],
    pagination: null,
    loading: false,
    error: null,
};

const materialRequestItemsSlice = createSlice({
    name: 'materialRequestItems',
    initialState,
    reducers: {
        clearItems(state) {
            state.items = [];
            state.pagination = null;
        },
    },
    extraReducers: (builder) => {
        builder

            // ===== FETCH =====
            .addCase(fetchMaterialRequestItems.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMaterialRequestItems.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.items;
                state.pagination = action.payload.pagination || null;
            })
            .addCase(fetchMaterialRequestItems.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // ===== CREATE =====
            .addCase(createMaterialRequestItem.fulfilled, (state, action) => {
                state.items.unshift(action.payload);
            })

            // ===== UPDATE =====
            .addCase(updateMaterialRequestItem.fulfilled, (state, action) => {
                const index = state.items.findIndex((i) => i.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })

            // ===== DELETE =====
            .addCase(deleteMaterialRequestItem.fulfilled, (state, action) => {
                state.items = state.items.filter((i) => i.id !== action.payload);
            });
    },
});

export const { clearItems } = materialRequestItemsSlice.actions;

export default materialRequestItemsSlice.reducer;
