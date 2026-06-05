import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiRequest } from '@/utils/apiRequest';
import type { Pagination } from '@/features/users/userSlice';

export interface SalesFloor {
    id: number;
    project_id: number;
    block_id: number;
    floor_number: number;
    name: string | null;
    sort_order: number | null;
    created_at: string;
    updated_at: string;
    deleted: boolean;
}
export interface SalesFloorSearchPayload {
    project_id?: number;
    block_id?: number;
    page?: number;
    size?: number;
}

export interface SalesFloorCreatePayload {
    project_id: number;
    block_id: number;
    floor_number: number;
    name?: string | null;
    sort_order?: number | null;
}

export interface SalesFloorUpdatePayload {
    project_id?: number;
    block_id?: number;
    floor_number?: number;
    name?: string | null;
    sort_order?: number | null;
}

interface SalesFloorsState {
    items: SalesFloor[];
    pagination: Pagination | null;
    loading: boolean;
    error: string | null;
    lastCreated: SalesFloor | null;
    lastUpdated: SalesFloor | null;
    lastDeletedId: number | null;
}

const initialState: SalesFloorsState = {
    items: [],
    pagination: null,
    loading: false,
    error: null,
    lastCreated: null,
    lastUpdated: null,
    lastDeletedId: null,
};
export const fetchSalesFloor = createAsyncThunk<
    { data: SalesFloor[]; pagination: Pagination | null },
    SalesFloorSearchPayload | undefined,
    { rejectValue: string }
>('salesFloors/search', async (params = {}, { rejectWithValue }) => {
    try {
        const res = await apiRequest<SalesFloor[]>('/sales/floors/search', 'POST', params);
        return {
            data: res.data ?? [],
            pagination: res.pagination ?? null,
        };
    } catch (err: unknown) {
        return rejectWithValue(err instanceof Error ? err.message : 'Не удалось загрузить этажи');
    }
});
export const createSalesFloor = createAsyncThunk<
    SalesFloor,
    SalesFloorCreatePayload,
    { rejectValue: string }
>('salesFloors/create', async (payload, { rejectWithValue }) => {
    try {
        const res = await apiRequest<SalesFloor>('/sales/floors/create', 'POST', payload);
        return res.data;
    } catch (err: unknown) {
        return rejectWithValue(err instanceof Error ? err.message : 'Не удалось создать этаж');
    }
});

export const updateSalesFloor = createAsyncThunk<
    SalesFloor,
    { id: number; payload: SalesFloorUpdatePayload },
    { rejectValue: string }
>('salesFloors/update', async ({ id, payload }, { rejectWithValue }) => {
    try {
        const res = await apiRequest<SalesFloor>(`/sales/floors/update/${id}`, 'PUT', payload);
        return res.data;
    } catch (err: unknown) {
        return rejectWithValue(err instanceof Error ? err.message : 'Не удалось обновить этаж');
    }
});

export const deleteSalesFloor = createAsyncThunk<number, number, { rejectValue: string }>(
    'salesFloors/delete',
    async (id, { rejectWithValue }) => {
        try {
            await apiRequest(`/sales/floors/delete/${id}`, 'DELETE');
            return id;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : 'Не удалось удалить этаж');
        }
    },
);

const salesFloorsSlice = createSlice({
    name: 'salesFloors',
    initialState,
    reducers: {
        clearSalesFloorsError: (state) => {
            state.error = null;
        },
        resetSalesFloorsState: (state) => {
            state.error = null;
            state.lastCreated = null;
            state.lastUpdated = null;
            state.lastDeletedId = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSalesFloor.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSalesFloor.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchSalesFloor.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Ошибка загрузки этажей';
            })
            .addCase(createSalesFloor.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createSalesFloor.fulfilled, (state, action) => {
                state.loading = false;
                state.lastCreated = action.payload;
            })
            .addCase(createSalesFloor.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Ошибка создания этажа';
            })

            .addCase(updateSalesFloor.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateSalesFloor.fulfilled, (state, action) => {
                state.loading = false;
                state.lastUpdated = action.payload;
            })
            .addCase(updateSalesFloor.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Ошибка обновления этажа';
            })

            .addCase(deleteSalesFloor.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteSalesFloor.fulfilled, (state, action) => {
                state.loading = false;
                state.lastDeletedId = action.payload;
            })
            .addCase(deleteSalesFloor.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Ошибка удаления этажа';
            });
    },
});

export const { clearSalesFloorsError, resetSalesFloorsState } = salesFloorsSlice.actions;
export default salesFloorsSlice.reducer;
