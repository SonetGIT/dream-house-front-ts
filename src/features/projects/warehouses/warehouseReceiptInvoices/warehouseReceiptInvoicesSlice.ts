import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Pagination } from '@/features/users/userSlice';
import { apiRequest } from '@/utils/apiRequest';

export interface WarehouseReceiptInvoiceSearchParams {
    warehouse_id?: number;
    project_id?: number;
    block_id?: number;
    purchase_order_id?: number;
    search?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
    size?: number;
}

export interface WarehouseReceiptInvoiceMaterial {
    id: number;
    name: string;
    unit_of_measure: number | null;
}

export interface WarehouseReceiptInvoiceItem {
    id: number;
    invoice_id: number;
    purchase_order_item_id: number | null;
    material_id: number;
    material_type: number | null;
    unit_of_measure: number | null;
    quantity: number;
    price: number;
    currency: number | null;
    currency_rate: number | null;
    total_amount: number;
    supplier_id: number | null;
    comment: string | null;
    created_at: string;
    updated_at: string;
    deleted: boolean;
    material?: WarehouseReceiptInvoiceMaterial | null;
}

export interface WarehouseReceiptInvoiceWarehouse {
    id: number;
    name: string;
    project_id: number | null;
}

export interface WarehouseReceiptInvoicePurchaseOrder {
    id: number;
    project_id: number | null;
    block_id: number | null;
    status: number | null;
}

export interface WarehouseReceiptInvoiceReceivedUser {
    id: number;
    first_name: string;
    last_name: string;
    middle_name: string | null;
    username: string;
}

export interface WarehouseReceiptInvoice {
    id: number;
    warehouse_id: number;
    project_id: number | null;
    block_id: number | null;
    purchase_order_id: number | null;
    received_at: string;
    received_by: number | null;
    total_amount: string | number;
    comment: string | null;
    created_at: string;
    updated_at: string;
    deleted: boolean;
    items: WarehouseReceiptInvoiceItem[];
    warehouse?: WarehouseReceiptInvoiceWarehouse | null;
    purchase_order?: WarehouseReceiptInvoicePurchaseOrder | null;
    received_user?: WarehouseReceiptInvoiceReceivedUser | null;
}

interface WarehouseReceiptInvoicesSearchResponse {
    success: boolean;
    data: WarehouseReceiptInvoice[];
    pagination: Pagination;
}

interface WarehouseReceiptInvoicesState {
    data: WarehouseReceiptInvoice[];
    pagination: Pagination | null;
    current: WarehouseReceiptInvoice | null;
    loading: boolean;
    submitting: boolean;
    error: string | null;
}

const initialState: WarehouseReceiptInvoicesState = {
    data: [],
    pagination: null,
    current: null,
    loading: false,
    submitting: false,
    error: null,
};

export const fetchWarehouseReceiptInvoices = createAsyncThunk<
    WarehouseReceiptInvoicesSearchResponse,
    WarehouseReceiptInvoiceSearchParams,
    { rejectValue: string }
>('warehouseReceiptInvoices/fetchSearch', async (params, { rejectWithValue }) => {
    try {
        const res = await apiRequest<WarehouseReceiptInvoice[]>(
            '/warehouseReceiptInvoices/search',
            'POST',
            params,
        );

        return {
            success: res.success ?? true,
            data: res.data ?? [],
            pagination: res.pagination ?? {
                page: params.page ?? 1,
                size: params.size ?? 10,
                total: 0,
                pages: 0,
                hasNext: false,
                hasPrev: false,
            },
        };
    } catch (error) {
        return rejectWithValue(
            error instanceof Error ? error.message : 'Ошибка загрузки приходных накладных склада',
        );
    }
});

const warehouseReceiptInvoicesSlice = createSlice({
    name: 'warehouseReceiptInvoices',
    initialState,
    reducers: {
        setCurrentWarehouseReceiptInvoice: (
            state,
            action: PayloadAction<WarehouseReceiptInvoice | null>,
        ) => {
            state.current = action.payload;
        },
        clearWarehouseReceiptInvoices: (state) => {
            state.data = [];
            state.pagination = null;
            state.current = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchWarehouseReceiptInvoices.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchWarehouseReceiptInvoices.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchWarehouseReceiptInvoices.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Ошибка загрузки приходных накладных склада';
            });
    },
});

export const { setCurrentWarehouseReceiptInvoice, clearWarehouseReceiptInvoices } =
    warehouseReceiptInvoicesSlice.actions;

export default warehouseReceiptInvoicesSlice.reducer;
