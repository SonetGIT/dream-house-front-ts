import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { apiRequest, type ApiResponse } from '@/utils/apiRequest';
import type { Pagination } from '@/features/users/userSlice';

/* TYPES */
export interface Suppliers {
    id: number;
    name: string;
    inn: string;
    kpp: null;
    ogrn: null;
    address: string;
    phone: string;
    email: string;
    contact_person: null;
    // rating: null;
    created_at: string;
    updated_at: string;
    deleted: boolean;
}

export interface SuppliersSearchParams {
    search?: string;
    page: number;
    size: number;
}

/* STATE */
interface SuppliersState {
    data: Suppliers[];
    pagination: Pagination | null;
    search: string;
    loading: boolean;
    error: string | null;
}

const initialState: SuppliersState = {
    data: [],
    pagination: null,
    search: '',
    loading: false,
    error: null,
};

/* THUNK */
export const fetchSuppliers = createAsyncThunk<
    ApiResponse<Suppliers[]>,
    SuppliersSearchParams,
    { rejectValue: string }
>('suppliers/search', async (params, { rejectWithValue }) => {
    try {
        return await apiRequest<Suppliers[]>('/suppliers/search', 'POST', params);
    } catch (error: any) {
        return rejectWithValue(error.message || 'Ошибка загрузки движений');
    }
});

export const createSupplier = createAsyncThunk<
    Suppliers,
    Partial<Suppliers>,
    { rejectValue: string }
>('suppliers/create', async (supplier, { rejectWithValue }) => {
    try {
        const res = await apiRequest<Suppliers>('/suppliers/create', 'POST', supplier);
        return res.data;
    } catch (err: any) {
        return rejectWithValue(err.message);
    }
});

export const updateSupplier = createAsyncThunk<
    Suppliers,
    { id: number; data: Partial<Suppliers> },
    { rejectValue: string }
>('suppliers/update', async ({ id, data }, { rejectWithValue }) => {
    try {
        const res = await apiRequest<Suppliers>(`/suppliers/update/${id}`, 'PUT', data);
        return res.data;
    } catch (err: any) {
        return rejectWithValue(err.message);
    }
});

export const deleteSupplier = createAsyncThunk(
    'users/delete',
    async (id: number, { rejectWithValue }) => {
        try {
            await apiRequest<Suppliers>(`/suppliers/delete/${id}`, 'DELETE');
            return id;
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

/* SLICE */
const suppliersSlice = createSlice({
    name: 'suppliers',
    initialState,
    reducers: {
        clearSuppliers(state) {
            state.data = [];
            state.pagination = null;
            state.loading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            /* -------- FETCH -------- */
            .addCase(fetchSuppliers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(
                fetchSuppliers.fulfilled,
                (state, action: PayloadAction<ApiResponse<Suppliers[]>>) => {
                    state.loading = false;
                    state.data = action.payload.data;
                    state.pagination = action.payload.pagination ?? null;
                }
            )
            .addCase(fetchSuppliers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Ошибка при загрузке данных';
            })
            .addCase(createSupplier.fulfilled, (state, action) => {
                state.data.unshift(action.payload);
            })
            .addCase(updateSupplier.fulfilled, (state, action) => {
                const index = state.data.findIndex((s) => s.id === action.payload.id);
                if (index !== -1) state.data[index] = action.payload;
            })
            // DELETE
            .addCase(deleteSupplier.fulfilled, (state, action) => {
                state.data = state.data.filter((u) => u.id !== action.payload);
            });
    },
});

/* EXPORTS */
export const { clearSuppliers } = suppliersSlice.actions;
export default suppliersSlice.reducer;
