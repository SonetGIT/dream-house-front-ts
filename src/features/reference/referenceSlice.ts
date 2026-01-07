// enumsSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ReferenceService, type EnumItem } from '../reference/referenceService';
import type { RootAppState } from '@/app/store';

interface ExtraArgs {
    config: any; // передаем конфиг справочников через extraArgument
}

export const fetchEnum = createAsyncThunk<
    EnumItem[],
    string,
    { extra: ExtraArgs; state: RootAppState }
>('enums/fetchEnum', async (enumName, { getState, extra, rejectWithValue }) => {
    const state = getState();
    const token = state.auth.token;

    if (!token) {
        // Если токена нет — прерываем запрос
        return rejectWithValue('Токен отсутствует');
    }

    const API_URL = import.meta.env.VITE_BASE_URL;
    const service = new ReferenceService(API_URL, token, extra.config);

    // Если данные уже есть — возвращаем их
    if (state.reference.data[enumName]) return state.reference.data[enumName];

    try {
        const items = await service.getEnum(enumName);
        // console.log('items', items);
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
    name: 'enums',
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
                state.data[action.meta.arg] = action.payload;
            })
            .addCase(fetchEnum.rejected, (state, action) => {
                state.loading[action.meta.arg] = false;
                state.error[action.meta.arg] = action.payload as string;
            });
    },
});

export default enumsSlice.reducer;
