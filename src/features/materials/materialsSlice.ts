import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest, type ApiResponse } from '@/utils/apiRequest';
import type { Pagination } from '../users/userSlice';

/* TYPES */
export interface Material {
    id: number;
    name: string;
    type: number;
    unit_of_measure: number;
    coefficient: string | null;
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
    search?: string;
    unit_of_measure?: number;
}

interface MaterialsState {
    data: Material[];
    pagination: Pagination | null;
    loading: boolean;
    error: string | null;
}

const initialState: MaterialsState = {
    data: [],
    pagination: null,
    loading: false,
    error: null,
};

/* FETCH (with search + pagination) */
export const fetchMaterials = createAsyncThunk<
    ApiResponse<Material[]>,
    FetchMaterialsParams,
    { rejectValue: string }
>('materials/search', async (params, { rejectWithValue }) => {
    try {
        return await apiRequest<Material[]>('/materials/search', 'POST', params);
    } catch (error: any) {
        return rejectWithValue(error.message || 'Ошибка загрузки материалов');
    }
});

/* CREATE */
export const createMaterial = createAsyncThunk<Material, MaterialFormData, { rejectValue: string }>(
    'materials/create',
    async (data, { rejectWithValue }) => {
        try {
            const res = await apiRequest<Material>('/materials/create', 'POST', {
                ...data,
                type: Number(data.type),
                unit_of_measure: Number(data.unit_of_measure),
            });

            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.message || 'Ошибка создания материала');
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
        const res = await apiRequest<Material>(`/materials/update/${id}`, 'PUT', {
            ...data,
            type: Number(data.type),
            unit_of_measure: Number(data.unit_of_measure),
        });

        return res.data;
    } catch (err: any) {
        return rejectWithValue(err.message || 'Ошибка обновления материала');
    }
});

/* DELETE */
export const deleteMaterial = createAsyncThunk<number, number, { rejectValue: string }>(
    'materials/delete',
    async (id, { rejectWithValue }) => {
        try {
            await apiRequest(`/materials/delete/${id}`, 'DELETE');
            return id;
        } catch (err: any) {
            return rejectWithValue(err.message || 'Ошибка удаления материала');
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

            /* ===== FETCH ===== */
            .addCase(fetchMaterials.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMaterials.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.data;
                state.pagination = action.payload.pagination ?? null;
            })
            .addCase(fetchMaterials.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Ошибка загрузки';
            })

            /* ===== CREATE ===== */
            .addCase(createMaterial.fulfilled, (state, action) => {
                state.data.unshift(action.payload);
            })

            /* ===== UPDATE ===== */
            .addCase(updateMaterial.fulfilled, (state, action) => {
                const index = state.data.findIndex((m) => m.id === action.payload.id);
                if (index !== -1) {
                    state.data[index] = action.payload;
                }
            })

            /* ===== DELETE ===== */
            .addCase(deleteMaterial.fulfilled, (state, action) => {
                state.data = state.data.filter((m) => m.id !== action.payload);
            });
    },
});

export default materialsSlice.reducer;
