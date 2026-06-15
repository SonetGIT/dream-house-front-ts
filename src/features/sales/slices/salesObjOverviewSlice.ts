import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiRequest } from '@/utils/apiRequest';
import type { Pagination } from '@/features/users/userSlice';
export interface SalesOverviewSearchPayload {
    page?: number;
    size?: number;

    include_units?: boolean;

    sort_by?: string;
    sort_desc?: boolean;

    project_ids?: number[];

    floor_exact?: string;
    floor_from?: string;
    floor_to?: string;

    status_code?: string[];
    lot_types?: string[];

    rooms?: number;
    rooms_from?: string;
    rooms_to?: string;

    area_from?: string;
    area_to?: string;

    price_from?: string;
    price_to?: string;

    price_m2_from?: string;
    price_m2_to?: string;

    deal_manager_user_id?: number;

    client_search?: string;
    client_pin?: string;
    client_passport?: string;
}
export interface SalesOverviewProject {
    id: number;
    name: string;
    address: string | null;

    status: number;

    created_at: string;

    blocks_count: number;

    total_units: number;
    free_units: number;
    reserved_units: number;
    sold_units: number;
    offmarket_units: number;

    apartments: number;
    commercial_units: number;
    parking_units: number;
    storage_units: number;

    total_area: string;
    total_price: string;

    free_price: string;
    reserved_price: string;
    sold_price: string;

    leads_count: number;
    clients_count: number;
}

export interface SalesOverviewFloor {
    id: number;
    block_id: number;

    name: string | null;
    floor_number: number;

    created_at: string;
}
export interface SalesOverviewBlock {
    id: number;

    project_id: number;
    name: string;

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

    total_area: string;

    total_price: string;
    free_price: string;
    reserved_price: string;
    sold_price: string;

    floors: SalesOverviewFloor[];
}

export interface SalesOverviewSummary {
    total_projects: number;

    blocks_count: number;

    total_units: number;
    free_units: number;
    reserved_units: number;
    sold_units: number;
    offmarket_units: number;

    apartments: number;
    commercial_units: number;
    parking_units: number;
    storage_units: number;

    total_area: string;

    total_price: string;
    free_price: string;
    reserved_price: string;
    sold_price: string;

    leads_count: number;
    clients_count: number;
}
export interface SalesOverviewUnit {
    id: number;

    project_id: number;
    block_id: number;
    floor_id: number;

    unit_number: string;
    lot_type: string;

    plan_code: string | null;
    external_code: string | null;

    rooms: number | null;

    area_total: number | null;

    price_total: number | null;
    price_per_m2: number | null;

    currency: number | null;

    status_id: number | null;

    cadastral_number: string | null;

    is_active_for_sale: boolean;

    description: string | null;
    comment: string | null;

    finish_type: number | null;

    deal_manager_user_id: number | null;

    created_by: number | null;
    updated_by: number | null;

    created_at: string;
    updated_at: string;

    deleted: boolean;

    project_name: string;
    block_name: string;

    floor_number: number;
    floor_name: string | null;

    status_name: string;
    status_code: string;
    status_color: string;

    currency_name: string;
    currency_code: string;
}
interface SalesOverviewResponse {
    projects: SalesOverviewProject[];
    blocks: SalesOverviewBlock[];
    summary: SalesOverviewSummary;
    units: SalesOverviewUnit[];
}
interface SalesOverviewState {
    projects: SalesOverviewProject[];
    blocks: SalesOverviewBlock[];

    summary: SalesOverviewSummary | null;

    units: SalesOverviewUnit[];

    pagination: Pagination | null;
    unitsPagination: Pagination | null;

    loading: boolean;
    error: string | null;
}
const initialState: SalesOverviewState = {
    projects: [],
    blocks: [],

    summary: null,

    units: [],

    pagination: null,
    unitsPagination: null,

    loading: false,
    error: null,
};
export const fetchSalesOverview = createAsyncThunk<
    {
        data: SalesOverviewResponse;
        pagination: Pagination | null;
        unitsPagination: Pagination | null;
    },
    SalesOverviewSearchPayload | undefined,
    { rejectValue: string }
>('salesOverview/fetch', async (payload = {}, { rejectWithValue }) => {
    try {
        const res = await apiRequest<SalesOverviewResponse>(
            '/sales/objects/overview',
            'POST',
            payload,
        );

        return {
            data: res.data,
            pagination: res.pagination ?? null,
            unitsPagination: res.units_pagination ?? null,
        };
    } catch (err) {
        return rejectWithValue(err instanceof Error ? err.message : 'Не удалось загрузить данные');
    }
});
const salesOverviewSlice = createSlice({
    name: 'salesOverview',
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

                state.projects = action.payload.data.projects;
                state.blocks = action.payload.data.blocks;

                state.summary = action.payload.data.summary;

                state.units = action.payload.data.units ?? [];

                state.pagination = action.payload.pagination;
                state.unitsPagination = action.payload.unitsPagination;
            })
            .addCase(fetchSalesOverview.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Ошибка загрузки данных';
            });
    },
});

export default salesOverviewSlice.reducer;
