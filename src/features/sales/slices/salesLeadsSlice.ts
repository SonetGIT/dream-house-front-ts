import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { Pagination } from '@/features/users/userSlice';
import { apiRequest } from '@/utils/apiRequest';

export interface SalesLead {
    id: number;
    project_id: number | null;
    block_id: number | null;
    unit_id: number | null;
    client_id: number | null;

    source_id: number | null;
    status_id: number | null;

    full_name: string;
    phone: string | null;
    email: string | null;
    pin: string | null;

    interest_lot_type: string | null;
    interest_rooms: number | null;
    interest_budget_from: string | null;
    interest_budget_to: string | null;
    interest_area_from: string | null;
    interest_area_to: string | null;

    manager_user_id: number | null;
    assigned_at: string | null;
    is_locked: boolean;

    next_contact_at: string | null;
    last_contact_at: string | null;

    comment: string | null;
    lost_reason: string | null;

    created_by: number | null;
    updated_by: number | null;

    created_at: string;
    updated_at: string;
    deleted: boolean;
}

export interface SalesLeadSearchPayload {
    search?: string;
    project_id?: number | null;
    block_id?: number | null;
    unit_id?: number | null;
    client_id?: number | null;
    source_id?: number | null;
    status_id?: number | null;
    manager_user_id?: number | null;
    page?: number;
    size?: number;
}

export interface SalesLeadCreatePayload {
    project_id?: number | null;
    block_id?: number | null;
    unit_id?: number | null;
    client_id?: number | null;
    source_id?: number | null;
    status_id?: number | null;
    full_name: string;
    phone?: string | null;
    email?: string | null;
    pin?: string | null;
    interest_lot_type?: string | null;
    interest_rooms?: number | null;
    interest_budget_from?: string | null;
    interest_budget_to?: string | null;
    interest_area_from?: string | null;
    interest_area_to?: string | null;
    next_contact_at?: string | null;
    last_contact_at?: string | null;
    comment?: string | null;
    lost_reason?: string | null;
}

// export interface SalesLeadUpdatePayload extends Partial<SalesLeadCreatePayload> {}
export interface SalesLeadUpdatePayload extends Partial<SalesLeadCreatePayload> {
    manager_user_id?: number | null;
}

interface SalesLeadsState {
    items: SalesLead[];
    pagination: Pagination | null;
    loading: boolean;
    error: string | null;
    currentLead: SalesLead | null;
}

const initialState: SalesLeadsState = {
    items: [],
    pagination: null,
    loading: false,
    error: null,
    currentLead: null,
};

export const fetchSalesLeads = createAsyncThunk<
    { data: SalesLead[]; pagination: Pagination | null },
    SalesLeadSearchPayload | undefined,
    { rejectValue: string }
>('salesLeads/search', async (params = {}, { rejectWithValue }) => {
    try {
        const res = await apiRequest<SalesLead[]>('/sales/leads/search', 'POST', params);
        return {
            data: res.data ?? [],
            pagination: res.pagination ?? null,
        };
    } catch (err: unknown) {
        return rejectWithValue(err instanceof Error ? err.message : 'Не удалось загрузить лиды');
    }
});

export const createSalesLead = createAsyncThunk<
    SalesLead,
    SalesLeadCreatePayload,
    { rejectValue: string }
>('salesLeads/create', async (payload, { rejectWithValue }) => {
    try {
        const res = await apiRequest<SalesLead>('/sales/leads/create', 'POST', payload);
        return res.data;
    } catch (err: unknown) {
        return rejectWithValue(err instanceof Error ? err.message : 'Не удалось создать лида');
    }
});

export const updateSalesLead = createAsyncThunk<
    SalesLead,
    { id: number; payload: SalesLeadUpdatePayload },
    { rejectValue: string }
>('salesLeads/update', async ({ id, payload }, { rejectWithValue }) => {
    try {
        const res = await apiRequest<SalesLead>(`/sales/leads/update/${id}`, 'PUT', payload);
        return res.data;
    } catch (err: unknown) {
        return rejectWithValue(err instanceof Error ? err.message : 'Не удалось обновить лида');
    }
});

export const claimSalesLead = createAsyncThunk<SalesLead, number, { rejectValue: string }>(
    'salesLeads/claim',
    async (id, { rejectWithValue }) => {
        try {
            const res = await apiRequest<SalesLead>(`/sales/leads/claim/${id}`, 'POST');
            return res.data;
        } catch (err: unknown) {
            return rejectWithValue(
                err instanceof Error ? err.message : 'Не удалось закрепить лида',
            );
        }
    },
);

const salesLeadsSlice = createSlice({
    name: 'salesLeads',
    initialState,
    reducers: {
        clearSalesLeadsError: (state) => {
            state.error = null;
        },
        setCurrentSalesLead: (state, action: { payload: SalesLead | null }) => {
            state.currentLead = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSalesLeads.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSalesLeads.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchSalesLeads.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Ошибка загрузки лидов';
            })

            .addCase(createSalesLead.fulfilled, (state, action) => {
                state.items.unshift(action.payload);
            })
            .addCase(createSalesLead.rejected, (state, action) => {
                state.error = action.payload ?? 'Ошибка создания лида';
            })

            .addCase(updateSalesLead.fulfilled, (state, action) => {
                const index = state.items.findIndex((item) => item.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
                if (state.currentLead?.id === action.payload.id) {
                    state.currentLead = action.payload;
                }
            })
            .addCase(updateSalesLead.rejected, (state, action) => {
                state.error = action.payload ?? 'Ошибка обновления лида';
            })

            .addCase(claimSalesLead.fulfilled, (state, action) => {
                const index = state.items.findIndex((item) => item.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
                if (state.currentLead?.id === action.payload.id) {
                    state.currentLead = action.payload;
                }
            })
            .addCase(claimSalesLead.rejected, (state, action) => {
                state.error = action.payload ?? 'Ошибка закрепления лида';
            });
    },
});

export const { clearSalesLeadsError, setCurrentSalesLead } = salesLeadsSlice.actions;
export default salesLeadsSlice.reducer;
