import type { ReferenceResult } from '@/features/reference/referenceSlice';
import type { ReportDefinition, ReportDefinitionField } from './reportDefinitionsSlice';

interface ProjectBlockOption {
    id: number;
    name: string;
}

interface ReportParamsFormProps {
    definition: ReportDefinition | null;
    values: Record<string, string | number | null | undefined>;
    errors?: Record<string, string>;
    refs: Record<string, ReferenceResult>;
    contextValues?: Record<string, string | number | null | undefined>;
    projectBlockOptions?: ProjectBlockOption[];
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

const shouldHideField = (
    field: ReportDefinitionField,
    contextValues?: Record<string, string | number | null | undefined>,
) => {
    if (field.value_from) {
        const contextValue = contextValues?.[field.value_from];

        if (contextValue !== undefined && contextValue !== null && contextValue !== '') {
            return true;
        }
    }

    if (field.name === 'projectId') {
        const projectId = contextValues?.projectId;

        if (projectId !== undefined && projectId !== null && projectId !== '') {
            return true;
        }
    }

    return false;
};

const getFieldOptions = (
    field: ReportDefinitionField,
    refs: Record<string, ReferenceResult>,
    projectBlockOptions?: ProjectBlockOption[],
) => {
    if (!field.options_api) return [];

    if (field.options_api === 'projectBlocks') {
        return projectBlockOptions ?? [];
    }

    return refs[field.options_api]?.data ?? [];
};

export default function ReportParamsForm({
    definition,
    values,
    errors = {},
    refs,
    contextValues,
    projectBlockOptions = [],
    onChange,
}: ReportParamsFormProps) {
    if (!definition) {
        return (
            <div className="p-6 text-sm text-gray-500 bg-white border rounded-lg">
                Выберите отчет
            </div>
        );
    }

    const fields = (definition.params_schema?.fields ?? []).filter(
        (field) => !shouldHideField(field, contextValues),
    );

    if (!fields.length) {
        return (
            <div className="text-xs text-center text-gray-500">
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
                    const options = getFieldOptions(field, refs, projectBlockOptions);

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
                                className={`w-full px-3 py-2 text-sm border rounded-lg ${
                                    fieldError ? 'border-red-300' : 'border-gray-300'
                                }`}
                            >
                                <option value="">Выберите</option>

                                {options.map((item) => (
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
