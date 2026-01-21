import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { apiRequestNew, type ApiResponse } from '@/utils/apiRequestNew';
import type { Pagination } from '@/features/users/userSlice';

/*TYPES*/
export interface MaterialMovement {
    id: number;
    date: string;
    from_warehouse_id: number | null;
    to_warehouse_id: number | null;
    user_id: number;
    note?: string;
    material_id: number;
    quantity: number;
    operation: string;
    status: number;
    created_at: string;
    updated_at: string;
    deleted: boolean;
}

export interface MaterialMovementsSearchParams {
    project_id: number;
    page: number;
    size: number;
}

/* STATE */
interface MaterialMovementsState {
    data: MaterialMovement[];
    pagination: Pagination | null;
    loading: boolean;
    error: string | null;
}

const initialState: MaterialMovementsState = {
    data: [],
    pagination: null,
    loading: false,
    error: null,
};

/* THUNK */
export const fetchMaterialMovements = createAsyncThunk<
    ApiResponse<MaterialMovement[]>,
    MaterialMovementsSearchParams,
    { rejectValue: string }
>('materialMovements/search', async (params, { rejectWithValue }) => {
    try {
        return await apiRequestNew<MaterialMovement[]>('/materialMovements/search', 'POST', params);
    } catch (error: any) {
        return rejectWithValue(error.message || 'Ошибка загрузки движений');
    }
});

/* SLICE */
const materialMovementsSlice = createSlice({
    name: 'materialMovements',
    initialState,
    reducers: {
        clearMaterialMovements(state) {
            state.data = [];
            state.pagination = null;
            state.loading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            /* -------- FETCH -------- */
            .addCase(fetchMaterialMovements.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(
                fetchMaterialMovements.fulfilled,
                (state, action: PayloadAction<ApiResponse<MaterialMovement[]>>) => {
                    state.loading = false;
                    state.data = action.payload.data;
                    state.pagination = action.payload.pagination ?? null;
                }
            )
            .addCase(fetchMaterialMovements.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Ошибка при загрузке данных';
            });
    },
});

/* EXPORTS */
export const { clearMaterialMovements } = materialMovementsSlice.actions;
export default materialMovementsSlice.reducer;
