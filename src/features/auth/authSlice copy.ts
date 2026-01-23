import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Users } from '../users/userSlice';

const API_URL = import.meta.env.VITE_BASE_URL;

/* TYPES */
export interface AuthCredentials {
    username: string;
    password: string;
}

interface AuthResponse {
    success: boolean;
    data: Users;
    token: string;
    message?: string;
}

interface ProfileResponse {
    success: boolean;
    data: Users;
    message?: string;
}

interface AuthState {
    user: Users | null;
    token: string | null; // текущий токен
    loading: boolean;
    error: string | null;
    resetRequired: boolean; // нужно ли открыть модалку смены пароля
}

/* INITIAL STATE */
const initialState: AuthState = {
    user: null,
    token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
    loading: false,
    error: null,
    resetRequired: false,
};

/* THUNKS */
export const authUser = createAsyncThunk<AuthResponse, AuthCredentials, { rejectValue: string }>(
    'auth/authUser',
    async ({ username, password }, { rejectWithValue }) => {
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const response: AuthResponse = await res.json().catch(() => null);
            if (!res.ok || !response?.success) {
                return rejectWithValue(response?.message || `Ошибка HTTP ${res.status}`);
            }

            // Сохраняем токен только если не требуется смена пароля
            if (response.data.required_action !== 'RESET_PASSWORD') {
                localStorage.setItem('token', response.token);
            }

            return response;
        } catch (err: any) {
            return rejectWithValue(err.message || 'Неизвестная ошибка сети');
        }
    }
);

export const fetchProfile = createAsyncThunk<ProfileResponse, void, { rejectValue: string }>(
    'auth/fetchProfile',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return rejectWithValue('Токен отсутствует');

            const res = await fetch(`${API_URL}/auth/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data: ProfileResponse = await res.json().catch(() => null);
            if (!res.ok || !data?.success) {
                localStorage.removeItem('token');
                return rejectWithValue(data?.message || 'Ошибка загрузки профиля');
            }

            return data;
        } catch {
            return rejectWithValue('Сетевая ошибка');
        }
    }
);

export const changeOwnPassword = createAsyncThunk<
    { message: string },
    { oldPassword: string; newPassword: string },
    { state: { auth: AuthState }; rejectValue: string }
>(
    'auth/changeOwnPassword',
    async ({ oldPassword, newPassword }, { getState, rejectWithValue, dispatch }) => {
        try {
            const token = getState().auth.token;
            if (!token) return rejectWithValue('Токен отсутствует');

            const res = await fetch(`${API_URL}/users/changeOwnPassword`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ oldPassword, newPassword }),
            });

            const data = await res.json().catch(() => null);
            if (!res.ok || !data?.success) {
                return rejectWithValue(data?.message || 'Ошибка смены пароля');
            }

            localStorage.setItem('token', token);
            await dispatch(fetchProfile());

            return { message: data.message || 'Пароль успешно изменен' };
        } catch (err: any) {
            return rejectWithValue(err.message || 'Ошибка сети');
        }
    }
);

/* SLICE */
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.error = null;
            state.resetRequired = false;
            localStorage.removeItem('token');
        },
        clearError: (state) => {
            state.error = null;
        },
        closeResetModal: (state) => {
            state.resetRequired = false;
        },
    },
    extraReducers: (builder) => {
        builder
            // AUTH USER
            .addCase(authUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(authUser.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
                state.loading = false;
                state.user = action.payload.data;

                if (action.payload.data.required_action === 'RESET_PASSWORD') {
                    state.resetRequired = true; // открываем модалку
                    state.token = action.payload.token; // временный токен
                } else {
                    state.resetRequired = false;
                    state.token = action.payload.token;
                    localStorage.setItem('token', action.payload.token);
                }

                state.error = null;
            })
            .addCase(authUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Ошибка авторизации';
            })

            // FETCH PROFILE
            .addCase(fetchProfile.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchProfile.fulfilled, (state, action: PayloadAction<ProfileResponse>) => {
                state.loading = false;
                state.user = action.payload.data;
                state.error = null;
            })
            .addCase(fetchProfile.rejected, (state, action) => {
                state.loading = false;
                state.user = null;
                state.token = null;
                state.error = action.payload ?? 'Ошибка проверки авторизации';
            })

            // CHANGE OWN PASSWORD
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

export const { logout, clearError, closeResetModal } = authSlice.actions;
export default authSlice.reducer;
