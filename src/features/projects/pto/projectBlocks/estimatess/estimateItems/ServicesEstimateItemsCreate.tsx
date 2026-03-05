import { useEffect, useState } from 'react';
import { X, Plus, Trash2, Save } from 'lucide-react';
import ReferencesSelect from '@/components/ui/ReferencesSelect';
import type { ReferenceResult } from '@/features/reference/referenceSlice';
import { StyledTooltip } from '@/components/ui/StyledTooltip';
import { fetchCurrencyRatesByDate, type CurrencyRate } from '@/utils/fetchCurrencyRate';

interface ServicesRow {
    id: string;
    serviceType: number | null;
    service_id: number | null;
    unitsOfMeasure: number | null;
    quantity: number;
    coefficient: number;
    currency: number | null;
    currency_rate: number;
    price: number;
    note: string;
}

interface ServicesFormProps {
    isOpen: boolean;
    onClose: () => void;
    estimateId?: number | null;
    refs: Record<string, ReferenceResult>;
}

/************************************************************************************************************/
export default function ServicesEstimateItemsCreate({ isOpen, onClose, refs }: ServicesFormProps) {
    const [rates, setRates] = useState<CurrencyRate[]>([]);

    useEffect(() => {
        const loadRates = async () => {
            try {
                const today = new Date().toISOString().split('T')[0];
                const res = await fetchCurrencyRatesByDate(today);
                console.log('res', res);
                setRates(res);
            } catch (err) {
                console.error('Ошибка загрузки курсов валют', err);
            }
        };

        loadRates();
    }, []);

    const serviceTypes = refs.materialTypes?.data || [];
    const services = refs.materials?.data || [];
    const units = refs.unitsOfMeasure?.data || [];
    const currencies = refs.currencies?.data || [];

    const createEmptyRow = (): ServicesRow => ({
        id: Math.random().toString(36).slice(2),
        serviceType: null,
        service_id: null,
        unitsOfMeasure: null,
        quantity: 1,
        coefficient: 1,
        currency: 1,
        currency_rate: 0,
        price: 0,
        note: '',
    });

    const [rows, setRows] = useState<ServicesRow[]>([createEmptyRow()]);

    const updateRow = (id: string, field: keyof ServicesRow, value: string | number | null) => {
        setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
    };

    const addRow = () => setRows((prev) => [...prev, createEmptyRow()]);

    const removeRow = (id: string) => {
        if (rows.length === 1) return;
        setRows((prev) => prev.filter((r) => r.id !== id));
    };

    const parseNumber = (value: string) => {
        const normalized = value.replace(',', '.');
        const num = Number(normalized);

        return isNaN(num) ? 0 : num;
    };

    const rowSum = (r: ServicesRow) =>
        r.quantity * r.coefficient * r.price * (r.currency_rate || 1);

    const total = rows.reduce((s, r) => s + rowSum(r), 0);

    const format = (n: number) => n.toLocaleString('ru-RU', { minimumFractionDigits: 2 });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        const valid = rows.filter((r) => r.serviceType && r.service_id);

        if (!valid.length) {
            alert('Добавьте хотя бы один сервис');
            return;
        }

        console.log(valid);

        setRows([createEmptyRow()]);
        onClose();
    };

    if (!isOpen) return null;

    /******************************************************************************************************************************/
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-[98vw] max-h-[95vh] flex flex-col">
                {/* Header */}
                <div className="sticky top-0 flex items-center justify-between px-4 py-3 bg-white border-b rounded-t-lg">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            Массовое добавление материалов
                        </h2>
                        <p className="mt-1 text-sm text-gray-600">
                            Добавьте несколько материалов за раз
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
                                    <th className="border px-3 py-3 text-xs min-w-[180px]">
                                        Тип материала
                                    </th>
                                    <th className="border px-3 py-3 text-xs min-w-[200px]">
                                        Материал
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
                                    const filteredServices = row.serviceType
                                        ? services.filter(
                                              (s) => Number(s.type) === Number(row.serviceType),
                                          )
                                        : [];

                                    return (
                                        <tr key={row.id} className="hover:bg-gray-50">
                                            <td className="px-3 py-2 text-center border">
                                                {index + 1}
                                            </td>

                                            <td className="px-3 py-2 border">
                                                <ReferencesSelect
                                                    options={serviceTypes}
                                                    value={row.serviceType}
                                                    onChange={(v) => {
                                                        updateRow(row.id, 'serviceType', v);
                                                        updateRow(row.id, 'service_id', null);
                                                    }}
                                                />
                                            </td>

                                            <td className="px-3 py-2 border">
                                                <ReferencesSelect
                                                    options={filteredServices}
                                                    value={row.service_id}
                                                    disabled={!row.serviceType}
                                                    onChange={(v) => {
                                                        updateRow(row.id, 'service_id', v);

                                                        const service = services.find(
                                                            (s) => Number(s.id) === Number(v),
                                                        );

                                                        updateRow(
                                                            row.id,
                                                            'unitsOfMeasure',
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
                                                    value={row.unitsOfMeasure}
                                                    onChange={(v) =>
                                                        updateRow(row.id, 'unitsOfMeasure', v)
                                                    }
                                                />
                                            </td>

                                            <td className="px-3 py-2 border">
                                                <input
                                                    type="text"
                                                    value={row.quantity}
                                                    onChange={(e) =>
                                                        updateRow(
                                                            row.id,
                                                            'quantity',
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
                                                {format(rowSum(row))}
                                            </td>

                                            <td className="px-3 py-2 border">
                                                <input
                                                    type="text"
                                                    value={row.note}
                                                    onChange={(e) =>
                                                        updateRow(row.id, 'note', e.target.value)
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
                                    <td colSpan={12} className="px-3 py-3 border-t-2">
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
                                        colSpan={11}
                                        className="px-3 py-3 font-bold text-right border"
                                    >
                                        ИТОГО
                                    </td>
                                    <td className="px-3 py-3 font-bold text-right text-green-700 border">
                                        {format(total)}
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
            </div>
        </div>
    );
}
