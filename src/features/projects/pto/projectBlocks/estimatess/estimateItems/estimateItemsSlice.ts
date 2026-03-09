import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '@/utils/apiRequest';

/* TYPES */
export interface EstimateItem {
    id: number;
    material_estimate_id: number;
    stage_id: number | null;
    subsection_id: number | null;
    item_type: number;
    service_type: number | null;
    service_id: number | null;
    material_type: number | null;
    material_id: number | null;
    unit_of_measure: number | null;
    quantity_planned: number;
    coefficient: number | null;
    currency: number | null;
    currency_rate: number | null;
    price: number;
    comment: string | null;
    created_at?: string;
    updated_at?: string;
    deleted: boolean;
}
export interface EstimateItemFormData {
    id: string;

    material_estimate_id: number;
    stage_id: number | null;
    subsection_id: number | null;

    item_type: number;

    service_type?: number | null;
    service_id?: number | null;

    material_type?: number | null;
    material_id?: number | null;
    unit_of_measure?: number | null;

    quantity_planned: number;
    coefficient: number;
    currency: number | null;
    currency_rate: number;
    price: number;
    comment: string;
}
export type EstimateItemCreatePayload = Omit<EstimateItemFormData, 'id'>;
interface EstimateItemsState {
    byEstimateId: Record<number, EstimateItem[]>;
    loading: boolean;
    error: string | null;
}

const initialState: EstimateItemsState = {
    byEstimateId: {},
    loading: false,
    error: null,
};

/* FETCH */
export const fetchEstimateItems = createAsyncThunk<EstimateItem[], void, { rejectValue: string }>(
    'estimateItems/gets',
    async (_, { rejectWithValue }) => {
        try {
            const res = await apiRequest<EstimateItem[]>('/materialEstimateItems/gets', 'GET');

            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.message || 'Ошибка загрузки позиций');
        }
    },
);

/* CREATE */

export const createEstimateItems = createAsyncThunk<
    EstimateItem[],
    EstimateItemCreatePayload[],
    { rejectValue: string }
>('estimateItems/create', async (data, { rejectWithValue }) => {
    try {
        const res = await apiRequest<EstimateItem[]>('/materialEstimateItems/create', 'POST', data);

        return res.data;
    } catch (err: any) {
        return rejectWithValue(err.message || 'Ошибка создания позиции');
    }
});
/* UPDATE */

export const updateEstimateItem = createAsyncThunk<
    EstimateItem,
    { id: number; data: EstimateItemFormData },
    { rejectValue: string }
>('estimateItems/update', async ({ id, data }, { rejectWithValue }) => {
    try {
        const res = await apiRequest<EstimateItem>(
            `/materialEstimateItems/update/${id}`,
            'PUT',
            data,
        );

        return res.data;
    } catch (err: any) {
        return rejectWithValue(err.message || 'Ошибка обновления позиции');
    }
});

/* DELETE */

export const deleteEstimateItem = createAsyncThunk<number, number, { rejectValue: string }>(
    'estimateItems/delete',
    async (id, { rejectWithValue }) => {
        try {
            await apiRequest(`/materialEstimateItems/delete/${id}`, 'DELETE');
            return id;
        } catch (err: any) {
            return rejectWithValue(err.message || 'Ошибка удаления позиции');
        }
    },
);

/* SLICE */

const estimateItemsSlice = createSlice({
    name: 'estimateItems',
    initialState,
    reducers: {
        clearItemsByEstimate: (state, action) => {
            delete state.byEstimateId[action.payload];
        },
    },
    extraReducers: (builder) => {
        builder

            /* FETCH */

            .addCase(fetchEstimateItems.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(fetchEstimateItems.fulfilled, (state, action) => {
                state.loading = false;

                state.byEstimateId = {};

                action.payload.forEach((item) => {
                    const estimateId = item.material_estimate_id;

                    if (!state.byEstimateId[estimateId]) {
                        state.byEstimateId[estimateId] = [];
                    }

                    state.byEstimateId[estimateId].push(item);
                });
            })

            .addCase(fetchEstimateItems.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Ошибка загрузки';
            })

            /* CREATE */

            .addCase(createEstimateItems.fulfilled, (state, action) => {
                action.payload.forEach((item) => {
                    const estimateId = item.material_estimate_id;

                    if (!state.byEstimateId[estimateId]) {
                        state.byEstimateId[estimateId] = [];
                    }

                    state.byEstimateId[estimateId].push(item);
                });
            })

            /* UPDATE */
            .addCase(updateEstimateItem.fulfilled, (state, action) => {
                const estimateId = action.payload.material_estimate_id;
                const items = state.byEstimateId[estimateId];

                if (!items) return;

                const index = items.findIndex((i) => i.id === action.payload.id);

                if (index !== -1) {
                    items[index] = action.payload;
                }
            })

            /* DELETE (мгновенное обновление UI) */
            .addCase(deleteEstimateItem.fulfilled, (state, action) => {
                const id = action.payload;

                Object.keys(state.byEstimateId).forEach((estimateId) => {
                    state.byEstimateId[+estimateId] = state.byEstimateId[+estimateId].filter(
                        (item) => item.id !== id,
                    );
                });
            });
    },
});

export const { clearItemsByEstimate } = estimateItemsSlice.actions;

export default estimateItemsSlice.reducer;
