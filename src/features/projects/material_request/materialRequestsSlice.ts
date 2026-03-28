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
    error: string | null;
    projectId: number | null;
}

const initialState: MaterialRequestsState = {
    data: [],
    pagination: null,
    loading: false,
    error: null,
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
}

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
        role_id: number;
        userId: number;
    },
    { rejectValue: string }
>('materialRequests/sign', async ({ id, role_id, userId }, { rejectWithValue }) => {
    try {
        const update: any = {};
        const now = new Date().toISOString();

        switch (role_id) {
            case 1:
                update.foreman_user_id = userId;
                update.approved_by_foreman = true;
                update.approved_by_foreman_time = now;

                update.purchasing_agent_user_id = userId;
                update.approved_by_purchasing_agent = true;
                update.approved_by_purchasing_agent_time = now;

                update.site_manager_user_id = userId;
                update.approved_by_site_manager = true;
                update.approved_by_site_manager_time = now;

                update.planning_engineer_user_id = userId;
                update.approved_by_planning_engineer = true;
                update.approved_by_planning_engineer_time = now;

                update.main_engineer_user_id = userId;
                update.approved_by_main_engineer = true;
                update.approved_by_main_engineer_time = now;
                break;

            case 4:
                update.foreman_user_id = userId;
                update.approved_by_foreman = true;
                update.approved_by_foreman_time = now;
                break;

            case 7:
                update.purchasing_agent_user_id = userId;
                update.approved_by_purchasing_agent = true;
                update.approved_by_purchasing_agent_time = now;
                break;

            case 9:
                update.site_manager_user_id = userId;
                update.approved_by_site_manager = true;
                update.approved_by_site_manager_time = now;
                break;

            case 10:
                update.planning_engineer_user_id = userId;
                update.approved_by_planning_engineer = true;
                update.approved_by_planning_engineer_time = now;
                break;

            case 11:
                update.main_engineer_user_id = userId;
                update.approved_by_main_engineer = true;
                update.approved_by_main_engineer_time = now;
                break;

            default:
                return rejectWithValue('Неизвестная роль');
        }

        const res = await apiRequest<MaterialRequest>(
            `/materialRequests/update/${id}`,
            'PUT',
            update,
        );

        return res.data;
    } catch (err: any) {
        return rejectWithValue(err.message);
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

            .addCase(signMaterialRequest.fulfilled, (state, action) => {
                const index = state.data.findIndex((req) => req.id === action.payload.id);

                if (index !== -1) {
                    state.data[index] = {
                        ...state.data[index],
                        ...action.payload,
                    };
                }
            });
    },
});

export const { clearMaterialRequests } = materialRequestsSlice.actions;
export default materialRequestsSlice.reducer;
