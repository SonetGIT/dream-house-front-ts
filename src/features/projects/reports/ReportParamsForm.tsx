import type { ReferenceResult } from '@/features/reference/referenceSlice';
import type { ReportDefinition } from './reportDefinitionsSlice';

interface ReportParamsFormProps {
    definition: ReportDefinition | null;
    values: Record<string, string | number | null | undefined>;
    errors?: Record<string, string>;
    refs: Record<string, ReferenceResult>;
    contextValues?: Record<string, string | number | null | undefined>;
    onChange: (name: string, value: string | number) => void;
}

const getFieldValue = (
    fieldName: string,
    valueFrom: string | undefined,
    values: Record<string, string | number | null | undefined>,
    contextValues?: Record<string, string | number | null | undefined>,
) => {
    const directValue = values[fieldName];

    if (directValue !== undefined && directValue !== null && directValue !== '') {
        return directValue;
    }

    if (valueFrom && contextValues?.[valueFrom] !== undefined) {
        return contextValues[valueFrom];
    }

    return '';
};

export default function ReportParamsForm({
    definition,
    values,
    errors = {},
    refs,
    contextValues,
    onChange,
}: ReportParamsFormProps) {
    if (!definition) {
        return (
            <div className="p-6 text-sm text-gray-500 bg-white border rounded-lg">
                Выберите отчет
            </div>
        );
    }

    const fields = definition.params_schema?.fields ?? [];

    if (!fields.length) {
        return (
            <div className="p-6 text-sm text-gray-500 bg-white border rounded-lg">
                Для этого отчета параметры не требуются
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {fields.map((field) => {
                const label = field.label || field.name;
                const value = getFieldValue(field.name, field.value_from, values, contextValues);
                const fieldError = errors[field.name];
                const isReadOnlyFromContext = Boolean(field.value_from);

                if (field.type === 'month') {
                    return (
                        <div key={field.name}>
                            <label className="block mb-1.5 text-sm font-medium text-gray-700">
                                {label}
                                {field.required && <span className="ml-1 text-red-500">*</span>}
                            </label>

                            <input
                                type="month"
                                value={String(value)}
                                onChange={(e) => onChange(field.name, e.target.value)}
                                className={`w-full px-3 py-2 text-sm border rounded-lg ${
                                    fieldError ? 'border-red-300' : 'border-gray-300'
                                }`}
                            />

                            {fieldError && (
                                <p className="mt-1 text-xs text-red-600">{fieldError}</p>
                            )}
                        </div>
                    );
                }

                if (field.type === 'dict') {
                    const options = field.options_api ? (refs[field.options_api]?.data ?? []) : [];

                    return (
                        <div key={field.name}>
                            <label className="block mb-1.5 text-sm font-medium text-gray-700">
                                {label}
                                {field.required && <span className="ml-1 text-red-500">*</span>}
                            </label>

                            <select
                                value={String(value)}
                                onChange={(e) =>
                                    onChange(
                                        field.name,
                                        e.target.value ? Number(e.target.value) : '',
                                    )
                                }
                                disabled={isReadOnlyFromContext}
                                className={`w-full px-3 py-2 text-sm border rounded-lg ${
                                    isReadOnlyFromContext ? 'bg-gray-50 cursor-not-allowed' : ''
                                } ${fieldError ? 'border-red-300' : 'border-gray-300'}`}
                            >
                                <option value="">Выберите</option>

                                {options.map((item: any) => (
                                    <option key={item.id} value={item.id}>
                                        {item.name}
                                    </option>
                                ))}
                            </select>

                            {fieldError && (
                                <p className="mt-1 text-xs text-red-600">{fieldError}</p>
                            )}
                        </div>
                    );
                }

                return (
                    <div key={field.name}>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">
                            {label}
                            {field.required && <span className="ml-1 text-red-500">*</span>}
                        </label>

                        <input
                            type="text"
                            value={String(value)}
                            onChange={(e) => onChange(field.name, e.target.value)}
                            className={`w-full px-3 py-2 text-sm border rounded-lg ${
                                fieldError ? 'border-red-300' : 'border-gray-300'
                            }`}
                        />

                        {fieldError && <p className="mt-1 text-xs text-red-600">{fieldError}</p>}
                    </div>
                );
            })}
        </div>
    );
}
