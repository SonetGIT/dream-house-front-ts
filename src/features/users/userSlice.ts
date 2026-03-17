import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '@/utils/apiRequest';

export interface Pagination {
    page: number;
    size: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface User {
    id: number;

    username: string;
    email: string;

    first_name: string;
    last_name: string;
    middle_name: string | null;

    phone: string | null;

    role_id: number;
    supplier_id: number | null;
    contractor_id: number | null;

    required_action: string | null;

    created_at: string;
    updated_at: string;

    deleted: boolean;
}

export interface UserForm {
    username: string;
    email: string;

    first_name: string;
    last_name: string;
    middle_name: string | null;

    phone: string | null;

    role_id: number;
    supplier_id: number | null;
    contractor_id: number | null;

    required_action?: string | null;
}
export type UserFormData = Omit<User, 'id' | 'created_at' | 'updated_at' | 'deleted'>;
interface UsersState {
    items: User[];
    pagination: Pagination | null;
    loading: boolean;
    error: string | null;
    currentUser: User | null;
}

const initialState: UsersState = {
    items: [],
    pagination: null,
    loading: false,
    error: null,
    currentUser: null,
};

interface SearchPayload {
    search?: string;
    page?: number;
    size?: number;
}

//SEARCH
export const fetchUsers = createAsyncThunk(
    'users/search',
    async (params: SearchPayload = {}, { rejectWithValue }) => {
        try {
            const res = await apiRequest<User[]>('/users/search', 'POST', params);
            return res;
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    },
);

//CREATE
export const createUser = createAsyncThunk(
    'users/create',
    async (data: Partial<User>, { rejectWithValue }) => {
        try {
            const res = await apiRequest<User>('/users/create', 'POST', data);
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    },
);

//UPDATE
export const updateUser = createAsyncThunk(
    'users/update',
    async ({ id, data }: { id: number; data: Partial<User> }, { rejectWithValue }) => {
        try {
            const res = await apiRequest<User>(`/users/update/${id}`, 'PUT', data);
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    },
);

//DELETE
export const deleteUser = createAsyncThunk(
    'users/delete',
    async (id: number, { rejectWithValue }) => {
        try {
            await apiRequest(`/users/delete/${id}`, 'DELETE');
            return id;
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    },
);

//GET BY ID
export const getUserById = createAsyncThunk(
    'users/getById',
    async (id: number, { rejectWithValue }) => {
        try {
            const res = await apiRequest<User>(`/users/getById/${id}`, 'GET');
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    },
);

const userSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {},

    extraReducers: (builder) => {
        builder
            // FETCH
            .addCase(fetchUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.data;
                state.pagination = action.payload.pagination ?? null;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // CREATE
            .addCase(createUser.fulfilled, (state, action) => {
                state.items.unshift(action.payload);
            })

            // UPDATE
            .addCase(updateUser.fulfilled, (state, action) => {
                const index = state.items.findIndex((u) => u.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })

            // DELETE
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.items = state.items.filter((u) => u.id !== action.payload);
            })

            // GET BY ID
            .addCase(getUserById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getUserById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentUser = action.payload;
            })
            .addCase(getUserById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default userSlice.reducer;
