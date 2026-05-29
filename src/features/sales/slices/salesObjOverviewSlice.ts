import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiRequest } from '@/utils/apiRequest';

export interface SalesOverviewProject {
    id: number;
    name: string;
    address: string | null;
    status: number;
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

    leads_count: number;
    clients_count: number;
}

interface SalesOverviewResponse {
    projects: SalesOverviewProject[];
}

interface SalesOverviewState {
    projects: SalesOverviewProject[];
    loading: boolean;
    error: string | null;
}

const initialState: SalesOverviewState = {
    projects: [],
    loading: false,
    error: null,
};

export const fetchSalesOverview = createAsyncThunk<
    SalesOverviewProject[],
    void,
    { rejectValue: string }
>('salesOverview/fetch', async (_, { rejectWithValue }) => {
    try {
        const res = await apiRequest<SalesOverviewResponse>('/sales/objects/overview', 'GET');
        return res.data.projects ?? [];
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
                state.projects = action.payload;
            })
            .addCase(fetchSalesOverview.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Ошибка загрузки сводки объектов';
            });
    },
});

export default salesObjOverviewSlice.reducer;
