import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { Pagination } from '@/features/users/userSlice';
import { apiRequest } from '@/utils/apiRequest';

export interface SalesClientProject {
    id: number;
    name: string;
}

export interface SalesClientBlock {
    id: number;
    name: string;
    project_id: number;
}

export interface SalesClientFloor {
    id: number;
    floor_number: number;
    name: string | null;
}

export interface SalesClientUnitStatus {
    id: number;
    name: string;
    code: string;
    color: string;
}

export interface SalesClientCurrencyInfo {
    id: number;
    name: string;
    code: string;
}

export interface SalesClientUnit {
    id: number;
    project_id: number;
    block_id: number;
    floor_id: number;
    unit_number: string;
    lot_type: string;
    rooms: number | null;
    area_total: string | null;
    price_total: string | null;
    currency: number | null;
    status_id: number | null;
    floor: SalesClientFloor | null;
    status: SalesClientUnitStatus | null;
    currency_info: SalesClientCurrencyInfo | null;
}

export interface SalesClient {
    id: number;

    last_name: string;
    first_name: string;
    middle_name: string | null;
    full_name: string;

    phone: string | null;
    phone_extra: string | null;
    email: string | null;
    birth_date: string | null;

    passport_number: string | null;
    pin: string | null;
    address: string | null;

    project_id: number | null;
    block_id: number | null;
    unit_id: number | null;

    manager_user_id: number | null;
    assigned_at: string | null;
    is_locked: boolean;

    comment: string | null;

    created_by: number | null;
    updated_by: number | null;

    created_at: string;
    updated_at: string;
    deleted: boolean;

    sales_project: SalesClientProject | null;
    sales_block: SalesClientBlock | null;
    sales_floor: SalesClientFloor | null;
    sales_unit: SalesClientUnit | null;
}

export interface SalesClientSearchPayload {
    search?: string;
    project_id?: number | null;
    block_id?: number | null;
    unit_id?: number | null;
    manager_user_id?: number | null;
    page?: number;
    size?: number;
}

export interface SalesClientCreatePayload {
    last_name: string;
    first_name: string;
    middle_name?: string | null;

    phone?: string | null;
    phone_extra?: string | null;
    email?: string | null;
    birth_date?: string | null;

    passport_number?: string | null;
    pin?: string | null;
    address?: string | null;

    project_id?: number | null;
    block_id?: number | null;
    unit_id?: number | null;

    comment?: string | null;
}

export interface SalesClientUpdatePayload extends Partial<SalesClientCreatePayload> {}

interface SalesClientsState {
    items: SalesClient[];
    pagination: Pagination | null;
    loading: boolean;
    error: string | null;
    currentClient: SalesClient | null;
}

const initialState: SalesClientsState = {
    items: [],
    pagination: null,
    loading: false,
    error: null,
    currentClient: null,
};

export const fetchSalesClients = createAsyncThunk<
    { data: SalesClient[]; pagination: Pagination | null },
    SalesClientSearchPayload | undefined,
    { rejectValue: string }
>('salesClients/search', async (params = {}, { rejectWithValue }) => {
    try {
        const res = await apiRequest<SalesClient[]>('/sales/clients/search', 'POST', params);
        return {
            data: res.data ?? [],
            pagination: res.pagination ?? null,
        };
    } catch (err: unknown) {
        return rejectWithValue(
            err instanceof Error ? err.message : 'Не удалось загрузить клиентов',
        );
    }
});

export const createSalesClient = createAsyncThunk<
    SalesClient,
    SalesClientCreatePayload,
    { rejectValue: string }
>('salesClients/create', async (payload, { rejectWithValue }) => {
    try {
        const res = await apiRequest<SalesClient>('/sales/clients/create', 'POST', payload);
        return res.data;
    } catch (err: unknown) {
        return rejectWithValue(err instanceof Error ? err.message : 'Не удалось создать клиента');
    }
});

export const updateSalesClient = createAsyncThunk<
    SalesClient,
    { id: number; payload: SalesClientUpdatePayload },
    { rejectValue: string }
>('salesClients/update', async ({ id, payload }, { rejectWithValue }) => {
    try {
        const res = await apiRequest<SalesClient>(`/sales/clients/update/${id}`, 'PUT', payload);
        return res.data;
    } catch (err: unknown) {
        return rejectWithValue(err instanceof Error ? err.message : 'Не удалось обновить клиента');
    }
});

export const claimSalesClient = createAsyncThunk<SalesClient, number, { rejectValue: string }>(
    'salesClients/claim',
    async (id, { rejectWithValue }) => {
        try {
            const res = await apiRequest<SalesClient>(`/sales/clients/claim/${id}`, 'POST');
            return res.data;
        } catch (err: unknown) {
            return rejectWithValue(
                err instanceof Error ? err.message : 'Не удалось закрепить клиента',
            );
        }
    },
);

const salesClientsSlice = createSlice({
    name: 'salesClients',
    initialState,
    reducers: {
        clearSalesClientsError: (state) => {
            state.error = null;
        },
        setCurrentSalesClient: (state, action: { payload: SalesClient | null }) => {
            state.currentClient = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSalesClients.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSalesClients.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchSalesClients.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Ошибка загрузки клиентов';
            })

            .addCase(createSalesClient.fulfilled, (state, action) => {
                state.items.unshift(action.payload);
            })
            .addCase(createSalesClient.rejected, (state, action) => {
                state.error = action.payload ?? 'Ошибка создания клиента';
            })

            .addCase(updateSalesClient.fulfilled, (state, action) => {
                const index = state.items.findIndex((item) => item.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
                if (state.currentClient?.id === action.payload.id) {
                    state.currentClient = action.payload;
                }
            })
            .addCase(updateSalesClient.rejected, (state, action) => {
                state.error = action.payload ?? 'Ошибка обновления клиента';
            })

            .addCase(claimSalesClient.fulfilled, (state, action) => {
                const index = state.items.findIndex((item) => item.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
                if (state.currentClient?.id === action.payload.id) {
                    state.currentClient = action.payload;
                }
            })
            .addCase(claimSalesClient.rejected, (state, action) => {
                state.error = action.payload ?? 'Ошибка закрепления клиента';
            });
    },
});

export const { clearSalesClientsError, setCurrentSalesClient } = salesClientsSlice.actions;
export default salesClientsSlice.reducer;
