import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Pagination } from '@/features/users/userSlice';
import { apiRequest, type ApiResponse } from '@/utils/apiRequest';

export interface PaymentTypeRef {
    id: number;
    name: string;
    code: string;
    sort_order: number;
    created_at: string;
    updated_at: string;
    deleted: boolean;
}

export interface PaymentStatusRef {
    id: number;
    name: string;
    code: string;
    color: string;
    sort_order: number;
    is_final: boolean;
    created_at: string;
    updated_at: string;
    deleted: boolean;
}

export interface PaymentArticle {
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
    code?: string;
    sort_order?: number;
    created_at?: string;
    updated_at?: string;
    deleted?: boolean;
}

export interface CurrencyRef {
    id: number;
    name: string;
    code: string;
    created_at: string;
    updated_at: string;
    deleted: boolean;
}

export interface ProjectRef {
    id: number;
    name: string;
    code: string;
    type: number;
    address: string | null;
    customer_name: string | null;
    start_date: string | null;
    end_date: string | null;
    planned_budget: number | null;
    status: number;
    manager_id: number | null;
    foreman_id: number | null;
    master_id: number | null;
    warehouse_manager_id: number | null;
    description: string | null;
    created_at: string;
    updated_at: string;
    deleted: boolean;
}

export interface BlockRef {
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

export interface Payment {
    id: number;
    project_id: number;
    block_id: number;
    payment_type: number;
    entity_type: string | null;
    entity_id: number | null;
    article_id: number;
    status: number;
    counterparty_type: string | null;
    counterparty_id: number | null;
    counterparty_name: string | null;
    counterparty_inn: string | null;
    title: string;
    description: string | null;
    amount: number;
    currency: number;
    currency_rate: number;
    planned_date: string | null;
    paid_date: string | null;
    payment_method: number | null;
    account_type: number | null;
    document_number: string | null;
    external_number: string | null;
    comment: string | null;
    is_manual: boolean;
    created_by: number | null;
    updated_by: number | null;
    created_at: string;
    updated_at: string;
    posted_at: string | null;
    deleted: boolean;
    payment_type_ref?: PaymentTypeRef | null;
    status_ref?: PaymentStatusRef | null;
    article?: PaymentArticle | null;
    currency_ref?: CurrencyRef | null;
    payment_method_ref?: PaymentMethodRef | null;
    project?: ProjectRef | null;
    block?: BlockRef | null;
}

export interface PaymentSearchParams {
    page?: number;
    size?: number;
    search?: string;
    project_id?: number;
    block_id?: number;
    payment_type?: number;
    status?: number;
    article_id?: number;
    dateFrom?: string;
    dateTo?: string;
}

export interface PaymentCreatePayload {
    project_id: number;
    block_id: number;
    payment_type: number;
    entity_type?: string | null;
    entity_id?: number | null;
    article_id: number;
    status?: number;
    counterparty_type?: string | null;
    counterparty_id?: number | null;
    counterparty_name?: string | null;
    counterparty_inn?: string | null;
    title: string;
    description?: string | null;
    amount: number;
    currency: number;
    currency_rate?: number;
    planned_date?: string | null;
    paid_date?: string | null;
    payment_method?: number | null;
    account_type?: number | null;
    document_number?: string | null;
    external_number?: string | null;
    comment?: string | null;
    is_manual?: boolean;
}

export interface PaymentUpdatePayload extends Partial<PaymentCreatePayload> {
    status?: number;
}

export interface PaymentsState {
    data: Payment[];
    pagination: Pagination | null;
    current: Payment | null;
    types: PaymentTypeRef[];
    statuses: PaymentStatusRef[];
    articles: PaymentArticle[];
    methods: PaymentMethodRef[];
    loading: boolean;
    refsLoading: boolean;
    submitting: boolean;
    error: string | null;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null;

const isPayment = (value: unknown): value is Payment =>
    isRecord(value) && typeof value.id === 'number';
const normalizePayment = (value: unknown): Payment | null => {
    if (isPayment(value)) return value;
    if (!isRecord(value)) return null;
    if (isPayment(value.data)) return value.data;
    if (isPayment(value.item)) return value.item;

    return null;
};

const getErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    return fallback;
};

const upsertPayment = (state: PaymentsState, item: Payment) => {
    const index = state.data.findIndex((row) => row.id === item.id);

    if (index !== -1) {
        state.data[index] = item;
    } else {
        state.data.unshift(item);
        if (state.pagination) {
            state.pagination.total += 1;
        }
    }

    state.current = item;
};

export const fetchPaymentTypes = createAsyncThunk<PaymentTypeRef[], void, { rejectValue: string }>(
    'payments/fetchTypes',
    async (_, { rejectWithValue }) => {
        try {
            const res = await apiRequest<PaymentTypeRef[]>('/payments/types', 'GET');
            return res.data;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, 'Ошибка загрузки типов платежей'));
        }
    },
);

export const fetchPaymentStatuses = createAsyncThunk<
    PaymentStatusRef[],
    void,
    { rejectValue: string }
>('payments/fetchStatuses', async (_, { rejectWithValue }) => {
    try {
        const res = await apiRequest<PaymentStatusRef[]>('/payments/statuses', 'GET');
        return res.data;
    } catch (error) {
        return rejectWithValue(getErrorMessage(error, 'Ошибка загрузки статусов платежей'));
    }
});

export const fetchPaymentArticles = createAsyncThunk<
    PaymentArticle[],
    void,
    { rejectValue: string }
>('payments/fetchArticles', async (_, { rejectWithValue }) => {
    try {
        const res = await apiRequest<PaymentArticle[]>('/payments/articles', 'GET');
        return res.data;
    } catch (error) {
        return rejectWithValue(getErrorMessage(error, 'Ошибка загрузки статей платежей'));
    }
});

export const fetchPaymentMethods = createAsyncThunk<
    PaymentMethodRef[],
    void,
    { rejectValue: string }
>('payments/fetchMethods', async (_, { rejectWithValue }) => {
    try {
        const res = await apiRequest<PaymentMethodRef[]>('/payments/methods', 'GET');
        return res.data;
    } catch (error) {
        return rejectWithValue(getErrorMessage(error, 'Ошибка загрузки способов оплаты'));
    }
});

export const fetchPayments = createAsyncThunk<
    ApiResponse<Payment[]>,
    PaymentSearchParams,
    { rejectValue: string }
>('payments/search', async (params, { rejectWithValue }) => {
    try {
        return await apiRequest<Payment[]>('/payments/search', 'POST', params);
    } catch (error) {
        return rejectWithValue(getErrorMessage(error, 'Ошибка загрузки платежей'));
    }
});

export const createPayment = createAsyncThunk<
    Payment,
    PaymentCreatePayload,
    { rejectValue: string }
>('payments/create', async (payload, { rejectWithValue }) => {
    try {
        const res = await apiRequest<Payment>('/payments/create', 'POST', payload);
        const item = normalizePayment(res.data);

        if (!item) {
            throw new Error('Сервер не вернул созданный платеж');
        }

        return item;
    } catch (error) {
        return rejectWithValue(getErrorMessage(error, 'Ошибка создания платежа'));
    }
});

export const updatePayment = createAsyncThunk<
    Payment,
    { id: number; data: PaymentUpdatePayload },
    { rejectValue: string }
>('payments/update', async ({ id, data }, { rejectWithValue }) => {
    try {
        const res = await apiRequest<Payment>(`/payments/update/${id}`, 'PUT', data);
        const item = normalizePayment(res.data);

        if (!item) {
            throw new Error('Сервер не вернул обновленный платеж');
        }

        return item;
    } catch (error) {
        return rejectWithValue(getErrorMessage(error, 'Ошибка обновления платежа'));
    }
});

// export const deletePayment = createAsyncThunk<number, number, { rejectValue: string }>(
//     'payments/delete',
//     async (id, { rejectWithValue }) => {
//         try {
//             await apiRequest(`/payments/delete/${id}`, 'DELETE');
//             return id;
//         } catch (error) {
//             return rejectWithValue(getErrorMessage(error, 'Ошибка удаления платежа'));
//         }
//     },
// );

const initialState: PaymentsState = {
    data: [],
    pagination: null,
    current: null,
    types: [],
    statuses: [],
    articles: [],
    methods: [],
    loading: false,
    refsLoading: false,
    submitting: false,
    error: null,
};

export const paymentsSlice = createSlice({
    name: 'payments',
    initialState,
    reducers: {
        clearPayments(state) {
            state.data = [];
            state.pagination = null;
            state.current = null;
            state.loading = false;
            state.submitting = false;
            state.error = null;
        },
        setCurrentPayment(state, action: PayloadAction<Payment | null>) {
            state.current = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPaymentTypes.pending, (state) => {
                state.refsLoading = true;
                state.error = null;
            })
            .addCase(fetchPaymentTypes.fulfilled, (state, action) => {
                state.refsLoading = false;
                state.types = action.payload;
            })
            .addCase(fetchPaymentTypes.rejected, (state, action) => {
                state.refsLoading = false;
                state.error = action.payload ?? 'Ошибка загрузки типов платежей';
            })
            .addCase(fetchPaymentStatuses.pending, (state) => {
                state.refsLoading = true;
                state.error = null;
            })
            .addCase(fetchPaymentStatuses.fulfilled, (state, action) => {
                state.refsLoading = false;
                state.statuses = action.payload;
            })
            .addCase(fetchPaymentStatuses.rejected, (state, action) => {
                state.refsLoading = false;
                state.error = action.payload ?? 'Ошибка загрузки статусов платежей';
            })
            .addCase(fetchPaymentArticles.pending, (state) => {
                state.refsLoading = true;
                state.error = null;
            })
            .addCase(fetchPaymentArticles.fulfilled, (state, action) => {
                state.refsLoading = false;
                state.articles = action.payload;
            })
            .addCase(fetchPaymentArticles.rejected, (state, action) => {
                state.refsLoading = false;
                state.error = action.payload ?? 'Ошибка загрузки статей платежей';
            })
            .addCase(fetchPaymentMethods.pending, (state) => {
                state.refsLoading = true;
                state.error = null;
            })
            .addCase(fetchPaymentMethods.fulfilled, (state, action) => {
                state.refsLoading = false;
                state.methods = action.payload;
            })
            .addCase(fetchPaymentMethods.rejected, (state, action) => {
                state.refsLoading = false;
                state.error = action.payload ?? 'Ошибка загрузки способов оплаты';
            })
            .addCase(fetchPayments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPayments.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.data ?? [];
                state.pagination = action.payload.pagination ?? null;

                if (state.current) {
                    state.current =
                        state.data.find((payment) => payment.id === state.current?.id) ??
                        state.current;
                }
            })
            .addCase(fetchPayments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Ошибка загрузки платежей';
            })
            .addCase(createPayment.pending, (state) => {
                state.submitting = true;
                state.error = null;
            })
            .addCase(createPayment.fulfilled, (state, action) => {
                state.submitting = false;
                upsertPayment(state, action.payload);
            })
            .addCase(createPayment.rejected, (state, action) => {
                state.submitting = false;
                state.error = action.payload ?? 'Ошибка создания платежа';
            })
            .addCase(updatePayment.pending, (state) => {
                state.submitting = true;
                state.error = null;
            })
            .addCase(updatePayment.fulfilled, (state, action) => {
                state.submitting = false;
                upsertPayment(state, action.payload);
            })
            .addCase(updatePayment.rejected, (state, action) => {
                state.submitting = false;
                state.error = action.payload ?? 'Ошибка обновления платежа';
            });
        // .addCase(deletePayment.pending, (state) => {
        //     state.submitting = true;
        //     state.error = null;
        // })
        // .addCase(deletePayment.fulfilled, (state, action) => {
        //     state.submitting = false;
        //     state.data = state.data.filter((payment) => payment.id !== action.payload);

        //     if (state.current?.id === action.payload) {
        //         state.current = null;
        //     }

        //     if (state.pagination) {
        //         state.pagination.total = Math.max(0, state.pagination.total - 1);
        //     }
        // })
        // .addCase(deletePayment.rejected, (state, action) => {
        //     state.submitting = false;
        //     state.error = action.payload ?? 'Ошибка удаления платежа';
        // });
    },
});

export const { clearPayments, setCurrentPayment } = paymentsSlice.actions;
export default paymentsSlice.reducer;
