import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { Pagination } from '@/features/users/userSlice';
import { apiRequest, type ApiResponse } from '@/utils/apiRequest';
import type { MaterialRequestItem } from '../material_request_items/materialRequestItemsSlice';

export interface MaterialRequest {
    id: number;
    project_id: number;
    block_id: number;
    status: number;

    approved_by_foreman: boolean | null;
    approved_by_foreman_time: string | null;
    foreman_user_id: number | null;

    approved_by_site_manager: boolean | null;
    approved_by_site_manager_time: string | null;
    site_manager_user_id: number | null;

    approved_by_purchasing_agent: boolean | null;
    approved_by_purchasing_agent_time: string | null;
    purchasing_agent_user_id: number | null;

    approved_by_planning_engineer: boolean | null;
    approved_by_planning_engineer_time: string | null;
    planning_engineer_user_id: number | null;

    approved_by_main_engineer: boolean | null;
    approved_by_main_engineer_time: string | null;
    main_engineer_user_id: number | null;

    created_at: string;
    updated_at: string;
    deleted: boolean;

    items: MaterialRequestItem[];
}

export interface MaterialRequestSearchResponse {
    success: boolean;
    data: MaterialRequest[];
    pagination: Pagination;
}

export interface MaterialRequestCreatePayload {
    project_id: number;
    block_id: number;
    status?: number;
    items: {
        material_id: number | null;
        material_type: number | null;
        unit_of_measure: number | null;

        stage_id: number | null;
        subsection_id: number | null;

        quantity: number;
        coefficient?: number;

        currency?: number | null;
        currency_rate?: number;
        price?: number;

        comment?: string;

        item_type: number;
    }[];
}

interface MaterialRequestsState {
    data: MaterialRequest[];
    pagination: Pagination | null;
    loading: boolean;
    current: MaterialRequest | null;
    error: string | null;
    submitting: boolean;
    projectId: number | null;
}

const initialState: MaterialRequestsState = {
    data: [],
    pagination: null,
    loading: false,
    current: null,
    error: null,
    submitting: false,
    projectId: null,
};

// SEARCH
interface FetchSearchMaterialReqParams {
    page?: number;
    size?: number;
    search?: string;
    filters?: {
        status?: number;
        dateFrom?: string;
        dateTo?: string;
    };
    project_id: number;
    block_id?: number;
}
const normalizeItem = (value: unknown): MaterialRequest | null => {
    const data = value as any;

    if (!data) return null;
    if (data?.id) return data;
    if (data?.data?.id) return data.data;
    if (data?.item?.id) return data.item;

    return null;
};

const upsertItem = (state: MaterialRequestsState, item: MaterialRequest) => {
    const index = state.data.findIndex((row) => row.id === item.id);

    if (index !== -1) {
        state.data[index] = item;
    } else {
        state.data.unshift(item);
    }

    if (state.current?.id === item.id) {
        state.current = item;
    }
};
export const fetchSearchMaterialReq = createAsyncThunk<
    ApiResponse<MaterialRequest[]>,
    FetchSearchMaterialReqParams,
    { rejectValue: string }
>('suppliers/search', async (params, { rejectWithValue }) => {
    try {
        return await apiRequest<MaterialRequest[]>('/materialRequests/search', 'POST', params);
    } catch (error: any) {
        return rejectWithValue(error.message || 'Ошибка загрузки заявок на материалы');
    }
});

// CREATE
export const createMaterialReq = createAsyncThunk<
    MaterialRequest,
    MaterialRequestCreatePayload,
    { rejectValue: string }
>('materialRequests/create', async (materialRequest, { rejectWithValue }) => {
    try {
        const res = await apiRequest<MaterialRequest>(
            '/materialRequests/create',
            'POST',
            materialRequest,
        );
        return res.data;
    } catch (err: any) {
        return rejectWithValue(err.message);
    }
});

//ОБНОВЛЁННЫЙ UPDATE
export const updateMaterialRequest = createAsyncThunk<
    MaterialRequest,
    {
        id: number;
        items: {
            id: number;
            material_estimate_item_id: number;
            quantity: number;
            price: number;
            coefficient?: number;
            currency: number;
            currency_rate: number;
        }[];
    },
    { rejectValue: string }
>('materialRequests/update', async ({ id, items }, { rejectWithValue }) => {
    try {
        const res = await apiRequest<MaterialRequest>(`/materialRequests/update/${id}`, 'PUT', {
            items,
        });

        return res.data;
    } catch (err: any) {
        return rejectWithValue(err.message);
    }
});

// DELETE
export const deleteMaterialRequest = createAsyncThunk<number, number, { rejectValue: string }>(
    'materialRequests/delete',
    async (id, { rejectWithValue }) => {
        try {
            await apiRequest(`/materialRequests/delete/${id}`, 'DELETE');
            return id;
        } catch (err: any) {
            return rejectWithValue(err.message || 'Ошибка удаления заявки');
        }
    },
);

// SIGN
export const signMaterialRequest = createAsyncThunk<
    MaterialRequest,
    {
        id: number;
        stage:
            | 'foreman'
            | 'planning_engineer'
            | 'main_engineer'
            | 'purchasing_agent'
            | 'site_manager';
        items?: Array<{
            id: number;
            material_estimate_item_id: number;
            quantity: number;
            price: string | number | null;
            coefficient: string | number | null;
            currency: number | null;
            currency_rate: number | null;
        }>;
    },
    { rejectValue: string }
>('materialRequests/sign', async ({ id, stage, items }, { rejectWithValue }) => {
    try {
        const body =
            stage === 'planning_engineer'
                ? {
                      stage,
                      items: items ?? [],
                  }
                : { stage };

        const res = await apiRequest<MaterialRequest>(`/materialRequests/sign/${id}`, 'POST', body);

        const item = normalizeItem(res.data);

        if (!item) {
            throw new Error('Сервер не вернул подписанное заявление на материалы');
        }

        return item;
    } catch (err: any) {
        return rejectWithValue(err.message || 'Ошибка подписания заявления на материалы');
    }
});

// SLICE
export const materialRequestsSlice = createSlice({
    name: 'materialRequests',
    initialState,

    reducers: {
        clearMaterialRequests(state) {
            state.data = [];
            state.pagination = null;
            state.error = null;
            state.loading = false;
            state.submitting = false;
            state.projectId = null;
        },
    },

    extraReducers: (builder) => {
        builder
            .addCase(fetchSearchMaterialReq.pending, (state, action) => {
                state.loading = true;
                state.error = null;
                state.projectId = action.meta.arg.project_id;
            })

            .addCase(fetchSearchMaterialReq.fulfilled, (state, action) => {
                if (state.projectId !== action.meta.arg.project_id) return;

                state.loading = false;
                state.data = action.payload.data;
                state.pagination = action.payload.pagination ?? null;
            })

            .addCase(fetchSearchMaterialReq.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as string) || 'Ошибка загрузки';
            })

            .addCase(createMaterialReq.fulfilled, (state, action) => {
                if (state.projectId === action.payload.project_id) {
                    state.data.unshift(action.payload);
                }
            })

            .addCase(updateMaterialRequest.fulfilled, (state, action) => {
                state.data = state.data.map((req) =>
                    req.id === action.payload.id ? action.payload : req,
                );
            })

            .addCase(deleteMaterialRequest.fulfilled, (state, action) => {
                state.data = state.data.filter((m) => m.id !== action.payload);
                if (state.pagination) {
                    state.pagination.total -= 1;
                }
            })

            .addCase(signMaterialRequest.pending, (state) => {
                state.submitting = true;
                state.error = null;
            })
            .addCase(signMaterialRequest.fulfilled, (state, action) => {
                state.submitting = false;
                upsertItem(state, action.payload);
            })
            .addCase(signMaterialRequest.rejected, (state, action) => {
                state.submitting = false;
                state.error = action.payload ?? 'Ошибка подписания заявления на материалы';
            });
    },
});

export const { clearMaterialRequests } = materialRequestsSlice.actions;
export default materialRequestsSlice.reducer;
