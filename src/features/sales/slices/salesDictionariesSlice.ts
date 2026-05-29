import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiRequest } from '@/utils/apiRequest';

export interface SalesUnitStatus {
    id: number;
    name: string;
    code: string;
    color: string;
    sort_order: number | null;
    created_at: string;
    updated_at: string;
    deleted: boolean;
}

export interface SalesLeadStatus {
    id: number;
    name: string;
    code?: string | null;
    color?: string | null;
    sort_order?: number | null;
    created_at?: string;
    updated_at?: string;
    deleted?: boolean;
}

export interface SalesLeadSource {
    id: number;
    name: string;
    code?: string | null;
    color?: string | null;
    sort_order?: number | null;
    created_at?: string;
    updated_at?: string;
    deleted?: boolean;
}

export interface SalesPaymentScheduleStatus {
    id: number;
    name: string;
    code: string;
    color?: string | null;
    sort_order?: number | null;
    created_at?: string;
    updated_at?: string;
    deleted?: boolean;
}

interface SalesDictionariesState {
    unitStatuses: SalesUnitStatus[];
    leadStatuses: SalesLeadStatus[];
    leadSources: SalesLeadSource[];
    paymentScheduleStatuses: SalesPaymentScheduleStatus[];
    loading: {
        unitStatuses: boolean;
        leadStatuses: boolean;
        leadSources: boolean;
        paymentScheduleStatuses: boolean;
    };
    error: string | null;
}

const initialState: SalesDictionariesState = {
    unitStatuses: [],
    leadStatuses: [],
    leadSources: [],
    paymentScheduleStatuses: [],
    loading: {
        unitStatuses: false,
        leadStatuses: false,
        leadSources: false,
        paymentScheduleStatuses: false,
    },
    error: null,
};

export const fetchSalesUnitStatuses = createAsyncThunk<
    SalesUnitStatus[],
    void,
    { rejectValue: string }
>('salesDictionaries/fetchUnitStatuses', async (_, { rejectWithValue }) => {
    try {
        const res = await apiRequest<SalesUnitStatus[]>('/sales/unit-statuses', 'GET');
        return res.data ?? [];
    } catch (err: unknown) {
        return rejectWithValue(
            err instanceof Error ? err.message : 'Не удалось загрузить статусы лотов',
        );
    }
});

export const fetchSalesLeadStatuses = createAsyncThunk<
    SalesLeadStatus[],
    void,
    { rejectValue: string }
>('salesDictionaries/fetchLeadStatuses', async (_, { rejectWithValue }) => {
    try {
        const res = await apiRequest<SalesLeadStatus[]>('/sales/lead-statuses', 'GET');
        return res.data ?? [];
    } catch (err: unknown) {
        return rejectWithValue(
            err instanceof Error ? err.message : 'Не удалось загрузить статусы лидов',
        );
    }
});

export const fetchSalesLeadSources = createAsyncThunk<
    SalesLeadSource[],
    void,
    { rejectValue: string }
>('salesDictionaries/fetchLeadSources', async (_, { rejectWithValue }) => {
    try {
        const res = await apiRequest<SalesLeadSource[]>('/sales/lead-sources', 'GET');
        return res.data ?? [];
    } catch (err: unknown) {
        return rejectWithValue(
            err instanceof Error ? err.message : 'Не удалось загрузить источники лидов',
        );
    }
});

export const fetchSalesPaymentScheduleStatuses = createAsyncThunk<
    SalesPaymentScheduleStatus[],
    void,
    { rejectValue: string }
>('salesDictionaries/fetchPaymentScheduleStatuses', async (_, { rejectWithValue }) => {
    try {
        const res = await apiRequest<SalesPaymentScheduleStatus[]>(
            '/sales/payment-schedule-statuses',
            'GET',
        );
        return res.data ?? [];
    } catch (err: unknown) {
        return rejectWithValue(
            err instanceof Error ? err.message : 'Не удалось загрузить статусы графика платежей',
        );
    }
});

const salesDictionariesSlice = createSlice({
    name: 'salesDictionaries',
    initialState,
    reducers: {
        clearSalesDictionariesError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSalesUnitStatuses.pending, (state) => {
                state.loading.unitStatuses = true;
                state.error = null;
            })
            .addCase(fetchSalesUnitStatuses.fulfilled, (state, action) => {
                state.loading.unitStatuses = false;
                state.unitStatuses = action.payload;
            })
            .addCase(fetchSalesUnitStatuses.rejected, (state, action) => {
                state.loading.unitStatuses = false;
                state.error = action.payload ?? 'Ошибка загрузки статусов лотов';
            })

            .addCase(fetchSalesLeadStatuses.pending, (state) => {
                state.loading.leadStatuses = true;
                state.error = null;
            })
            .addCase(fetchSalesLeadStatuses.fulfilled, (state, action) => {
                state.loading.leadStatuses = false;
                state.leadStatuses = action.payload;
            })
            .addCase(fetchSalesLeadStatuses.rejected, (state, action) => {
                state.loading.leadStatuses = false;
                state.error = action.payload ?? 'Ошибка загрузки статусов лидов';
            })

            .addCase(fetchSalesLeadSources.pending, (state) => {
                state.loading.leadSources = true;
                state.error = null;
            })
            .addCase(fetchSalesLeadSources.fulfilled, (state, action) => {
                state.loading.leadSources = false;
                state.leadSources = action.payload;
            })
            .addCase(fetchSalesLeadSources.rejected, (state, action) => {
                state.loading.leadSources = false;
                state.error = action.payload ?? 'Ошибка загрузки источников лидов';
            })

            .addCase(fetchSalesPaymentScheduleStatuses.pending, (state) => {
                state.loading.paymentScheduleStatuses = true;
                state.error = null;
            })
            .addCase(fetchSalesPaymentScheduleStatuses.fulfilled, (state, action) => {
                state.loading.paymentScheduleStatuses = false;
                state.paymentScheduleStatuses = action.payload;
            })
            .addCase(fetchSalesPaymentScheduleStatuses.rejected, (state, action) => {
                state.loading.paymentScheduleStatuses = false;
                state.error = action.payload ?? 'Ошибка загрузки статусов графика';
            });
    },
});

export const { clearSalesDictionariesError } = salesDictionariesSlice.actions;
export default salesDictionariesSlice.reducer;
