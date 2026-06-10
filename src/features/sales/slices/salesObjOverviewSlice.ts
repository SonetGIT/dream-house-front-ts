import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiRequest, type ApiResponse } from '@/utils/apiRequest';
import type { Pagination } from '@/features/users/userSlice';

export interface SalesOverviewProject {
    id: number;
    name: string;
    address: string | null;
    status: number;
    blocks_count: number;
    created_at: string;

    total_units: number;
    free_units: number;
    reserved_units: number;
    sold_units: number;
    offmarket_units: number;

    apartments: number;
    commercial_units: number;
    parking_units: number;
    storage_units: number;

    total_area: number;
    total_price: number;
    free_price: number;
    reserved_price: number;
    sold_price: number;

    leads_count: number;
    clients_count: number;
}

export interface SalesOverviewBlock {
    id: number;
    project_id: number;
    name: string;
    blocks_count: number;
    created_at: string;

    total_units: number;
    free_units: number;
    reserved_units: number;
    sold_units: number;
    offmarket_units: number;

    apartments: number;
    commercial_units: number;
    parking_units: number;
    storage_units: number;

    total_area: number;
    total_price: number;
    free_price: number;
    reserved_price: number;
    sold_price: number;
}

export interface SalesOverviewUnit {
    id: number;

    project_id: number;
    block_id: number;
    floor_id: number;

    unit_number: string;
    lot_type: string;

    plan_code: string;
    external_code: string;
    cadastral_number: string | null;

    rooms: number;

    area_total: number;

    price_total: number;
    price_per_m2: number | null;

    currency: number;
    currency_code: string;
    currency_name: string;

    status_id: number;
    status_name: string;
    status_code: string;
    status_color: string;

    finish_type: string | null;

    is_active_for_sale: boolean;

    description: string | null;
    comment: string | null;

    manager_user_id: number | null;

    project_name: string;
    block_name: string;

    floor_number: number;
    floor_name: string | null;

    created_by: number;
    updated_by: number;

    created_at: string;
    updated_at: string;

    deleted: boolean;
}

export interface SalesOverviewSummary {
    total_projects: number;
    total_units: number;

    free_units: number;
    reserved_units: number;
    sold_units: number;
    offmarket_units?: number;

    apartments?: number;
    commercial_units?: number;
    parking_units?: number;
    storage_units?: number;

    total_area?: number;
    total_price?: number;
    free_price?: number;
    reserved_price?: number;
    sold_price?: number;

    leads_count?: number;
    clients_count?: number;
}

export interface SalesOverviewFilters {
    page?: number;
    size?: number;

    unit_page?: number;
    unit_size?: number;

    project_id?: number;
    project_ids?: number[];

    floor_number?: number;
    floor_numbers?: number[];

    floor_from?: number;
    floor_to?: number;

    status_id?: number;
    status_ids?: number[];

    status_code?: string;
    status_codes?: string[];

    lot_type?: string;
    lot_types?: string[];

    rooms?: number;
    rooms_from?: number;
    rooms_to?: number;

    area_from?: number;
    area_to?: number;

    price_from?: number;
    price_to?: number;

    price_per_m2_from?: number;
    price_per_m2_to?: number;

    manager_user_id?: number;

    client_id?: number;
    client_search?: string;
    client_phone?: string;
    client_pin?: string;
    client_passport?: string;

    include_units?: boolean;
    unit_sort?: string;
}

interface SalesOverviewData {
    projects: SalesOverviewProject[];
    blocks: SalesOverviewBlock[];
    units: SalesOverviewUnit[];
    summary: SalesOverviewSummary;
}

interface SalesOverviewState {
    projects: SalesOverviewProject[];
    blocks: SalesOverviewBlock[];
    units: SalesOverviewUnit[];

    summary: SalesOverviewSummary | null;

    pagination: Pagination | null;
    unitsPagination: Pagination | null;

    loading: boolean;
    error: string | null;
}

const initialState: SalesOverviewState = {
    projects: [],
    blocks: [],
    units: [],

    summary: null,

    pagination: null,
    unitsPagination: null,

    loading: false,
    error: null,
};

export const fetchSalesOverview = createAsyncThunk<
    ApiResponse<SalesOverviewData>,
    SalesOverviewFilters | undefined,
    { rejectValue: string }
>('salesOverview/fetch', async (filters, { rejectWithValue }) => {
    try {
        return await apiRequest<SalesOverviewData>(
            '/sales/objects/overview',
            'POST',
            filters ?? {},
        );
    } catch (err: unknown) {
        return rejectWithValue(
            err instanceof Error ? err.message : 'Не удалось загрузить сводку объектов',
        );
    }
});

const salesObjOverviewSlice = createSlice({
    name: 'salesObjOverview',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchSalesOverview.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSalesOverview.fulfilled, (state, action) => {
                state.loading = false;

                state.projects = action.payload.data.projects ?? [];
                state.blocks = action.payload.data.blocks ?? [];
                state.units = action.payload.data.units ?? [];
                state.summary = action.payload.data.summary ?? null;

                state.pagination = action.payload.pagination ?? null;
                state.unitsPagination = action.payload.units_pagination ?? null;
            })
            .addCase(fetchSalesOverview.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Ошибка загрузки сводки объектов';
            });
    },
});

export default salesObjOverviewSlice.reducer;
