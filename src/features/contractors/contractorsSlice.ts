import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Pagination } from '@/features/users/userSlice';
import { apiRequest } from '@/utils/apiRequest';

export interface Contractor {
    id: number;

    name: string;
    inn: string;
    kpp: string | null;
    ogrn: string | null;

    address: string;
    phone: string | null;
    email: string | null;
    contact_person: string | null;

    created_at: string;
    updated_at: string;

    deleted: boolean;
}

export interface ContractorForm {
    name: string;
    inn: string;
    kpp: string | null;
    ogrn: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
    contact_person: string | null;
}

interface ContractorsState {
    items: Contractor[];
    pagination: Pagination | null;
    loading: boolean;
    error: string | null;
    currentContractor: Contractor | null;
}

const initialState: ContractorsState = {
    items: [],
    pagination: null,
    loading: false,
    error: null,
    currentContractor: null,
};

interface SearchPayload {
    search?: string;
    page?: number;
    size?: number;
}
export type ContractorFormData = Omit<Contractor, 'id' | 'created_at' | 'updated_at' | 'deleted'>;

export const fetchContractors = createAsyncThunk(
    'contractors/search',
    async (params: SearchPayload = {}, { rejectWithValue }) => {
        try {
            const res = await apiRequest<Contractor[]>('/contractors/search', 'POST', params);
            return res;
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    },
);

export const createContractor = createAsyncThunk(
    'contractors/create',
    async (data: Partial<Contractor>, { rejectWithValue }) => {
        try {
            const res = await apiRequest<Contractor>('/contractors/create', 'POST', data);

            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    },
);

export const updateContractor = createAsyncThunk(
    'contractors/update',
    async ({ id, data }: { id: number; data: Partial<Contractor> }, { rejectWithValue }) => {
        try {
            const res = await apiRequest<Contractor>(`/contractors/update/${id}`, 'PUT', data);

            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    },
);

export const deleteContractor = createAsyncThunk(
    'contractors/delete',
    async (id: number, { rejectWithValue }) => {
        try {
            await apiRequest(`/contractors/delete/${id}`, 'DELETE');
            return id;
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    },
);

export const getContractorById = createAsyncThunk(
    'contractors/getById',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await apiRequest<Contractor>(`/contractors/getById/${id}`, 'GET');
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    },
);
const contractorsSlice = createSlice({
    name: 'contractors',
    initialState,
    reducers: {},

    extraReducers: (builder) => {
        builder

            // fetch
            .addCase(fetchContractors.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(fetchContractors.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.data;
                state.pagination = action.payload.pagination ?? null;
            })

            .addCase(fetchContractors.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // create
            .addCase(createContractor.fulfilled, (state, action) => {
                state.items.unshift(action.payload);
            })

            // update
            .addCase(updateContractor.fulfilled, (state, action) => {
                const index = state.items.findIndex((p) => p.id === action.payload.id);

                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })

            // delete
            .addCase(deleteContractor.fulfilled, (state, action) => {
                state.items = state.items.filter((p) => p.id !== action.payload);
            })
            .addCase(getContractorById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getContractorById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentContractor = action.payload;
            })
            .addCase(getContractorById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default contractorsSlice.reducer;
