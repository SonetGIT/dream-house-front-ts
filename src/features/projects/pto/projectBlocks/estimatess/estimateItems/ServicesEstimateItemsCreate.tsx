import { useState } from 'react';
import { X, Plus, Trash2, Save } from 'lucide-react';
import ReferencesSelect from '@/components/ui/ReferencesSelect';
import type { ReferenceResult } from '@/features/reference/referenceSlice';
import { StyledTooltip } from '@/components/ui/StyledTooltip';
import { useAppDispatch } from '@/app/store';
import toast from 'react-hot-toast';
import {
    createEstimateItems,
    fetchEstimateItems,
    type EstimateItemCreatePayload,
    type EstimateItemFormData,
} from './estimateItemsSlice';
import { parseNumber } from '@/utils/parseNumber';
import { useCurrencyRates } from '@/utils/useCurrencyRates';
import { calcRowTotal } from '@/utils/calcRowTotal';
import { formatNumber } from '@/utils/formatNumber';

interface MaterialFormProps {
    isOpen: boolean;
    estimateId: number;
    refs: Record<string, ReferenceResult>;
    onClose: () => void;
}

/************************************************************************************************************/
export default function ServicesEstimateItemsCreate({
    isOpen,
    estimateId,
    refs,
    onClose,
    // onSumChange,
}: MaterialFormProps) {
    //HOOKS
    const dispatch = useAppDispatch();
    const rates = useCurrencyRates();

    //REFERENCES
    const serviceTypes = refs.serviceTypes?.data ?? [];
    const services = refs.services?.data ?? [];
    const units = refs.unitsOfMeasure?.data ?? [];
    const currencies = refs.currencies?.data ?? [];
    const blockStages = refs.blockStages?.data ?? [];
    const stageSubsections = refs.stageSubsections?.data ?? [];

    //HELPERS
    const createEmptyRow = (): EstimateItemFormData => ({
        id: Math.random().toString(36).substr(2, 9),
        material_estimate_id: estimateId,
        stage_id: null,
        subsection_id: null,
        item_type: 2, // 2 - услуга
        entry_type: 1, //из сметы
        service_type: null,
        service_id: null,
        unit_of_measure: null,
        quantity_planned: 1,
        coefficient: 1,
        currency: 1,
        currency_rate: 0,
        price: 0,
        comment: '',
    });

    //STATE
    const [rows, setRows] = useState<EstimateItemFormData[]>([createEmptyRow()]);
    const total = rows.reduce((s, r) => s + calcRowTotal(r), 0);

    //HANDLERS
    const updateRow = (
        id: string,
        field: keyof EstimateItemFormData,
        value: string | number | null,
    ) => {
        setRows((prev) =>
            prev.map((row) => {
                if (row.id !== id) return row;

                const updated = { ...row, [field]: value };

                if (field === 'stage_id') {
                    updated.subsection_id = null;
                }

                if (field === 'service_type') {
                    updated.service_id = null;
                    updated.unit_of_measure = null;
                }

                if (field === 'service_id') {
                    updated.unit_of_measure = null;
                }

                if (field === 'item_type') {
                    if (value === 1) {
                        updated.service_type = null;
                        updated.service_id = null;
                    }

                    if (value === 2) {
                        updated.material_type = null;
                        updated.material_id = null;
                        updated.unit_of_measure = null;
                    }
                }

                return updated;
            }),
        );
    };

    const addRow = () => {
        setRows((prev) => [...prev, createEmptyRow()]);
    };

    const removeRow = (id: string) => {
        if (rows.length === 1) return;

        setRows((prev) => prev.filter((r) => r.id !== id));
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();

        const valid = rows.filter((r) => r.service_type && r.service_id && r.unit_of_measure);

        if (!valid.length) {
            alert('Добавьте хотя бы одну услугу');
            return;
        }

        const payload: EstimateItemCreatePayload[] = valid.map(({ id, ...rest }) => rest);

        try {
            await dispatch(createEstimateItems(payload)).unwrap();

            dispatch(fetchEstimateItems());

            toast.success('Услуги успешно добавлены!');

            setRows([createEmptyRow()]);
            onClose();
        } catch {
            toast.error('Ошибка создания');
        }
    };

    if (!isOpen) return null;

    /******************************************************************************************************************************/
    return (
        <tr className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black bg-opacity-50">
            <td className="bg-white rounded-lg shadow-xl w-[98vw] max-h-[95vh] flex flex-col">
                {/* Header */}
                <div className="sticky top-0 flex items-center justify-between px-4 py-3 bg-white border-b rounded-t-lg">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            Массовое добавление услуг
                        </h2>
                        <p className="mt-1 text-sm text-gray-600">
                            Добавьте несколько услуг за раз
                        </p>
                    </div>

                    <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
                        <X className="w-5 h-5 text-red-500" />
                    </button>
                </div>

                <form onSubmit={submit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="flex-1 p-4 overflow-y-auto">
                        <table className="w-full border-collapse">
                            <thead className="sticky top-0 z-10 bg-gray-50">
                                <tr>
                                    <th className="px-3 py-3 text-xs border">#</th>
                                    <th className="border px-3 py-3 text-xs min-w-[180px]">Этап</th>
                                    <th className="border px-3 py-3 text-xs min-w-[200px]">
                                        Подэтап
                                    </th>
                                    <th className="border px-3 py-3 text-xs min-w-[180px]">
                                        Тип услуги
                                    </th>
                                    <th className="border px-3 py-3 text-xs min-w-[200px]">
                                        Услуга
                                    </th>
                                    <th className="border px-3 py-3 text-xs min-w-[160px]">
                                        Ед. изм
                                    </th>
                                    <th className="border px-3 py-3 text-xs min-w-[100px]">
                                        Кол-во
                                    </th>
                                    <th className="border px-3 py-3 text-xs min-w-[90px]">
                                        Коэфф.
                                    </th>
                                    <th className="border px-3 py-3 text-xs min-w-[130px]">
                                        Валюта
                                    </th>
                                    <th className="border px-3 py-3 text-xs min-w-[120px]">Курс</th>
                                    <th className="border px-3 py-3 text-xs min-w-[100px]">Цена</th>
                                    <th className="border px-3 py-3 text-xs min-w-[100px] text-green-700">
                                        Сумма
                                    </th>
                                    <th className="border px-3 py-3 text-xs min-w-[150px]">
                                        Примечание
                                    </th>
                                    <th className="px-3 py-3 text-xs border">Действия</th>
                                </tr>
                            </thead>

                            <tbody>
                                {rows.map((row, index) => {
                                    const filteredServices = row.service_type
                                        ? services.filter(
                                              (s) =>
                                                  Number(s.service_type) ===
                                                  Number(row.service_type),
                                          )
                                        : [];

                                    const filteredSubStages = row.stage_id
                                        ? stageSubsections.filter(
                                              (s) => Number(s.stage_id) === Number(row.stage_id),
                                          )
                                        : [];

                                    return (
                                        <tr key={row.id} className="hover:bg-gray-50">
                                            <td className="px-3 py-2 text-center border">
                                                {index + 1}
                                            </td>

                                            <td className="px-3 py-2 border">
                                                <ReferencesSelect
                                                    options={blockStages}
                                                    value={row.stage_id}
                                                    onChange={(v) =>
                                                        updateRow(row.id, 'stage_id', v)
                                                    }
                                                />
                                            </td>

                                            <td className="px-3 py-2 border">
                                                <ReferencesSelect
                                                    options={filteredSubStages}
                                                    value={row.subsection_id}
                                                    disabled={!row.stage_id}
                                                    onChange={(v) =>
                                                        updateRow(row.id, 'subsection_id', v)
                                                    }
                                                />
                                            </td>
                                            <td className="px-3 py-2 border">
                                                <ReferencesSelect
                                                    options={serviceTypes}
                                                    value={row.service_type}
                                                    onChange={(v) => {
                                                        updateRow(row.id, 'service_type', v);
                                                        updateRow(row.id, 'service_id', null);
                                                    }}
                                                />
                                            </td>

                                            <td className="px-3 py-2 border">
                                                <ReferencesSelect
                                                    options={filteredServices}
                                                    value={row.service_id}
                                                    disabled={!row.service_type}
                                                    onChange={(v) => {
                                                        updateRow(row.id, 'service_id', v);

                                                        const service = services.find(
                                                            (s) => Number(s.id) === Number(v),
                                                        );

                                                        updateRow(
                                                            row.id,
                                                            'unit_of_measure',
                                                            service?.unit_of_measure
                                                                ? Number(service.unit_of_measure)
                                                                : null,
                                                        );
                                                    }}
                                                />
                                            </td>

                                            <td className="px-3 py-2 border">
                                                <ReferencesSelect
                                                    options={units}
                                                    value={row.unit_of_measure}
                                                    onChange={(v) =>
                                                        updateRow(row.id, 'unit_of_measure', v)
                                                    }
                                                />
                                            </td>

                                            <td className="px-3 py-2 border">
                                                <input
                                                    type="text"
                                                    value={row.quantity_planned}
                                                    onChange={(e) =>
                                                        updateRow(
                                                            row.id,
                                                            'quantity_planned',
                                                            parseNumber(e.target.value),
                                                        )
                                                    }
                                                    className="w-full px-2 py-1.5 border rounded text-right"
                                                />
                                            </td>

                                            <td className="px-3 py-2 border">
                                                <input
                                                    type="text"
                                                    value={row.coefficient ?? ''}
                                                    onChange={(e) =>
                                                        updateRow(
                                                            row.id,
                                                            'coefficient',
                                                            e.target.value,
                                                        )
                                                    }
                                                    onBlur={(e) =>
                                                        updateRow(
                                                            row.id,
                                                            'coefficient',
                                                            parseNumber(e.target.value),
                                                        )
                                                    }
                                                    className="w-full px-2 py-1.5 border rounded text-right"
                                                />
                                            </td>

                                            <td className="px-3 py-2 border">
                                                <ReferencesSelect
                                                    options={currencies}
                                                    value={row.currency}
                                                    onChange={(v) => {
                                                        updateRow(row.id, 'currency', v);

                                                        if (!v) return;

                                                        const rate = rates.find(
                                                            (r) =>
                                                                Number(r.currency_id) === Number(v),
                                                        )?.rate;

                                                        updateRow(
                                                            row.id,
                                                            'currency_rate',
                                                            rate ?? 1,
                                                        );
                                                    }}
                                                />
                                            </td>

                                            <td className="px-3 py-2 border">
                                                <input
                                                    type="text"
                                                    value={row.currency_rate}
                                                    onChange={(e) =>
                                                        updateRow(
                                                            row.id,
                                                            'currency_rate',
                                                            parseNumber(e.target.value),
                                                        )
                                                    }
                                                    className="w-full px-2 py-1.5 border rounded text-right"
                                                />
                                            </td>

                                            <td className="px-3 py-2 border">
                                                <input
                                                    type="text"
                                                    value={row.price}
                                                    onChange={(e) =>
                                                        updateRow(
                                                            row.id,
                                                            'price',
                                                            parseNumber(e.target.value),
                                                        )
                                                    }
                                                    className="w-full px-2 py-1.5 border rounded text-right"
                                                />
                                            </td>

                                            <td className="px-3 py-2 font-bold text-right text-green-700 border bg-green-50">
                                                {formatNumber(calcRowTotal(row))}
                                            </td>

                                            <td className="px-3 py-2 border">
                                                <input
                                                    type="text"
                                                    value={row.comment}
                                                    onChange={(e) =>
                                                        updateRow(row.id, 'comment', e.target.value)
                                                    }
                                                    className="w-full px-2 py-1.5 border rounded"
                                                />
                                            </td>

                                            <td className="px-3 py-2 text-center border">
                                                <StyledTooltip title="Удалить строку">
                                                    <span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeRow(row.id)}
                                                            disabled={rows.length === 1}
                                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </span>
                                                </StyledTooltip>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>

                            <tfoot className="sticky bottom-0 bg-white">
                                <tr>
                                    <td colSpan={14} className="px-3 py-3 border-t-2">
                                        <button
                                            type="button"
                                            onClick={addRow}
                                            className="flex justify-center w-full gap-2 py-2 text-blue-600 border-2 border-blue-200 border-dashed rounded-lg hover:bg-blue-50"
                                        >
                                            <Plus className="w-5 h-5" />
                                            Добавить строку
                                        </button>
                                    </td>
                                </tr>

                                <tr className="bg-green-50">
                                    <td
                                        colSpan={13}
                                        className="px-3 py-3 font-bold text-right border"
                                    >
                                        ИТОГО
                                    </td>
                                    <td className="px-3 py-3 font-bold text-right text-green-700 border">
                                        {formatNumber(total)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <div className="flex justify-end gap-4 px-6 py-4 border-t bg-gray-50">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100"
                        >
                            Отмена
                        </button>

                        <button
                            type="submit"
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            Сохранить все материалы
                        </button>
                    </div>
                </form>
            </td>
        </tr>
    );
}
