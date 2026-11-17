import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest, type ApiResponse } from '@/utils/apiRequest';
import { materialPayload } from './materialPayload';
import type { Pagination } from '../users/userSlice';

/* TYPES */
export interface Material {
    id: number;
    name: string;
    type: number;
    unit_of_measure: number;
    coefficient: string | null;
    coeffitient?: number | string | null;
    description: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface MaterialFormData {
    name: string;
    type: number | '';
    unit_of_measure: number | '';
    coefficient: string;
    description: string;
}

interface FetchMaterialsParams {
    page: number;
    size: number;
    name?: string;
    description?: string;
    type?: number;
    unit_of_measure?: number;
}

interface MaterialsState {
    data: Material[];
    pagination: Pagination | null;
    loading: boolean;
    error: string | null;
    requestId: string | null;
}

const initialState: MaterialsState = {
    data: [],
    pagination: null,
    loading: false,
    error: null,
    requestId: null,
};

/* FETCH (with search + pagination) */
export const fetchMaterials = createAsyncThunk<
    ApiResponse<Material[]>,
    FetchMaterialsParams,
    { rejectValue: string }
>('materials/search', async (params, { rejectWithValue }) => {
    try {
        return await apiRequest<Material[]>('/materials/search', 'POST', params);
    } catch (error: unknown) {
        return rejectWithValue(error instanceof Error ? error.message : 'Ошибка загрузки материалов');
    }
});

/* CREATE */
export const createMaterial = createAsyncThunk<Material, MaterialFormData, { rejectValue: string }>(
    'materials/create',
    async (data, { rejectWithValue }) => {
        try {
            const res = await apiRequest<Material>('/materials/create', 'POST', materialPayload(data, true));

            return res.data;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : 'Ошибка создания материала');
        }
    },
);

/* UPDATE */
export const updateMaterial = createAsyncThunk<
    Material,
    { id: number; data: MaterialFormData },
    { rejectValue: string }
>('materials/update', async ({ id, data }, { rejectWithValue }) => {
    try {
        const res = await apiRequest<Material>(`/materials/update/${id}`, 'PUT', materialPayload(data, false));

        return res.data;
    } catch (err: unknown) {
        return rejectWithValue(err instanceof Error ? err.message : 'Ошибка обновления материала');
    }
});

/* DELETE */
export const deleteMaterial = createAsyncThunk<number, number, { rejectValue: string }>(
    'materials/delete',
    async (id, { rejectWithValue }) => {
        try {
            await apiRequest(`/materials/delete/${id}`, 'DELETE');
            return id;
        } catch (err: unknown) {
            return rejectWithValue(err instanceof Error ? err.message : 'Ошибка удаления материала');
        }
    },
);

/* SLICE */
const materialsSlice = createSlice({
    name: 'materials',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder

            /* FETCH */
            .addCase(fetchMaterials.pending, (state, action) => {
                state.requestId = action.meta.requestId;
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMaterials.fulfilled, (state, action) => {
                if (state.requestId !== action.meta.requestId) return;
                state.loading = false;
                state.data = action.payload.data.map((material) => ({
                    ...material,
                    coefficient: material.coefficient ?? (material.coeffitient == null ? null : String(material.coeffitient)),
                }));
                state.pagination = action.payload.pagination ?? null;
            })
            .addCase(fetchMaterials.rejected, (state, action) => {
                if (state.requestId !== action.meta.requestId) return;
                state.loading = false;
                state.error = action.payload ?? 'Ошибка загрузки';
            })

            /* CREATE */
            .addCase(createMaterial.fulfilled, (state, action) => {
                state.data.unshift(action.payload);
            })

            /* UPDATE */
            .addCase(updateMaterial.fulfilled, (state, action) => {
                const index = state.data.findIndex((m) => m.id === action.payload.id);
                if (index !== -1) {
                    state.data[index] = action.payload;
                }
            })

            /* DELETE */
            .addCase(deleteMaterial.fulfilled, (state, action) => {
                state.data = state.data.filter((m) => m.id !== action.payload);
            });
    },
});

export default materialsSlice.reducer;
