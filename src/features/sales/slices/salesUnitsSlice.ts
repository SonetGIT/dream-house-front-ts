import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { Pagination } from '@/features/users/userSlice';
import { apiRequest } from '@/utils/apiRequest';

export interface SalesUnitFloor {
    id: number;
    floor_number: number;
    name: string | null;
}

export interface SalesUnitStatus {
    id: number;
    name: string;
    code: string;
    color: string;
}

export interface SalesUnitCurrencyInfo {
    id: number;
    name: string;
    code: string;
}

export interface SalesUnit {
    id: number;
    project_id: number;
    block_id: number;
    floor_id: number;

    unit_number: string;
    lot_type: string;
    plan_code: string | null;
    external_code: string | null;

    rooms: number | null;
    area_total: string | null;

    price_total: string | null;
    price_per_m2: string | null;
    currency: number | null;
    status_id: number | null;

    finish_type: string | null;
    cadastral_number: string | null;

    is_active_for_sale: boolean;
    description: string | null;
    comment: string | null;

    manager_user_id: number | null;
    created_by: number | null;
    updated_by: number | null;

    created_at: string;
    updated_at: string;
    deleted: boolean;

    floor: SalesUnitFloor | null;
    status: SalesUnitStatus | null;
    currency_info: SalesUnitCurrencyInfo | null;
}

export interface SalesUnitsSearchPayload {
    search?: string;
    project_id?: number | null;
    block_id?: number | null;
    floor_id?: number | null;
    status_id?: number | null;
    lot_type?: string | null;
    rooms?: number | null;
    manager_user_id?: number | null;
    is_active_for_sale?: boolean | null;
    page?: number;
    size?: number;
}

export interface SalesUnitCreatePayload {
    project_id: number;
    block_id: number;
    floor_id: number;

    unit_number: string;
    lot_type: string;

    plan_code?: string | null;
    external_code?: string | null;

    rooms?: number | null;
    area_total?: string | null;

    price_total?: string | null;
    price_per_m2?: string | null;
    currency?: number | null;
    status_id?: number | null;

    finish_type?: string | null;
    cadastral_number?: string | null;

    is_active_for_sale?: boolean;
    description?: string | null;
    comment?: string | null;
    manager_user_id?: number | null;
}

export interface SalesUnitUpdatePayload extends Partial<SalesUnitCreatePayload> {}

// Пока тип паспорта оставлен гибким, пока нет точного ответа API
export type SalesUnitPassport = Record<string, unknown>;

interface SalesUnitsState {
    items: SalesUnit[];
    pagination: Pagination | null;
    loading: boolean;
    passportLoading: boolean;
    error: string | null;
    currentUnit: SalesUnit | null;
    passport: SalesUnitPassport | null;
}

const initialState: SalesUnitsState = {
    items: [],
    pagination: null,
    loading: false,
    passportLoading: false,
    error: null,
    currentUnit: null,
    passport: null,
};

export const fetchSalesUnits = createAsyncThunk<
    { data: SalesUnit[]; pagination: Pagination | null },
    SalesUnitsSearchPayload | undefined,
    { rejectValue: string }
>('salesUnits/search', async (params = {}, { rejectWithValue }) => {
    try {
        const res = await apiRequest<SalesUnit[]>('/sales/units/search', 'POST', params);
        return {
            data: res.data ?? [],
            pagination: res.pagination ?? null,
        };
    } catch (err: unknown) {
        return rejectWithValue(err instanceof Error ? err.message : 'Не удалось загрузить лоты');
    }
});

export const createSalesUnit = createAsyncThunk<
    SalesUnit,
    SalesUnitCreatePayload,
    { rejectValue: string }
>('salesUnits/create', async (payload, { rejectWithValue }) => {
    try {
        const res = await apiRequest<SalesUnit>('/sales/units/create', 'POST', payload);
        return res.data;
    } catch (err: unknown) {
        return rejectWithValue(err instanceof Error ? err.message : 'Не удалось создать лот');
    }
});

export const updateSalesUnit = createAsyncThunk<
    SalesUnit,
    { id: number; payload: SalesUnitUpdatePayload },
    { rejectValue: string }
>('salesUnits/update', async ({ id, payload }, { rejectWithValue }) => {
    try {
        const res = await apiRequest<SalesUnit>(`/sales/units/update/${id}`, 'PUT', payload);
        return res.data;
    } catch (err: unknown) {
        return rejectWithValue(err instanceof Error ? err.message : 'Не удалось обновить лот');
    }
});

export const fetchSalesUnitPassport = createAsyncThunk<
    SalesUnitPassport,
    number,
    { rejectValue: string }
>('salesUnits/passport', async (unitId, { rejectWithValue }) => {
    try {
        const res = await apiRequest<SalesUnitPassport>(`/sales/units/${unitId}/passport`, 'GET');
        return res.data;
    } catch (err: unknown) {
        return rejectWithValue(
            err instanceof Error ? err.message : 'Не удалось загрузить паспорт лота',
        );
    }
});

const salesUnitsSlice = createSlice({
    name: 'salesUnits',
    initialState,
    reducers: {
        clearSalesUnitsError: (state) => {
            state.error = null;
        },
        clearSalesUnitPassport: (state) => {
            state.passport = null;
        },
        setCurrentSalesUnit: (state, action: { payload: SalesUnit | null }) => {
            state.currentUnit = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSalesUnits.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSalesUnits.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchSalesUnits.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Ошибка загрузки лотов';
            })

            .addCase(createSalesUnit.fulfilled, (state, action) => {
                state.items.unshift(action.payload);
            })
            .addCase(createSalesUnit.rejected, (state, action) => {
                state.error = action.payload ?? 'Ошибка создания лота';
            })

            .addCase(updateSalesUnit.fulfilled, (state, action) => {
                const index = state.items.findIndex((item) => item.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
                if (state.currentUnit?.id === action.payload.id) {
                    state.currentUnit = action.payload;
                }
            })
            .addCase(updateSalesUnit.rejected, (state, action) => {
                state.error = action.payload ?? 'Ошибка обновления лота';
            })

            .addCase(fetchSalesUnitPassport.pending, (state) => {
                state.passportLoading = true;
                state.error = null;
            })
            .addCase(fetchSalesUnitPassport.fulfilled, (state, action) => {
                state.passportLoading = false;
                state.passport = action.payload;
            })
            .addCase(fetchSalesUnitPassport.rejected, (state, action) => {
                state.passportLoading = false;
                state.error = action.payload ?? 'Ошибка загрузки паспорта лота';
            });
    },
});

export const { clearSalesUnitsError, clearSalesUnitPassport, setCurrentSalesUnit } =
    salesUnitsSlice.actions;

export default salesUnitsSlice.reducer;
