// enumsSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ReferenceService, type EnumItem } from '../reference/referenceService';
import type { RootAppState } from '@/app/store';
import type { useReference } from './useReference';
import { getToken } from '../auth/getToken';
export type ReferenceResult = ReturnType<typeof useReference>;
interface ExtraArgs {
    config: any; // передаем конфиг справочников через extraArgument
}

export const fetchEnum = createAsyncThunk<
    EnumItem[],
    string,
    { extra: ExtraArgs; state: RootAppState }
>('reference/fetchEnum', async (enumName, { extra, rejectWithValue }) => {
    const token = getToken();

    // 🔥 ВОТ ЗДЕСЬ — ПРАВИЛЬНОЕ МЕСТО
    if (!token) {
        return rejectWithValue(null); // ⬅️ НЕ ошибка, просто нет токена
    }

    const API_URL = import.meta.env.VITE_BASE_URL;
    const service = new ReferenceService(API_URL, token, extra.config);

    try {
        const items = await service.getEnum(enumName);
        return items;
    } catch (err: any) {
        return rejectWithValue(err.message || 'Ошибка при загрузке справочника');
    }
});

interface EnumsState {
    data: Record<string, EnumItem[] | undefined>;
    loading: Record<string, boolean>;
    error: Record<string, string | null>;
}

const initialState: EnumsState = {
    data: {},
    loading: {},
    error: {},
};

const enumsSlice = createSlice({
    name: 'reference',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchEnum.pending, (state, action) => {
                state.loading[action.meta.arg] = true;
                state.error[action.meta.arg] = null;
            })
            .addCase(fetchEnum.fulfilled, (state, action) => {
                state.loading[action.meta.arg] = false;
                state.data[action.meta.arg] = action.payload; // 🔥 ОБЯЗАТЕЛЬНО
            })

            .addCase(fetchEnum.rejected, (state, action) => {
                state.loading[action.meta.arg] = false;
                if (action.payload) {
                    state.error[action.meta.arg] = action.payload as string;
                }
            });
    },
});

export default enumsSlice.reducer;
