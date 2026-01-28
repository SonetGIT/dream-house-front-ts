import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Users } from '../users/userSlice';
import { apiRequest } from '@/utils/apiRequest';

const API_URL = import.meta.env.VITE_BASE_URL;

/* ===================== TYPES ===================== */
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
    token: string | null;
    loading: boolean;
    error: string | null;
    resetRequired: boolean;
}

/* ===================== INITIAL STATE ===================== */
const initialState: AuthState = {
    user: null,
    token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
    loading: false,
    error: null,
    resetRequired: false,
};

/* ===================== THUNKS ===================== */

/**
 * LOGIN
 * ❗ НЕЛЬЗЯ через apiRequest (токена ещё нет)
 */
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

            // Сохраняем токен только если НЕ нужен reset пароля
            if (data.data.required_action !== 'RESET_PASSWORD') {
                localStorage.setItem('token', data.token);
            }

            return data;
        } catch (err: any) {
            return rejectWithValue(err.message || 'Ошибка сети');
        }
    }
);

/**
 * PROFILE
 * ✅ apiRequest (Bearer автоматически)
 */
export const fetchProfile = createAsyncThunk<ProfileResponse, void, { rejectValue: string }>(
    'auth/fetchProfile',
    async (_, { rejectWithValue }) => {
        try {
            const res = await apiRequest<Users>('/auth/profile', 'GET');

            return {
                success: true,
                data: res.data,
            };
        } catch (err: any) {
            localStorage.removeItem('token');
            return rejectWithValue(err.message || 'Ошибка загрузки профиля');
        }
    }
);

/**
 * CHANGE OWN PASSWORD
 * ✅ apiRequest
 */
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

/* ===================== SLICE ===================== */
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
            /* ===== LOGIN ===== */
            .addCase(authUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(authUser.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
                state.loading = false;
                state.user = action.payload.data;

                if (action.payload.data.required_action === 'RESET_PASSWORD') {
                    state.resetRequired = true;
                    state.token = action.payload.token;
                } else {
                    state.resetRequired = false;
                    state.token = action.payload.token;
                    localStorage.setItem('token', action.payload.token);
                }
            })
            .addCase(authUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Ошибка авторизации';
            })

            /* ===== PROFILE ===== */
            .addCase(fetchProfile.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.data;
            })
            .addCase(fetchProfile.rejected, (state, action) => {
                state.loading = false;
                state.user = null;
                state.token = null;
                state.error = action.payload ?? 'Ошибка авторизации';
            })

            /* ===== CHANGE PASSWORD ===== */
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
