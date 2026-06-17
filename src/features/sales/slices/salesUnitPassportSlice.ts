import { apiRequest } from '@/utils/apiRequest';
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';

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
    code: string;
    color: string;
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
    label?: string;
    role_id?: number;
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
    sort_order: number;
    created_at: string;
    updated_at: string;
    deleted: boolean;
}

export interface PaymentTypeInfo {
    id: number;
    name: string;
    code: string;
    sort_order: number;
    created_at: string;
    updated_at: string;
    deleted: boolean;
}

export interface ArticleInfo {
    id: number;
    name: string;
    code: string;
    payment_type: number;
    sort_order: number;
    description: string | null;
    created_at: string;
    updated_at: string;
    deleted: boolean;
}

export interface PaymentMethodRef {
    id: number;
    name: string;
    code: string;
    // ... другие поля при необходимости
}

export interface EntityTypeRef {
    id: number;
    name: string;
    code: string;
}

// PAYMENT SCHEDULE LINKS

export interface PassportPaymentScheduleLinkPayment {
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
    currency: number;
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
    payment_type_ref: PaymentTypeInfo | null;
    status_ref: StatusInfo | null;
    article: ArticleInfo | null;
    currency_ref: CurrencyInfo | null;
    payment_method_ref: PaymentMethodRef | null;
}

export interface PassportPaymentScheduleLink {
    id: number;
    schedule_id: number;
    payment_id: number;
    amount: string; // API возвращает строку "100000.00"
    created_at: string;
    deleted: boolean;
    payment: PassportPaymentScheduleLinkPayment;
}

// PAYMENT SCHEDULES

export interface PassportPaymentSchedule {
    id: number;
    project_id: number;
    block_id: number;
    unit_id: number;
    client_id: number;
    deal_id: number;
    payment_no: number;
    planned_date: string;
    planned_amount: number;
    paid_amount: number;
    remaining_amount: number;
    status: number;
    paid_at: string | null;
    overdue_days: number;
    comment: string | null;
    created_by: number;
    updated_by: number;
    created_at: string;
    updated_at: string;
    deleted: boolean;
    status_ref: StatusInfo | null;
    links: PassportPaymentScheduleLink[];
}

// PAYMENTS

export interface PassportPayment {
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
    currency: number;
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
    payment_type_ref: PaymentTypeInfo | null;
    status_ref: StatusInfo | null;
    article: ArticleInfo | null;
    currency_ref: CurrencyInfo | null;
    payment_method_ref: PaymentMethodRef | null;
    entity_type_ref: EntityTypeRef | null;
    entity_type_code: string | null;
}

// DEALS

export interface PassportDeal {
    id: number;
    project_id: number;
    block_id: number;
    unit_id: number;
    client_id: number;
    reservation_id: number | null;
    deal_type_id: number;
    status: number | null;
    manager_user_id: number;
    deal_number: string | null;
    contract_number: string;
    contract_date: string;
    payment_type: number | null;
    total_amount: number;
    currency: string; // API возвращает строку "1"
    note: string;
    canceled_reason: string | null;
    signed_at: string | null;
    closed_at: string | null;
    created_by: number;
    updated_by: number;
    created_at: string;
    updated_at: string;
    deleted: boolean;
    client?: PassportClientBrief;
    currency_info: CurrencyInfo | null;
    deal_type: DealTypeInfo | null;
    payment_type_ref: PaymentTypeInfo | null;
    status_ref: StatusInfo | null;
    reservation?: PassportReservationBrief | null;
    manager_user: UserInfo | null;
    created_by_user: UserInfo | null;
    updated_by_user: UserInfo | null;
    payments?: PassportPayment[];
    payment_schedules?: PassportPaymentSchedule[];
}

// RESERVATIONS

export interface PassportReservation {
    id: number;
    project_id: number;
    block_id: number;
    unit_id: number;
    client_id: number;
    status: number | null;
    manager_user_id: number;
    start_at: string;
    expires_at: string;
    confirmed_at: string | null;
    canceled_at: string | null;
    closed_at: string | null;
    reservation_amount: number;
    currency: string; // API возвращает строку "1"
    comment: string | null;
    cancel_reason: string | null;
    notify_3_days: boolean;
    notify_2_days: boolean;
    notify_1_day: boolean;
    created_by: number;
    updated_by: number;
    created_at: string;
    updated_at: string;
    deleted: boolean;
    lead: unknown | null;
    currency_info: CurrencyInfo | null;
    status_ref: StatusInfo | null;
    manager_user: UserInfo | null;
    created_by_user: UserInfo | null;
    updated_by_user: UserInfo | null;
    payments?: PassportPayment[];
}

// Краткие версии для вложенных структур
export interface PassportReservationBrief {
    id: number;
    project_id: number;
    block_id: number;
    unit_id: number;
    client_id: number;
    status: number | null;
    manager_user_id: number;
    start_at: string;
    expires_at: string;
    confirmed_at: string | null;
    canceled_at: string | null;
    closed_at: string | null;
    reservation_amount: number;
    currency: string;
    comment: string | null;
    cancel_reason: string | null;
    notify_3_days: boolean;
    notify_2_days: boolean;
    notify_1_day: boolean;
    created_by: number;
    updated_by: number;
    created_at: string;
    updated_at: string;
    deleted: boolean;
}

export interface PassportClientBrief {
    id: number;
    full_name: string;
    phone: string;
    email: string;
    passport_number: string;
    pin: string;
    manager_user_id: number | null;
}

// CLIENTS (внутри unit)

export interface PassportClient extends PassportClientBrief {
    reservations: PassportReservation[];
    deals: PassportDeal[];
    payment_schedules: PassportPaymentSchedule[];
}

// UNIT (внутри паспорта)

export interface PassportUnit {
    id: number;
    project_id: number;
    block_id: number;
    floor_id: number;
    unit_number: string;
    lot_type: string;
    plan_code: string;
    external_code: string;
    rooms: number;
    area_total: number;
    price_total: number;
    price_per_m2: number | null;
    currency: number;
    status_id: number;
    finish_type: number | null;
    cadastral_number: string | null;
    description: string | null;
    comment: string | null;
    created_by: number;
    updated_by: number;
    created_at: string;
    updated_at: string;
    deleted: boolean;
    floor: FloorInfo | null;
    status: StatusInfo | null;
    currency_info: CurrencyInfo | null;
    clients: PassportClient[];
}

// ROOT: UNIT PASSPORT

export interface UnitPassport {
    unit: PassportUnit;
    reservations: PassportReservation[];
    deals: PassportDeal[];
    payments: PassportPayment[];
    payment_schedules: PassportPaymentSchedule[];
    latest_at?: string;
}

// SLICE STATE

interface SalesUnitPassportState {
    passport: UnitPassport | null;
    loading: boolean;
    error: string | null;
}

const initialState: SalesUnitPassportState = {
    passport: null,
    loading: false,
    error: null,
};

// ASYNC THUNK
export const fetchSalesUnitPassport = createAsyncThunk<
    UnitPassport,
    number,
    { rejectValue: string }
>('salesUnits/passport', async (unitId, { rejectWithValue }) => {
    try {
        const res = await apiRequest<UnitPassport>(`/sales/units/${unitId}/passport`, 'GET');

        return res.data;
    } catch (err) {
        return rejectWithValue(
            err instanceof Error ? err.message : 'Не удалось загрузить паспорт лота',
        );
    }
});

// SLICE
const salesUnitPassportSlice = createSlice({
    name: 'salesUnitPassport',
    initialState,
    reducers: {
        clearPassport(state) {
            state.passport = null;
            state.error = null;
            state.loading = false;
        },
        clearPassportError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Pending
            .addCase(fetchSalesUnitPassport.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            // Fulfilled
            .addCase(
                fetchSalesUnitPassport.fulfilled,
                (state, action: PayloadAction<UnitPassport>) => {
                    state.loading = false;
                    state.passport = action.payload;
                    state.error = null;
                },
            )
            // Rejected
            .addCase(fetchSalesUnitPassport.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Неизвестная ошибка';
            });
    },
});

export const { clearPassport, clearPassportError } = salesUnitPassportSlice.actions;

// SELECTORS
export const selectPassport = (state: { salesUnitPassport: SalesUnitPassportState }) =>
    state.salesUnitPassport.passport;

export const selectPassportLoading = (state: { salesUnitPassport: SalesUnitPassportState }) =>
    state.salesUnitPassport.loading;

export const selectPassportError = (state: { salesUnitPassport: SalesUnitPassportState }) =>
    state.salesUnitPassport.error;

export const selectPassportUnit = (state: { salesUnitPassport: SalesUnitPassportState }) =>
    state.salesUnitPassport.passport?.unit ?? null;

export const selectPassportClients = (state: { salesUnitPassport: SalesUnitPassportState }) =>
    state.salesUnitPassport.passport?.unit?.clients ?? [];

export const selectPassportReservations = (state: { salesUnitPassport: SalesUnitPassportState }) =>
    state.salesUnitPassport.passport?.reservations ?? [];

export const selectPassportDeals = (state: { salesUnitPassport: SalesUnitPassportState }) =>
    state.salesUnitPassport.passport?.deals ?? [];

export const selectPassportPayments = (state: { salesUnitPassport: SalesUnitPassportState }) =>
    state.salesUnitPassport.passport?.payments ?? [];

export const selectPassportSchedules = (state: { salesUnitPassport: SalesUnitPassportState }) =>
    state.salesUnitPassport.passport?.payment_schedules ?? [];

// REDUCER
export default salesUnitPassportSlice.reducer;
