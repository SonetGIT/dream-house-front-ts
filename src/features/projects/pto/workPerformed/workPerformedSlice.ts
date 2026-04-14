import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '@/utils/apiRequest';
import type { Pagination } from '@/features/users/userSlice';

/*TYPES*/
export interface WorkPerformedItem {
    id: number;
    stage_id: number;
    subsection_id: number;
    service_type: number;
    service_id: number;
    item_type: number;
    unit_of_measure: number;
    quantity: number;
    currency: number;
    currency_rate: number;
    price: number;
    created_at: string;
    updated_at: string;
    deleted: boolean;
    work_performed_id: number;
    material_estimate_item_id: number;
}

export interface WorkPerformed {
    id: number;
    block_id: number;
    project_id: number;
    code: string | null;
    status: number;

    foreman_user_id: number | null;
    signed_by_foreman: boolean | null;
    signed_by_foreman_time: string | null;

    planning_engineer_user_id: number | null;
    signed_by_planning_engineer: boolean | null;
    signed_by_planning_engineer_time: string | null;

    main_engineer_user_id: number | null;
    signed_by_main_engineer: boolean | null;
    signed_by_main_engineer_time: string | null;

    performed_person_name: string;
    advance_payment: number | null;
    created_at: string;
    updated_at: string;
    deleted: boolean;

    items: WorkPerformedItem[];
}

export interface FetchWorkPerformedPayload {
    page?: number;
    size?: number;
    project_id?: number;
    block_id?: number;
    status?: number;
}

export interface WorkPerformedResponse {
    data: WorkPerformed[];
    pagination: Pagination;
}

/*STATE*/
interface State {
    data: WorkPerformed[];
    pagination: Pagination | null;
    loading: boolean;
    error: string | null;
}

const initialState: State = {
    data: [],
    pagination: null,
    loading: false,
    error: null,
};

/*THUNKS*/
//FETCH
export const fetchWorkPerformed = createAsyncThunk<
    { data: WorkPerformed[]; pagination: Pagination | null },
    Record<string, any>,
    { rejectValue: string }
>('workPerformed/search', async (params, { rejectWithValue }) => {
    try {
        const res = await apiRequest<any>('/workPerformed/search', 'POST', params);

        return {
            data: res.data ?? [],
            pagination: res.pagination ?? null,
        };
    } catch (err: any) {
        return rejectWithValue(err.message || 'Ошибка загрузки закупок');
    }
});

//CREATE
export const createWorkPerformed = createAsyncThunk<WorkPerformed, Partial<WorkPerformed>>(
    'workPerformed/create',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await apiRequest<WorkPerformed>('/workPerformed/create', 'POST', payload);

            return res.data;
        } catch (e: any) {
            return rejectWithValue(e.message);
        }
    },
);

//UPDATE
export const updateWorkPerformed = createAsyncThunk<
    WorkPerformed,
    { id: number; data: Partial<WorkPerformed> }
>('workPerformed/update', async ({ id, data }, { rejectWithValue }) => {
    try {
        const res = await apiRequest<WorkPerformed>(`/workPerformed/update/${id}`, 'PUT', data);

        return res.data;
    } catch (e: any) {
        return rejectWithValue(e.message);
    }
});

//DELETE
export const deleteWorkPerformed = createAsyncThunk<number, number>(
    'workPerformed/delete',
    async (id, { rejectWithValue }) => {
        try {
            await apiRequest(`/workPerformed/delete/${id}`, 'DELETE');
            return id;
        } catch (e: any) {
            return rejectWithValue(e.message);
        }
    },
);

/*SLICE*/
const workPerformedSlice = createSlice({
    name: 'workPerformed',
    initialState,
    reducers: {
        clearWorkPerformed: (state) => {
            state.data = [];
            state.pagination = null;
        },
    },
    extraReducers: (builder) => {
        builder
            /*FETCH*/
            // .addCase(fetchWorkPerformed.pending, (state) => {
            //     state.loading = true;
            //     state.error = null;
            // })
            // .addCase(fetchWorkPerformed.fulfilled, (state, action) => {
            //     state.loading = false;
            //     state.data = action.payload.data;
            //     state.pagination = action.payload.pagination;
            // })
            // .addCase(fetchWorkPerformed.rejected, (state, action) => {
            //     state.loading = false;
            //     state.error = action.payload as string;
            // })
            .addCase(fetchWorkPerformed.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchWorkPerformed.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchWorkPerformed.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Ошибка загрузки';
            })

            /*CREATE*/
            .addCase(createWorkPerformed.fulfilled, (state, action) => {
                state.data.unshift(action.payload);
            })

            /*UPDATE*/
            .addCase(updateWorkPerformed.fulfilled, (state, action) => {
                const index = state.data.findIndex((i) => i.id === action.payload.id);
                if (index !== -1) {
                    state.data[index] = action.payload;
                }
            })

            /*DELETE*/
            .addCase(deleteWorkPerformed.fulfilled, (state, action) => {
                state.data = state.data.filter((i) => i.id !== action.payload);
            });
    },
});

/*EXPORTS*/
export const { clearWorkPerformed } = workPerformedSlice.actions;
export default workPerformedSlice.reducer;
