import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '@/utils/apiRequest';
import type { Pagination } from '@/features/users/userSlice';

/*TYPES*/
export interface WorkPerformedItem {
    id: number;
    service_type: number;
    service_id: number;
    name: string | null;
    stage_id: number;
    subsection_id: number;
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

export interface FetchWorkPerformedItemsPayload {
    page?: number;
    size?: number;
    work_performed_id?: number;
}

/*STATE*/
interface State {
    items: WorkPerformedItem[];
    pagination: Pagination | null;
    loading: boolean;
    error: string | null;
}

const initialState: State = {
    items: [],
    pagination: null,
    loading: false,
    error: null,
};

/*THUNKS*/
//FETCH
export const fetchWorkPerformedItems = createAsyncThunk<
    { data: WorkPerformedItem[]; pagination: Pagination },
    FetchWorkPerformedItemsPayload
>('workPerformedItems/fetch', async (params = {}, { rejectWithValue }) => {
    try {
        const res = await apiRequest<{
            data: WorkPerformedItem[];
            pagination: Pagination;
        }>('/workPerformedItems/search', 'POST', params);

        return res.data;
    } catch (e: any) {
        return rejectWithValue(e.message);
    }
});

//CREATE
export const createWorkPerformedItem = createAsyncThunk<
    WorkPerformedItem,
    Partial<WorkPerformedItem>
>('workPerformedItems/create', async (payload, { rejectWithValue }) => {
    try {
        const res = await apiRequest<WorkPerformedItem>(
            '/workPerformedItems/create',
            'POST',
            payload,
        );

        return res.data;
    } catch (e: any) {
        return rejectWithValue(e.message);
    }
});

//UPDATE
export const updateWorkPerformedItem = createAsyncThunk<
    WorkPerformedItem,
    { id: number; data: Partial<WorkPerformedItem> }
>('workPerformedItems/update', async ({ id, data }, { rejectWithValue }) => {
    try {
        const res = await apiRequest<WorkPerformedItem>(
            `/workPerformedItems/update/${id}`,
            'PUT',
            data,
        );

        return res.data;
    } catch (e: any) {
        return rejectWithValue(e.message);
    }
});

//DELETE
export const deleteWorkPerformedItem = createAsyncThunk<number, number>(
    'workPerformedItems/delete',
    async (id, { rejectWithValue }) => {
        try {
            await apiRequest(`/workPerformedItems/delete/${id}`, 'DELETE');
            return id;
        } catch (e: any) {
            return rejectWithValue(e.message);
        }
    },
);

/*SLICE*/
const workPerformedItemsSlice = createSlice({
    name: 'workPerformedItems',
    initialState,
    reducers: {
        clearWorkPerformedItems: (state) => {
            state.items = [];
            state.pagination = null;
        },
    },
    extraReducers: (builder) => {
        builder
            /*FETCH*/
            .addCase(fetchWorkPerformedItems.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchWorkPerformedItems.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchWorkPerformedItems.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            /*CREATE*/
            .addCase(createWorkPerformedItem.fulfilled, (state, action) => {
                state.items.unshift(action.payload);
            })

            /*UPDATE*/
            .addCase(updateWorkPerformedItem.fulfilled, (state, action) => {
                const index = state.items.findIndex((i) => i.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })

            /*DELETE*/
            .addCase(deleteWorkPerformedItem.fulfilled, (state, action) => {
                state.items = state.items.filter((i) => i.id !== action.payload);
            });
    },
});

/*EXPORTS*/

export const { clearWorkPerformedItems } = workPerformedItemsSlice.actions;
export default workPerformedItemsSlice.reducer;
