import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiRequest } from '@/utils/apiRequest';
import type { Pagination } from '../users/userSlice';

/* ================= TYPES ================= */

export type AuditEntityType = 'document' | 'project' | 'user' | 'material' | string;

export interface AuditLogItem {
    id: number;
    entity_type: AuditEntityType;
    entity_id: number;
    action: string;
    old_values: Record<string, any> | null;
    new_values: Record<string, any> | null;
    user_id: number;
    comment: string | null;
    created_at: string;
}

export interface AuditLogResponse {
    success: boolean;
    data: AuditLogItem[];
    pagination: Pagination;
}

export interface FetchAuditLogParams {
    entity_type: AuditEntityType;
    entity_id: number;
    action?: string;
    page?: number;
    size?: number;
}

interface AuditLogState {
    data: AuditLogItem[];
    pagination: Pagination | null;
    loading: boolean;
    error: string | null;
}

/* ================= STATE ================= */

const initialState: AuditLogState = {
    data: [],
    pagination: null,
    loading: false,
    error: null,
};

/* ================= THUNK ================= */

export const fetchAuditLog = createAsyncThunk<
    AuditLogResponse,
    FetchAuditLogParams,
    { rejectValue: string }
>(
    'auditLog/fetch',
    async (
        params: {
            entity_type: string;
            entity_id: number;
            action?: string;
            page?: number;
            size?: number;
        },
        { rejectWithValue },
    ) => {
        try {
            const body = {
                ntity_type: params.entity_type,
                entity_id: params.entity_id,
                action: params.action,
                page: params.page ?? 1,
                size: params.size ?? 10,
            };
            const res = await apiRequest<AuditLogResponse>('/auditLog', 'GET', body);

            if (!res.success) {
                return rejectWithValue(res.message || 'Ошибка запроса');
            }
            console.log('res.data', res.data);
            return res.data;
        } catch (e: any) {
            return rejectWithValue(e?.message || 'Ошибка загрузки истории изменений');
        }
    },
);

/* ================= SLICE ================= */

const auditLogSlice = createSlice({
    name: 'auditLog',
    initialState,
    reducers: {
        clearAuditLog: (state) => {
            state.data = [];
            state.pagination = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAuditLog.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAuditLog.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchAuditLog.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Ошибка загрузки';
            });
    },
});

export const { clearAuditLog } = auditLogSlice.actions;
export default auditLogSlice.reducer;
