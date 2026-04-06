import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../users/userSlice';
import { apiRequest } from '@/utils/apiRequest';

const API_URL = import.meta.env.VITE_BASE_URL;

/*TYPES*/
export interface AuthCredentials {
    username: string;
    password: string;
}

interface AuthResponse {
    success: boolean;
    data: User;
    token: string;
    message?: string;
}

interface ProfileResponse {
    success: boolean;
    data: User;
    message?: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    loading: boolean;
    error: string | null;
    resetRequired: boolean;
    isAuthChecked: boolean;
}

/*INITIAL STATE*/
const initialState: AuthState = {
    user: null,
    token: typeof window !== 'undefined' ? localStorage.getItem('token') : null, //typeof window !== 'undefined'есть ли объект window т.е. выполняется ли код в браузере
    loading: false,
    error: null,
    resetRequired: false,
    isAuthChecked: false,
};

/*THUNKS*/

/*LOGIN*/
export const authUser = createAsyncThunk<AuthResponse, AuthCredentials, { rejectValue: string }>(
    'auth/authUser',
    async ({ username, password }, { rejectWithValue }) => {
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data: AuthResponse = await res.json().catch(() => null);

            if (!res.ok || !data?.success) {
                return rejectWithValue(data?.message || `Ошибка HTTP ${res.status}`);
            }

            localStorage.setItem('token', data.token);

            return data;
        } catch (err: any) {
            return rejectWithValue(err.message || 'Ошибка сети');
        }
    },
);

/* PROFILE */
export const fetchProfile = createAsyncThunk<ProfileResponse, void, { rejectValue: string }>(
    'auth/fetchProfile',
    async (_, { rejectWithValue }) => {
        try {
            const res = await apiRequest<User>('/auth/profile', 'GET');

            return {
                success: true,
                data: res.data,
            };
        } catch (err: any) {
            localStorage.removeItem('token');
            return rejectWithValue(err.message || 'Ошибка загрузки профиля');
        }
    },
);

/*CHANGE OWN PASSWORD */
export const changeOwnPassword = createAsyncThunk<
    { message: string },
    { oldPassword: string; newPassword: string },
    { rejectValue: string }
>('auth/changeOwnPassword', async ({ oldPassword, newPassword }, { dispatch, rejectWithValue }) => {
    try {
        const res = await apiRequest<{ message?: string }>('/users/changeOwnPassword', 'PUT', {
            oldPassword,
            newPassword,
        });

        await dispatch(fetchProfile());

        return {
            message: res.message || 'Пароль успешно изменён',
        };
    } catch (err: any) {
        return rejectWithValue(err.message || 'Ошибка смены пароля');
    }
});

/*SLICE*/
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.error = null;
            state.resetRequired = false;
            state.isAuthChecked = true;
            localStorage.removeItem('token');
        },
        clearError: (state) => {
            state.error = null;
        },
        closeResetModal: (state) => {
            state.resetRequired = false;
        },

        //ДОБАВИЛИ
        setAuthChecked: (state) => {
            state.isAuthChecked = true;
        },
    },
    extraReducers: (builder) => {
        builder
            /*LOGIN*/
            .addCase(authUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(authUser.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
                state.loading = false;
                state.user = action.payload.data;
                state.token = action.payload.token;
                state.isAuthChecked = true;

                if (action.payload.data.required_action === 'RESET_PASSWORD') {
                    state.resetRequired = true;
                }
            })
            .addCase(authUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Ошибка авторизации';
                state.isAuthChecked = true;
            })

            /*PROFILE*/
            .addCase(fetchProfile.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.data;
                state.isAuthChecked = true;
            })
            .addCase(fetchProfile.rejected, (state, action) => {
                state.loading = false;
                state.user = null;
                state.token = null;
                state.error = action.payload ?? 'Ошибка авторизации';
                state.isAuthChecked = true;
            })

            /*CHANGE PASSWORD*/
            .addCase(changeOwnPassword.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(changeOwnPassword.fulfilled, (state) => {
                state.loading = false;
                state.resetRequired = false;
            })
            .addCase(changeOwnPassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Ошибка смены пароля';
            });
    },
});

export const { logout, clearError, closeResetModal, setAuthChecked } = authSlice.actions;
export default authSlice.reducer;
