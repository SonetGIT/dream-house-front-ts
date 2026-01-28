import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { MaterialRequestCreatePayload } from './MaterialReqCreateEditForm';
import type { Pagination } from '@/features/users/userSlice';
import { apiRequest, type ApiResponse } from '@/utils/apiRequest';

// Типы
export interface MaterialRequestItem {
    id: number;
    material_type: number;
    material_id: number;
    unit_of_measure: number;
    quantity: number;
    price: number;
    summ: number;
    comment: string | null;
    material_request_id: number;
}

export interface MaterialRequest {
    id: number;
    project_id: number;
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
//??? ПРИ ДОБАВЛЕНИИ ФИЛЬТРА НАДО ПОСМОТРЕТЬ
interface MaterialRequestFilters {
    status?: number;
    dateFrom?: string;
    dateTo?: string;
}

//THUNK
// Search / List
interface FetchSearchMaterialReqParams {
    page?: number;
    size?: number;
    search?: string;
    filters?: MaterialRequestFilters;
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
        return rejectWithValue(error.message || 'Ошибка при загрузке заявок на материалы');
    }
});

export const createMaterialReq = createAsyncThunk<
    MaterialRequest,
    MaterialRequestCreatePayload,
    { rejectValue: string }
>('materialRequests/create', async (materialRequest, { rejectWithValue }) => {
    try {
        const res = await apiRequest<MaterialRequest>(
            '/materialRequests/create',
            'POST',
            materialRequest
        );

        return res.data;
    } catch (err: any) {
        return rejectWithValue(err.message);
    }
});

export const updateMaterialRequest = createAsyncThunk<
    MaterialRequest,
    { id: number; data: MaterialRequestCreatePayload },
    { rejectValue: string }
>('materialRequests/update', async ({ id, data }, { rejectWithValue }) => {
    try {
        const res = await apiRequest<MaterialRequest>(
            `/materialRequests/update/${id}`,
            'PUT',
            data
        );

        return res.data;
    } catch (err: any) {
        return rejectWithValue(err.message);
    }
});

export const signMaterialRequest = createAsyncThunk<
    MaterialRequest,
    { id: number; role_id: number; userId: number },
    { rejectValue: string }
>('materialRequests/sign', async ({ id, role_id, userId }, { rejectWithValue }) => {
    try {
        const update: Partial<MaterialRequest> = {};
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
            update
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
        // Если нужно ручное очищение:
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
            // Pending
            .addCase(fetchSearchMaterialReq.pending, (state, action) => {
                state.loading = true;
                state.error = null;
                state.projectId = action.meta.arg.project_id;
            })
            // Fulfilled
            .addCase(fetchSearchMaterialReq.fulfilled, (state, action) => {
                if (state.projectId !== action.meta.arg.project_id) return;

                state.loading = false;
                state.data = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            // Rejected
            .addCase(fetchSearchMaterialReq.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as string) || 'Ошибка загрузки';
            })

            // CREATE MaterialReq
            .addCase(createMaterialReq.fulfilled, (state, action) => {
                if (state.projectId === action.payload.project_id) {
                    state.data.unshift(action.payload);
                }

                // state.data.unshift(action.payload);
            })
            .addCase(createMaterialReq.rejected, (state, action) => {
                state.error = action.payload as string;
            })

            .addCase(updateMaterialRequest.fulfilled, (state, action) => {
                state.data = state.data.map((u) =>
                    u.id === action.payload.id ? action.payload : u
                );
            })

            //SIGN
            .addCase(signMaterialRequest.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(signMaterialRequest.fulfilled, (state, action) => {
                state.loading = false;
                console.log('ACTION', action.payload);
                const index = state.data.findIndex((req) => req.id === action.payload.id);

                if (index !== -1) {
                    state.data[index] = {
                        ...state.data[index], //сохраняем items
                        ...action.payload, // обновляем подпись
                    };
                }
            })

            .addCase(signMaterialRequest.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Ошибка подписи';
            });
    },
});

export const { clearMaterialRequests } = materialRequestsSlice.actions;
export default materialRequestsSlice.reducer;
