import type { ReportDefinition, ReportDefinitionField } from './reportDefinitionsSlice';

export type ReportFormat = 'html' | 'pdf' | 'docx' | 'xlsx';

export interface ReportFormValues {
    [key: string]: string | number | null | undefined;
}

export interface BuildReportParamsOptions {
    definition: ReportDefinition;
    values: ReportFormValues;
    contextValues?: Record<string, string | number | null | undefined>;
}

const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');

    return `${year}-${month}-${day}`;
};

// month=2026-04 -> dateFrom=2026-03-31, dateTo=2026-04-29
export const getReportMonthRange = (monthValue: string) => {
    const [yearRaw, monthRaw] = monthValue.split('-');
    const year = Number(yearRaw);
    const month = Number(monthRaw);

    if (!year || !month) {
        return {
            dateFrom: '',
            dateTo: '',
        };
    }

    const lastDayPrevMonth = new Date(year, month - 1, 0);
    const dayBeforeLastDayOfMonth = new Date(year, month, -1);

    return {
        dateFrom: formatDate(lastDayPrevMonth),
        dateTo: formatDate(dayBeforeLastDayOfMonth),
    };
};

const resolveFieldValue = (
    field: ReportDefinitionField,
    values: ReportFormValues,
    contextValues?: Record<string, string | number | null | undefined>,
) => {
    const directValue = values[field.name];

    if (directValue !== undefined && directValue !== null && directValue !== '') {
        return directValue;
    }

    if (field.value_from && contextValues?.[field.value_from] !== undefined) {
        return contextValues[field.value_from];
    }

    return undefined;
};

export const buildReportParams = ({
    definition,
    values,
    contextValues,
}: BuildReportParamsOptions) => {
    const params = new URLSearchParams();

    for (const field of definition.params_schema?.fields ?? []) {
        const value = resolveFieldValue(field, values, contextValues);

        if (field.name === 'month' && ['form2', 'form29'].includes(definition.code)) {
            if (typeof value === 'string' && value) {
                const { dateFrom, dateTo } = getReportMonthRange(value);

                if (dateFrom) params.set('dateFrom', dateFrom);
                if (dateTo) params.set('dateTo', dateTo);
            }

            continue;
        }

        if (value !== undefined && value !== null && value !== '') {
            params.set(field.name, String(value));
        }
    }

    return params;
};

export const buildReportUrl = (
    definition: ReportDefinition,
    format: ReportFormat,
    values: ReportFormValues,
    contextValues?: Record<string, string | number | null | undefined>,
    baseUrl = '',
) => {
    const params = buildReportParams({
        definition,
        values,
        contextValues,
    });

    params.set('format', format);

    const normalizedBaseUrl = (baseUrl || window.location.origin).replace(/\/+$/, '');
    const url = new URL(definition.report_url, `${normalizedBaseUrl}/`);

    url.search = params.toString();

    return url.toString();
};

export const validateReportParams = (
    definition: ReportDefinition | null,
    values: ReportFormValues,
    contextValues?: Record<string, string | number | null | undefined>,
) => {
    if (!definition) {
        return {
            valid: false,
            errors: {
                report: 'Выберите отчет',
            },
        };
    }

    const errors: Record<string, string> = {};

    for (const field of definition.params_schema?.fields ?? []) {
        const value = resolveFieldValue(field, values, contextValues);

        if (field.required && (value === undefined || value === null || value === '')) {
            errors[field.name] = `Поле "${field.label || field.name}" обязательно`;
        }
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors,
    };
};
