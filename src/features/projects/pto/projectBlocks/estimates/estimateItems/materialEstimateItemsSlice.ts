import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '@/utils/apiRequest';

/* TYPES */

export interface MaterialEstimateItem {
    id: number;
    material_estimate_id: number;
    subsection_id: number;
    item_type: number;
    service_type: number | null;
    service_id: number | null;
    material_type: number | null;
    material_id: number | null;
    unit_of_measure: number | null;
    quantity_planned: number;
    coefficient: number | null;
    currency: number | null;
    price: number;
    comment: string | null;
    created_at?: string;
    updated_at?: string;
    deleted: boolean;
}

export interface MaterialEstimateItemFormData {
    material_estimate_id: number;
    subsection_id: number;
    item_type: number;
    service_type?: number | null;
    service_id?: number | null;
    material_type?: number | null;
    material_id?: number | null;
    unit_of_measure?: number | null;
    quantity_planned: number;
    coefficient?: number | null;
    currency?: number | null;
    price?: number;
    comment?: string | null;
}

interface MaterialEstimateItemsState {
    byEstimateId: Record<number, MaterialEstimateItem[]>;
    loading: boolean;
    error: string | null;
}

const initialState: MaterialEstimateItemsState = {
    byEstimateId: {},
    loading: false,
    error: null,
};

/* FETCH */

export const fetchMaterialEstimateItems = createAsyncThunk<
    MaterialEstimateItem[],
    void,
    { rejectValue: string }
>('materialEstimateItems/gets', async (_, { rejectWithValue }) => {
    try {
        const res = await apiRequest<MaterialEstimateItem[]>('/materialEstimateItems/gets', 'GET');

        return res.data;
    } catch (err: any) {
        return rejectWithValue(err.message || 'Ошибка загрузки позиций');
    }
});

/* CREATE */

export const createMaterialEstimateItem = createAsyncThunk<
    MaterialEstimateItem,
    MaterialEstimateItemFormData,
    { rejectValue: string }
>('materialEstimateItems/create', async (data, { rejectWithValue }) => {
    try {
        const res = await apiRequest<MaterialEstimateItem>(
            '/materialEstimateItems/create',
            'POST',
            data,
        );

        return res.data;
    } catch (err: any) {
        return rejectWithValue(err.message || 'Ошибка создания позиции');
    }
});

/* UPDATE */

export const updateMaterialEstimateItem = createAsyncThunk<
    MaterialEstimateItem,
    { id: number; data: MaterialEstimateItemFormData },
    { rejectValue: string }
>('materialEstimateItems/update', async ({ id, data }, { rejectWithValue }) => {
    try {
        const res = await apiRequest<MaterialEstimateItem>(
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

export const deleteMaterialEstimateItem = createAsyncThunk<number, number, { rejectValue: string }>(
    'materialEstimateItems/delete',
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

const materialEstimateItemsSlice = createSlice({
    name: 'materialEstimateItems',
    initialState,
    reducers: {
        clearItemsByEstimate: (state, action) => {
            delete state.byEstimateId[action.payload];
        },
    },
    extraReducers: (builder) => {
        builder

            /* FETCH */

            .addCase(fetchMaterialEstimateItems.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(fetchMaterialEstimateItems.fulfilled, (state, action) => {
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

            .addCase(fetchMaterialEstimateItems.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Ошибка загрузки';
            })

            /* CREATE */

            .addCase(createMaterialEstimateItem.fulfilled, (state, action) => {
                const estimateId = action.payload.material_estimate_id;

                if (!state.byEstimateId[estimateId]) {
                    state.byEstimateId[estimateId] = [];
                }

                state.byEstimateId[estimateId].push(action.payload);
            })

            /* UPDATE */

            .addCase(updateMaterialEstimateItem.fulfilled, (state, action) => {
                const estimateId = action.payload.material_estimate_id;
                const items = state.byEstimateId[estimateId];

                if (!items) return;

                const index = items.findIndex((i) => i.id === action.payload.id);

                if (index !== -1) {
                    items[index] = action.payload;
                }
            })

            /* DELETE (мгновенное обновление UI) */

            .addCase(deleteMaterialEstimateItem.fulfilled, (state, action) => {
                const id = action.payload;

                Object.keys(state.byEstimateId).forEach((estimateId) => {
                    state.byEstimateId[+estimateId] = state.byEstimateId[+estimateId].filter(
                        (item) => item.id !== id,
                    );
                });
            });
    },
});

export const { clearItemsByEstimate } = materialEstimateItemsSlice.actions;

export default materialEstimateItemsSlice.reducer;
