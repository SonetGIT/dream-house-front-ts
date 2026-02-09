import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '@/utils/apiRequest';

// TYPES
export interface Users {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    middle_name: string;
    phone: string;
    role_id: number;
    password?: string;
    required_action?: string;
}

export interface UserRole {
    id: number;
    name: string;
    description?: string;
}

export interface Pagination {
    page: number;
    size: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface UsersState {
    items: Users[];
    pagination: Pagination | null;
    search: string;
    filters: Record<string, any>;
    loading: boolean;
    error: string | null;

    currentUser: Users | null;
    roles: UserRole[];
    rolesLoading: boolean;
    rolesLoaded: boolean;
    rolesError: string | null;
}

// Initial
const initialState: UsersState = {
    items: [],
    pagination: null,
    search: '',
    filters: {},
    loading: false,
    error: null,

    currentUser: null,
    roles: [],
    rolesLoading: false,
    rolesLoaded: false,
    rolesError: null,
};

/* THUNKS ********************************************************************/

export const getUserRoles = createAsyncThunk<UserRole[], void, { rejectValue: string }>(
    'users/getUserRoles',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiRequest<UserRole[]>(`/userRoles/gets`, 'GET');
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    },
);

export const fetchUsers = createAsyncThunk(
    'users/fetch',
    async (
        params: { page?: number; size?: number; search?: string; filters?: any },
        { rejectWithValue },
    ) => {
        try {
            const body = {
                page: params.page ?? 1,
                size: params.size ?? 10,
                search: params.search ?? '',
                ...(params.filters || {}),
            };
            const data = await apiRequest<Users[]>(`/users/search`, 'POST', body);
            return data;
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    },
);

export const createUser = createAsyncThunk<Users, Partial<Users>, { rejectValue: string }>(
    'users/create',
    async (user, { rejectWithValue }) => {
        try {
            const response = await apiRequest<Users>(`/users/createUser`, 'POST', user);
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    },
);

export const deleteUser = createAsyncThunk(
    'users/delete',
    async (id: number, { rejectWithValue }) => {
        try {
            await apiRequest<Users>(`/users/delete/${id}`, 'DELETE');
            return id;
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    },
);

export const getUserById = createAsyncThunk(
    'users/getById',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await apiRequest<Users>(`/users/getById/${id}`, 'GET');
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    },
);

export const updateUser = createAsyncThunk(
    'users/update',
    async (payload: { id: number; data: Partial<Users> }, { rejectWithValue }) => {
        try {
            const send = { ...payload.data };
            if (!send.password) delete send.password;
            const response = await apiRequest<Users>(`/users/update/${payload.id}`, 'PUT', send);
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    },
);

export const resetPassword = createAsyncThunk(
    'users/resetPassword',
    async ({ id, password }: { id: number; password: string }, { rejectWithValue }) => {
        try {
            const data = await apiRequest<Users>(`/users/resetPassword/${id}`, 'PUT', {
                password,
            });
            return { message: data.message || 'Пароль обновлён' };
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    },
);

/* SLICE ********************************************************************/

const usersSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        setSearch: (state, action) => {
            state.search = action.payload;
        },
        setFilters: (state, action) => {
            state.filters = action.payload;
        },
        clearFilters: (state) => {
            state.filters = {};
            state.search = '';
        },
    },
    extraReducers: (builder) => {
        builder
            // GET USER ROLES
            .addCase(getUserRoles.pending, (state) => {
                state.rolesLoading = true;
                state.rolesError = null;
            })
            .addCase(getUserRoles.fulfilled, (state, action) => {
                state.rolesLoading = false;
                state.roles = action.payload;
                state.rolesLoaded = true;
            })
            .addCase(getUserRoles.rejected, (state, action) => {
                state.rolesLoading = false;
                state.rolesError = action.payload as string;
            })

            // FETCH USERS
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

            // CREATE USER
            .addCase(createUser.fulfilled, (state, action) => {
                state.items.unshift(action.payload);
            })
            .addCase(createUser.rejected, (state, action) => {
                state.error = action.payload as string;
            })

            // DELETE USER
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.items = state.items.filter((u) => u.id !== action.payload);
            })

            // UPDATE USER
            .addCase(updateUser.fulfilled, (state, action) => {
                state.items = state.items.map((u) =>
                    u.id === action.payload.id ? action.payload : u,
                );
            })

            // GET USER BY ID
            .addCase(getUserById.fulfilled, (state, action) => {
                state.currentUser = action.payload;
            })

            // RESET PASSWORD
            .addCase(resetPassword.rejected, (state, action) => {
                state.error = action.payload as string;
            });
    },
});

export const { setSearch, setFilters, clearFilters } = usersSlice.actions;
export default usersSlice.reducer;
