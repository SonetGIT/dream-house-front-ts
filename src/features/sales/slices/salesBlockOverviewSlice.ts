import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiRequest } from '@/utils/apiRequest';
import type { SalesUnitStatus } from './salesDictionariesSlice';

export interface SalesOverviewProjectInfo {
    id: number;
    name: string;
    code: string | null;
    type: number | null;
    address: string | null;
    customer_name: string | null;
    start_date: string | null;
    end_date: string | null;
    planned_budget: number | null;
    status: number | null;
    manager_id: number | null;
    foreman_id: number | null;
    master_id: number | null;
    warehouse_manager_id: number | null;
    description: string | null;
    created_at: string;
    updated_at: string;
    deleted: boolean;
}

export interface SalesOverviewBlockInfo {
    id: number;
    name: string;
    project_id: number;
    planned_budget: number | null;
    total_area: number | null;
    sale_area: number | null;
    created_at: string;
    updated_at: string;
    deleted: boolean;
}

export interface SalesCurrencyInfo {
    id: number;
    name: string;
    code: string;
}

export interface SalesBlockUnit {
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

    currency_info: SalesCurrencyInfo | null;
}

export interface SalesBlockFloor {
    id: number;
    project_id: number;
    block_id: number;
    floor_number: number;
    name: string | null;
    sort_order: number | null;
    created_at: string;
    updated_at: string;
    deleted: boolean;
    units: SalesBlockUnit[];
    stats: Record<string, number>;
}

export interface SalesBlockOverviewData {
    project: SalesOverviewProjectInfo | null;
    block: SalesOverviewBlockInfo | null;
    statuses: SalesUnitStatus[];
    floors: SalesBlockFloor[];
}

interface SalesBlockOverviewState {
    data: SalesBlockOverviewData | null;
    loading: boolean;
    error: string | null;
}

const initialState: SalesBlockOverviewState = {
    data: null,
    loading: false,
    error: null,
};

export const fetchSalesBlockOverview = createAsyncThunk<
    SalesBlockOverviewData,
    number,
    { rejectValue: string }
>('salesBlockOverview/fetch', async (blockId, { rejectWithValue }) => {
    try {
        const res = await apiRequest<SalesBlockOverviewData>(
            `/sales/blocks/${blockId}/overview`,
            'GET',
        );
        return res.data;
    } catch (err: unknown) {
        return rejectWithValue(
            err instanceof Error ? err.message : 'Не удалось загрузить обзор блока',
        );
    }
});

const salesBlockOverviewSlice = createSlice({
    name: 'salesBlockOverview',
    initialState,
    reducers: {
        clearSalesBlockOverviewError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSalesBlockOverview.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSalesBlockOverview.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchSalesBlockOverview.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Ошибка загрузки обзора блока';
            });
    },
});

export const { clearSalesBlockOverviewError } = salesBlockOverviewSlice.actions;
export default salesBlockOverviewSlice.reducer;
