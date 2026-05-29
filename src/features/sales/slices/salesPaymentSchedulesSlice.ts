import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { Pagination } from '@/features/users/userSlice';
import { apiRequest } from '@/utils/apiRequest';

export interface SalesPaymentScheduleRow {
    id: number;
    deal_id?: number | null;
    unit_id?: number | null;
    client_id?: number | null;
    title?: string | null;
    amount?: string | number | null;
    paid_amount?: string | number | null;
    balance_amount?: string | number | null;
    currency?: number | null;
    planned_date?: string | null;
    paid_date?: string | null;
    status_id?: number | null;
    status?: {
        id: number;
        name: string;
        code?: string;
        color?: string;
    } | null;
    [key: string]: unknown;
}

export interface SalesPaymentSchedulesSearchPayload {
    search?: string;
    project_id?: number | null;
    block_id?: number | null;
    unit_id?: number | null;
    deal_id?: number | null;
    client_id?: number | null;
    status_id?: number | null;
    date_from?: string | null;
    date_to?: string | null;
    page?: number;
    size?: number;
}

export interface SalesPaymentSchedulesGeneratePayload {
    deal_id: number;
    start_date: string;
    payments_count: number;
    interval_months: number;
    payment_day?: number | null;
    first_payment_amount?: string | number | null;
    total_amount?: string | number | null;
    comment?: string | null;
}

interface SalesPaymentSchedulesState {
    items: SalesPaymentScheduleRow[];
    pagination: Pagination | null;
    loading: boolean;
    generating: boolean;
    error: string | null;
    lastGenerated: unknown | null;
}

const initialState: SalesPaymentSchedulesState = {
    items: [],
    pagination: null,
    loading: false,
    generating: false,
    error: null,
    lastGenerated: null,
};

export const fetchSalesPaymentSchedules = createAsyncThunk<
    { data: SalesPaymentScheduleRow[]; pagination: Pagination | null },
    SalesPaymentSchedulesSearchPayload | undefined,
    { rejectValue: string }
>('salesPaymentSchedules/search', async (params = {}, { rejectWithValue }) => {
    try {
        const res = await apiRequest<SalesPaymentScheduleRow[]>(
            '/sales/payment-schedules/search',
            'POST',
            params,
        );

        return {
            data: res.data ?? [],
            pagination: res.pagination ?? null,
        };
    } catch (err: unknown) {
        return rejectWithValue(
            err instanceof Error ? err.message : 'Не удалось загрузить графики платежей',
        );
    }
});

export const generateSalesPaymentSchedule = createAsyncThunk<
    unknown,
    SalesPaymentSchedulesGeneratePayload,
    { rejectValue: string }
>('salesPaymentSchedules/generate', async (payload, { rejectWithValue }) => {
    try {
        const res = await apiRequest<unknown>('/sales/payment-schedules/generate', 'POST', payload);
        return res.data;
    } catch (err: unknown) {
        return rejectWithValue(
            err instanceof Error ? err.message : 'Не удалось сформировать график платежей',
        );
    }
});

const salesPaymentSchedulesSlice = createSlice({
    name: 'salesPaymentSchedules',
    initialState,
    reducers: {
        clearSalesPaymentSchedulesError: (state) => {
            state.error = null;
        },
        clearLastGeneratedSalesPaymentSchedule: (state) => {
            state.lastGenerated = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSalesPaymentSchedules.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSalesPaymentSchedules.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchSalesPaymentSchedules.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Ошибка загрузки графиков платежей';
            })

            .addCase(generateSalesPaymentSchedule.pending, (state) => {
                state.generating = true;
                state.error = null;
            })
            .addCase(generateSalesPaymentSchedule.fulfilled, (state, action) => {
                state.generating = false;
                state.lastGenerated = action.payload;
            })
            .addCase(generateSalesPaymentSchedule.rejected, (state, action) => {
                state.generating = false;
                state.error = action.payload ?? 'Ошибка генерации графика платежей';
            });
    },
});

export const { clearSalesPaymentSchedulesError, clearLastGeneratedSalesPaymentSchedule } =
    salesPaymentSchedulesSlice.actions;

export default salesPaymentSchedulesSlice.reducer;
