import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../users/userSlice';
import { apiRequest } from '@/utils/apiRequest';

import { authClient } from './authSession';

/*TYPES*/
export interface AuthCredentials {
    username: string;
    password: string;
}

interface AuthResponse {
    success: boolean;
    data: User;
    generation: string;
    message?: string;
}

interface ProfileResponse {
    generation: string;
    success: boolean;
    data: User;
    message?: string;
}

interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
    resetRequired: boolean;
    isAuthChecked: boolean;
    generation: string | null;
    profileRequestId: string | null;
    loginRequestId: string | null;
}

/*INITIAL STATE*/
const initialState: AuthState = {
    user: null,
    loading: false,
    error: null,
    resetRequired: false,
    isAuthChecked: false,
    generation: authClient.getSession()?.generation ?? null,
    profileRequestId: null,
    loginRequestId: null,
};

/*THUNKS*/

/*LOGIN*/
export const authUser = createAsyncThunk<AuthResponse, AuthCredentials, { rejectValue: string }>(
    'auth/authUser',
    async ({ username, password }, { rejectWithValue }) => {
        try {
            return await authClient.login(username, password) as unknown as AuthResponse;
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
            const generation = authClient.getSession()?.generation;
            if (!generation) throw new Error('Сессия завершена. Войдите заново.');
            const res = await apiRequest<User>('/auth/profile', 'GET');
            authClient.assertCurrent(generation);

            return {
                success: true,
                data: res.data,
                generation,
            };
        } catch (err: any) {
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
        const generation = authClient.getSession()?.generation;
        if (!generation) throw new Error('Сессия завершена. Войдите заново.');
        const res = await apiRequest<{ message?: string }>('/users/changeOwnPassword', 'PUT', {
            oldPassword,
            newPassword,
        });

        authClient.assertCurrent(generation);
        await dispatch(logout());

        return {
            message: res.message || 'Пароль успешно изменён',
        };
    } catch (err: any) {
        return rejectWithValue(err.message || 'Ошибка смены пароля');
    }
});

export const logout = createAsyncThunk('auth/endSession', async () => {
    await authClient.logout();
});

/*SLICE*/
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        syncSession: (state, action: PayloadAction<{ generation: string; userId: string } | null>) => {
            const next = action.payload;
            if (state.generation !== (next?.generation ?? null)) {
                state.user = null;
                state.profileRequestId = null;
                state.resetRequired = false;
                state.isAuthChecked = !next;
            }
            state.generation = next?.generation ?? null;
            if (!next) {
                state.user = null;
                state.loading = state.loginRequestId !== null;
                state.isAuthChecked = true;
                state.resetRequired = false;
            }
        },
        clearError: (state) => {
            state.error = null;
        },
        closeResetModal: (state) => {
            state.resetRequired = false;
        },
        setAuthChecked: (state) => {
            state.isAuthChecked = true;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(authUser.pending, (state, action) => {
                state.loginRequestId = action.meta.requestId;
                state.loading = true;
                state.error = null;
            })
            .addCase(authUser.fulfilled, (state, action) => {
                if (state.generation !== action.payload.generation || state.loginRequestId !== action.meta.requestId) return;
                state.loginRequestId = null;
                state.loading = false;
                state.user = action.payload.data;
                state.isAuthChecked = true;
                state.resetRequired = action.payload.data.required_action === 'RESET_PASSWORD';
            })
            .addCase(authUser.rejected, (state, action) => {
                if (state.loginRequestId !== action.meta.requestId) return;
                state.loginRequestId = null;
                state.loading = false;
                state.error = action.payload ?? 'Ошибка авторизации';
                state.isAuthChecked = true;
            })
            .addCase(logout.pending, (state) => {
                state.loginRequestId = null;
                state.profileRequestId = null;
                state.user = null;
                state.loading = false;
                state.resetRequired = false;
                state.isAuthChecked = true;
            })
            .addCase(fetchProfile.pending, (state, action) => {
                state.profileRequestId = action.meta.requestId;
                state.loading = true;
            })
            .addCase(fetchProfile.fulfilled, (state, action) => {
                if (state.profileRequestId !== action.meta.requestId || state.generation !== action.payload.generation) return;
                state.profileRequestId = null;
                state.loading = false;
                state.user = action.payload.data;
                state.resetRequired = action.payload.data.required_action === 'RESET_PASSWORD';
                state.isAuthChecked = true;
            })
            .addCase(fetchProfile.rejected, (state, action) => {
                if (state.profileRequestId !== action.meta.requestId) return;
                state.profileRequestId = null;
                state.loading = false;
                state.user = null;
                state.error = action.payload ?? 'Ошибка авторизации';
                state.isAuthChecked = true;
            })
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

export const { syncSession, clearError, closeResetModal, setAuthChecked } = authSlice.actions;
export default authSlice.reducer;
