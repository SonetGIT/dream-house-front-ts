import { apiRequest } from '@/utils/apiRequest';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export interface CurrencyInfo {
    id: number;
    name: string;
    code: string;
    created_at?: string;
    updated_at?: string;
    deleted?: boolean;
}

export interface StatusInfo {
    id: number;
    name: string;
    code?: string;
    color?: string;
    sort_order?: number;
    is_final?: boolean;
    created_at?: string;
    updated_at?: string;
    deleted?: boolean;
}

export interface UserInfo {
    id: number;
    first_name: string;
    last_name: string;
    middle_name: string | null;
    username: string;
    full_name?: string;
}

export interface FloorInfo {
    id: number;
    floor_number: number;
    name: string | null;
}

export interface DealTypeInfo {
    id: number;
    name: string;
    code: string;
    sort_order?: number;
    created_at?: string;
    updated_at?: string;
    deleted?: boolean;
}

export interface PaymentTypeInfo {
    id: number;
    name: string;
    code?: string;
    sort_order?: number;
    created_at?: string;
    updated_at?: string;
    deleted?: boolean;
}

export interface ArticleInfo {
    id: number;
    name: string;
    code: string;
    payment_type: number;
    sort_order?: number;
    description: string | null;
    created_at?: string;
    updated_at?: string;
    deleted?: boolean;
}

export interface PaymentMethodRef {
    id: number;
    name: string;
    code?: string;
}

export interface EntityTypeRef {
    id: number;
    name: string;
    code: string;
    sort_order?: number;
    created_at?: string;
    updated_at?: string;
    deleted?: boolean;
}

export interface SalesUnitPassportData {
    unit: SalesUnitPassport;
}

export interface SalesUnitPassport {
    id: number;
    project_id: number;
    block_id: number;
    floor_id: number;
    unit_number: string;
    lot_type: string;
    plan_code?: string | null;
    external_code?: string | null;
    rooms: number | null;
    area_total: number | null;
    price_total: number | null;
    price_per_m2?: number | null;
    currency: number | string | null;
    status_id: number | null;
    finish_type?: number | null;
    cadastral_number?: string | null;
    comment?: string | null;
    description?: string | null;
    created_by?: number;
    updated_by?: number;
    created_at?: string;
    updated_at?: string;
    deleted?: boolean;
    floor?: FloorInfo | null;
    status?: StatusInfo | null;
    currency_info?: CurrencyInfo | null;
    reservationCount?: number | null;
    dealCount?: number | null;
    totalDealAmount?: number | null;
    totalPaid?: number | null;
    remaining?: number | null;
    clients?: SalesClient[];
}

export interface SalesClient {
    id: number;
    full_name: string;
    phone?: string | null;
    email?: string | null;
    pin?: string | null;
    passport_number?: string | null;
    manager_user_id?: number | null;
    reservations?: SalesReservation[];
    deals?: SalesDeal[];
    payment_schedules?: SalesPaymentSchedule[];
    deal_created_at?: string | null;
    created_at?: string | null;
    latest_at?: string | null;
}

export interface SalesReservation {
    id: number;
    project_id: number;
    block_id: number;
    client_id: number;
    unit_id: number;
    status: number | null;
    manager_user_id: number;
    start_at: string | null;
    expires_at: string | null;
    confirmed_at?: string | null;
    canceled_at?: string | null;
    closed_at?: string | null;
    reservation_amount?: number | null;
    currency?: number | string | null;
    comment?: string | null;
    cancel_reason?: string | null;
    notify_3_days?: boolean;
    notify_2_days?: boolean;
    notify_1_day?: boolean;
    created_by?: number;
    updated_by?: number;
    created_at?: string;
    updated_at?: string;
    deleted?: boolean;
    lead?: unknown | null;
    payments?: SalesPayment[];
    currency_info?: CurrencyInfo | null;
    status_ref?: StatusInfo | null;
    manager_user?: UserInfo | null;
    created_by_user?: UserInfo | null;
    updated_by_user?: UserInfo | null;
}

export interface SalesDeal {
    id: number;
    project_id: number;
    block_id: number;
    client_id: number;
    unit_id: number;
    reservation_id?: number | null;
    deal_type_id?: number;
    status: number | null;
    manager_user_id?: number;
    deal_number?: string | null;
    contract_number?: string | null;
    contract_date?: string | null;
    payment_type?: number | null;
    total_amount?: number | null;
    currency?: number | string | null;
    currency_rate?: number | null;
    note?: string | null;
    canceled_reason?: string | null;
    signed_at?: string | null;
    closed_at?: string | null;
    created_by?: number;
    updated_by?: number;
    created_at?: string;
    updated_at?: string;
    deleted?: boolean;
    payments?: SalesPayment[];
    payment_schedules?: SalesPaymentSchedule[];
    currency_info?: CurrencyInfo | null;
    deal_type?: DealTypeInfo | null;
    payment_type_ref?: PaymentTypeInfo | null;
    status_ref?: StatusInfo | null;
    manager_user?: UserInfo | null;
    created_by_user?: UserInfo | null;
    updated_by_user?: UserInfo | null;
}

export interface SalesPayment {
    id: number;
    project_id: number;
    block_id: number;
    payment_type: number;
    entity_type: number;
    entity_id: number;
    article_id: number;
    status: number;
    counterparty_type: number;
    counterparty_id: number;
    counterparty_name: string;
    counterparty_inn: string | null;
    title: string;
    description: string | null;
    amount: number;
    currency: number | string;
    currency_rate: number | null;
    planned_date: string | null;
    paid_date: string | null;
    payment_method: number | null;
    account_type: number | null;
    document_number: string | null;
    external_number: string | null;
    comment: string | null;
    is_manual: boolean;
    created_by: number;
    updated_by: number;
    created_at: string;
    updated_at: string;
    posted_at: string | null;
    deleted: boolean;
    payment_type_ref?: PaymentTypeInfo | null;
    status_ref?: StatusInfo | null;
    article?: ArticleInfo | null;
    currency_ref?: CurrencyInfo | null;
    payment_method_ref?: PaymentMethodRef | null;
    entity_type_ref?: EntityTypeRef | null;
    entity_type_code?: string | null;
}

export interface SalesPaymentScheduleLink {
    id: number;
    schedule_id: number;
    payment_id: number;
    amount: string;
    created_at: string;
    deleted: boolean;
    payment?: SalesPayment;
}

export interface SalesPaymentSchedule {
    id: number;
    project_id?: number;
    block_id?: number;
    unit_id?: number;
    client_id?: number;
    deal_id?: number;
    payment_no?: number;
    planned_date?: string | null;
    planned_amount?: number;
    paid_amount?: number;
    remaining_amount?: number;
    status?: number;
    paid_at?: string | null;
    overdue_days?: number;
    comment?: string | null;
    created_by?: number;
    updated_by?: number;
    created_at?: string;
    updated_at?: string;
    deleted?: boolean;
    status_ref?: StatusInfo | null;
    links?: SalesPaymentScheduleLink[];
}

export const fetchSalesUnitPassport = createAsyncThunk<
    SalesUnitPassportData,
    number,
    { rejectValue: string }
>('salesUnitPassport/fetchSalesUnitPassport', async (unitId, { rejectWithValue }) => {
    try {
        const res = await apiRequest<SalesUnitPassportData>(
            `/sales/units/${unitId}/passport`,
            'GET',
        );

        return res.data;
    } catch (error) {
        return rejectWithValue(
            error instanceof Error ? error.message : 'Ошибка загрузки паспорта квартиры',
        );
    }
});

interface SalesUnitPassportState {
    data: SalesUnitPassportData | null;
    unit: SalesUnitPassport | null;
    clients: SalesClient[];
    reservations: SalesReservation[];
    deals: SalesDeal[];
    payments: SalesPayment[];
    paymentSchedules: SalesPaymentSchedule[];
    loading: boolean;
    error: string | null;
}

const initialState: SalesUnitPassportState = {
    data: null,
    unit: null,
    clients: [],
    reservations: [],
    deals: [],
    payments: [],
    paymentSchedules: [],
    loading: false,
    error: null,
};

const uniqueById = <T extends { id: number }>(items: T[]) => {
    const map = new Map<number, T>();
    items.forEach((item) => {
        map.set(Number(item.id), item);
    });
    return Array.from(map.values());
};

const flattenPassport = (passport: SalesUnitPassportData | null) => {
    const unit = passport?.unit ?? null;
    const clients = Array.isArray(unit?.clients) ? unit.clients : [];

    const reservations = uniqueById(
        clients.flatMap((client) => client.reservations || []).filter(Boolean),
    );

    const deals = uniqueById(clients.flatMap((client) => client.deals || []).filter(Boolean));

    const payments = uniqueById(
        clients.flatMap((client) => [
            ...(client.reservations || []).flatMap((reservation) => reservation.payments || []),
            ...(client.deals || []).flatMap((deal) => deal.payments || []),
        ]),
    );

    const paymentSchedules = uniqueById(
        clients.flatMap((client) => [
            ...(client.payment_schedules || []),
            ...(client.deals || []).flatMap((deal) => deal.payment_schedules || []),
        ]),
    );

    return {
        unit,
        clients,
        reservations,
        deals,
        payments,
        paymentSchedules,
    };
};

const salesUnitPassportSlice = createSlice({
    name: 'salesUnitPassport',
    initialState,
    reducers: {
        clearSalesUnitPassport: () => initialState,
        clearSalesUnitPassportError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSalesUnitPassport.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSalesUnitPassport.fulfilled, (state, action) => {
                const passport = action.payload;
                const normalized = flattenPassport(passport);

                state.data = passport;
                state.unit = normalized.unit;
                state.clients = normalized.clients;
                state.reservations = normalized.reservations;
                state.deals = normalized.deals;
                state.payments = normalized.payments;
                state.paymentSchedules = normalized.paymentSchedules;
                state.loading = false;
            })
            .addCase(fetchSalesUnitPassport.rejected, (state, action) => {
                state.loading = false;
                state.error = String(action.payload || 'Ошибка загрузки паспорта квартиры');
            });
    },
});

export const { clearSalesUnitPassport, clearSalesUnitPassportError } =
    salesUnitPassportSlice.actions;

export const selectSalesUnitPassportData = (state: { salesUnitPassport: SalesUnitPassportState }) =>
    state.salesUnitPassport.data;

export const selectSalesUnitPassportUnit = (state: { salesUnitPassport: SalesUnitPassportState }) =>
    state.salesUnitPassport.unit;

export const selectSalesUnitPassportClients = (state: {
    salesUnitPassport: SalesUnitPassportState;
}) => state.salesUnitPassport.clients;

export const selectSalesUnitPassportReservations = (state: {
    salesUnitPassport: SalesUnitPassportState;
}) => state.salesUnitPassport.reservations;

export const selectSalesUnitPassportDeals = (state: {
    salesUnitPassport: SalesUnitPassportState;
}) => state.salesUnitPassport.deals;

export const selectSalesUnitPassportPayments = (state: {
    salesUnitPassport: SalesUnitPassportState;
}) => state.salesUnitPassport.payments;

export const selectSalesUnitPassportPaymentSchedules = (state: {
    salesUnitPassport: SalesUnitPassportState;
}) => state.salesUnitPassport.paymentSchedules;

export const selectSalesUnitPassportLoading = (state: {
    salesUnitPassport: SalesUnitPassportState;
}) => state.salesUnitPassport.loading;

export const selectSalesUnitPassportError = (state: {
    salesUnitPassport: SalesUnitPassportState;
}) => state.salesUnitPassport.error;

export default salesUnitPassportSlice.reducer;
