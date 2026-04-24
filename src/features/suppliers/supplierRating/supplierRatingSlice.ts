import { apiRequest } from '@/utils/apiRequest';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export interface SupplierRatingPayload {
    supplier_id: number;
    quality: number;
    time: number;
    price: number;
    comment: string;
}

interface SupplierRatingsState {
    creating: boolean;
    error: string | null;
}

export type SupplierRatingFormData = {
    supplier_id: number;
    quality: number;
    time: number;
    price: number;
    comment: string;
};

const initialState: SupplierRatingsState = {
    creating: false,
    error: null,
};

/* CREATE */
export const createSupplierRating = createAsyncThunk(
    'supplierRating/create',
    async (payload: SupplierRatingPayload) => {
        const res = await apiRequest('/supplierRating/create', 'POST', payload);
        return res.data;
    },
);

const supplierRatingSlice = createSlice({
    name: 'supplierRating',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createSupplierRating.pending, (state) => {
                state.creating = true;
                state.error = null;
            })
            .addCase(createSupplierRating.fulfilled, (state) => {
                state.creating = false;
            })
            .addCase(createSupplierRating.rejected, (state, action) => {
                state.creating = false;
                state.error = action.error.message || 'Ошибка';
            });
    },
});

export default supplierRatingSlice.reducer;
