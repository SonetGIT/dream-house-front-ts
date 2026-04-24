import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { apiRequest } from '@/utils/apiRequest';
import type { Pagination } from '@/features/users/userSlice';

const REPORT_DEFINITIONS_ENDPOINT = '/reportDefinitions';

export interface ReportDefinitionFormatFlags {
    pdf: boolean;
    docx: boolean;
    xlsx: boolean;
}

export interface ReportDefinitionField {
    name: string;
    type: string;
    label?: string;
    required?: boolean;
    options_api?: string;
    value_from?: string;
}

export interface ReportDefinitionParamsSchema {
    fields: ReportDefinitionField[];
}

export interface ReportDefinition {
    id: number;
    code: string;
    name: string;
    report_url: string;
    params_schema: ReportDefinitionParamsSchema;
    formats: ReportDefinitionFormatFlags;
    sort_order: number;
    active: boolean;
}

interface ReportDefinitionsState {
    data: ReportDefinition[];
    current: ReportDefinition | null;
    pagination: Pagination | null;
    loading: boolean;
    error: string | null;
}

const initialState: ReportDefinitionsState = {
    data: [],
    current: null,
    pagination: null,
    loading: false,
    error: null,
};

const normalizeList = (value: unknown): ReportDefinition[] => {
    const data = value as any;

    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.rows)) return data.rows;
    if (data?.id) return [data];

    return [];
};

export const fetchReportDefinitions = createAsyncThunk<
    { data: ReportDefinition[]; pagination: Pagination | null },
    void,
    { rejectValue: string }
>('reportDefinitions/fetchAll', async (_, { rejectWithValue }) => {
    try {
        const res = await apiRequest<ReportDefinition[]>(
            `${REPORT_DEFINITIONS_ENDPOINT}/gets`,
            'GET',
        );

        const data = normalizeList(res.data).sort((a, b) => a.sort_order - b.sort_order);

        return {
            data,
            pagination: res.pagination ?? null,
        };
    } catch (err: any) {
        return rejectWithValue(err.message || 'Ошибка загрузки списка отчетов');
    }
});

const reportDefinitionsSlice = createSlice({
    name: 'reportDefinitions',
    initialState,
    reducers: {
        setCurrentReportDefinition: (state, action: PayloadAction<ReportDefinition | null>) => {
            state.current = action.payload;
        },
        clearCurrentReportDefinition: (state) => {
            state.current = null;
        },
        clearReportDefinitions: (state) => {
            state.data = [];
            state.current = null;
            state.pagination = null;
            state.loading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchReportDefinitions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchReportDefinitions.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchReportDefinitions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Ошибка загрузки списка отчетов';
            });
    },
});

export const { setCurrentReportDefinition, clearCurrentReportDefinition, clearReportDefinitions } =
    reportDefinitionsSlice.actions;

export default reportDefinitionsSlice.reducer;
