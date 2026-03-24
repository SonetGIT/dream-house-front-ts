import { Pencil, Trash2, Check, X } from 'lucide-react';
import { StyledTooltip } from '@/components/ui/StyledTooltip';
import type { EstimateItem } from './estimateItemsSlice';
import { useState, useMemo } from 'react';
import ReferencesSelect from '@/components/ui/ReferencesSelect';
import { useCurrencyRates } from '@/utils/useCurrencyRates';
import { parseNumber } from '@/utils/parseNumber';
import type { ReferenceResult } from '@/features/reference/referenceSlice';

interface ServicesTableProps {
    items: EstimateItem[];
    refs: Record<string, ReferenceResult>;
    calcRowTotal: (row: any) => number;
    onDeleteEstimateItemId: (id: number) => void;
    onUpdateEstimateItem?: (id: number, data: Partial<EstimateItem>) => void;
}

export default function ServicesTable({
    items,
    refs,
    calcRowTotal,
    onDeleteEstimateItemId,
    onUpdateEstimateItem,
}: ServicesTableProps) {
    // ---------- STATE ----------
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editedData, setEditedData] = useState<Partial<EstimateItem>>({});

    const rates = useCurrencyRates();

    // ---------- REFERENCES ----------
    const serviceTypes = refs.serviceTypes?.data || [];
    const services = refs.services?.data || [];
    const units = refs.unitsOfMeasure?.data || [];
    const currencies = refs.currencies?.data || [];
    const blockStages = refs.blockStages?.data || [];
    const stageSubsections = refs.stageSubsections?.data || [];

    // ---------- MEMOIZED LOOKUPS ----------
    const servicesByType = useMemo(() => {
        const map: Record<number, any[]> = {};

        services.forEach((s: any) => {
            const type = Number(s.service_type);
            if (!map[type]) map[type] = [];
            map[type].push(s);
        });

        return map;
    }, [services]);

    const subsectionsByStage = useMemo(() => {
        const map: Record<number, any[]> = {};

        stageSubsections.forEach((s: any) => {
            const stage = Number(s.stage_id);
            if (!map[stage]) map[stage] = [];
            map[stage].push(s);
        });

        return map;
    }, [stageSubsections]);

    // ---------- HANDLERS ----------
    const handleEdit = (item: EstimateItem) => {
        setEditingId(item.id);
        setEditedData({ ...item });
    };

    const handleSave = async () => {
        if (onUpdateEstimateItem && editingId !== null) {
            await onUpdateEstimateItem(editingId, editedData);
        }

        setEditingId(null);
        setEditedData({});
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditedData({});
    };

    const handleChange = (key: keyof EstimateItem, value: any) => {
        setEditedData((prev) => {
            const updated = { ...prev, [key]: value };

            // сброс зависимых полей
            if (key === 'stage_id') {
                updated.subsection_id = null;
            }

            if (key === 'material_type') {
                updated.material_id = null;
                updated.unit_of_measure = null;
            }

            if (key === 'material_id') {
                const service = services.find((m: any) => Number(m.id) === Number(value));

                if (service?.unit_of_measure) {
                    updated.unit_of_measure = Number(service.unit_of_measure);
                }
            }

            return updated;
        });
    };

    /*******************************************************************************************************************/
    return (
        <div className="overflow-hidden bg-white border rounded-lg shadow-sm">
            <table className="w-full">
                <thead className="text-gray-700 bg-gray-50">
                    <tr className="border-b">
                        <th className="px-3 py-2 text-xs text-left">Этап</th>
                        <th className="px-3 py-2 text-xs text-left">Подэтап</th>
                        <th className="px-3 py-2 text-xs text-left">Тип сервиса</th>
                        <th className="px-3 py-2 text-xs text-left">Сервис</th>
                        <th className="px-3 py-2 text-xs text-left">Ед. изм</th>
                        <th className="px-3 py-2 text-xs text-right">Кол-во</th>
                        <th className="px-3 py-2 text-xs text-right">Коэфф.</th>
                        <th className="px-3 py-2 text-xs text-right">Валюта</th>
                        <th className="px-3 py-2 text-xs text-right">Курс</th>
                        <th className="px-3 py-2 text-xs text-right">Цена</th>
                        <th className="px-3 py-2 text-xs text-right">Сумма</th>
                        <th className="px-3 py-2 text-xs text-right">Примечание</th>
                        <th className="px-3 py-2 text-xs text-center">Действия</th>
                    </tr>
                </thead>

                <tbody>
                    {items
                        .filter((sub) => sub.item_type === 2)
                        .map((sub) => {
                            const isEditing = editingId === sub.id;
                            const data = isEditing ? editedData : sub;

                            const filteredServices = data.service_type
                                ? servicesByType[Number(data.service_type)] || []
                                : [];

                            const filteredSubStages = data.stage_id
                                ? subsectionsByStage[Number(data.stage_id)] || []
                                : [];

                            return (
                                <tr
                                    key={sub.id}
                                    className={`transition-colors border-b ${isEditing ? 'bg-blue-50/30' : 'hover:bg-gray-50'}`}
                                >
                                    {/* Этап */}
                                    <td className="px-3 py-3 text-sm text-gray-600">
                                        {isEditing ? (
                                            <ReferencesSelect
                                                options={blockStages}
                                                value={data.stage_id}
                                                onChange={(v) => handleChange('stage_id', v)}
                                            />
                                        ) : sub.stage_id != null ? (
                                            refs.blockStages.lookup(sub.stage_id)
                                        ) : (
                                            '—'
                                        )}
                                    </td>

                                    {/* Подэтап */}
                                    <td className="px-3 py-3 text-sm text-gray-600">
                                        {isEditing ? (
                                            <ReferencesSelect
                                                options={filteredSubStages}
                                                value={data.subsection_id}
                                                disabled={!data.stage_id}
                                                onChange={(v) => handleChange('subsection_id', v)}
                                            />
                                        ) : sub.subsection_id != null ? (
                                            refs.stageSubsections.lookup(sub.subsection_id)
                                        ) : (
                                            '—'
                                        )}
                                    </td>

                                    {/* Тип сервиса */}
                                    <td className="px-3 py-3 text-sm text-gray-600">
                                        {isEditing ? (
                                            <ReferencesSelect
                                                options={serviceTypes}
                                                value={data.service_type}
                                                onChange={(v) => handleChange('service_type', v)}
                                            />
                                        ) : sub.service_type != null ? (
                                            refs.serviceTypes.lookup(sub.service_type)
                                        ) : (
                                            '—'
                                        )}
                                    </td>

                                    {/* сервис */}
                                    <td className="px-3 py-3 text-sm text-gray-600">
                                        {isEditing ? (
                                            <ReferencesSelect
                                                options={filteredServices}
                                                value={data.service_id}
                                                disabled={!data.service_type}
                                                onChange={(v) => handleChange('service_id', v)}
                                            />
                                        ) : sub.service_id != null ? (
                                            refs.services.lookup(sub.service_id)
                                        ) : (
                                            '—'
                                        )}
                                    </td>

                                    {/* Единица измерения */}
                                    <td className="px-3 py-3 text-sm text-gray-600">
                                        {isEditing ? (
                                            <ReferencesSelect
                                                options={units}
                                                value={data.unit_of_measure}
                                                onChange={(v) => handleChange('unit_of_measure', v)}
                                            />
                                        ) : sub.unit_of_measure != null ? (
                                            refs.unitsOfMeasure.lookup(sub.unit_of_measure)
                                        ) : (
                                            '—'
                                        )}
                                    </td>

                                    {/* Количество */}
                                    <td className="px-3 py-3 text-sm text-right text-gray-900">
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={data.quantity_planned ?? ''}
                                                onChange={(e) =>
                                                    handleChange('quantity_planned', e.target.value)
                                                }
                                                onBlur={(e) =>
                                                    handleChange(
                                                        'quantity_planned',
                                                        parseNumber(e.target.value),
                                                    )
                                                }
                                                className="w-full px-2 py-1.5 text-sm border rounded text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        ) : (
                                            sub.quantity_planned
                                        )}
                                    </td>

                                    {/* Коэффициент */}
                                    <td className="px-3 py-3 text-sm text-right text-gray-900">
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={data.coefficient ?? ''}
                                                onChange={(e) =>
                                                    handleChange('coefficient', e.target.value)
                                                }
                                                onBlur={(e) =>
                                                    handleChange(
                                                        'coefficient',
                                                        parseNumber(e.target.value),
                                                    )
                                                }
                                                className="w-full px-2 py-1.5 text-sm border rounded text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        ) : (
                                            sub.coefficient
                                        )}
                                    </td>

                                    {/* Валюта */}
                                    <td className="px-3 py-3 text-sm text-right text-blue-700">
                                        {isEditing ? (
                                            <ReferencesSelect
                                                options={currencies}
                                                value={data.currency}
                                                onChange={(v) => {
                                                    handleChange('currency', v);

                                                    const rate = rates.find(
                                                        (r) => Number(r.currency_id) === Number(v),
                                                    )?.rate;

                                                    handleChange('currency_rate', rate ?? 1);
                                                }}
                                            />
                                        ) : sub.currency != null ? (
                                            refs.currencies.lookup(sub.currency)
                                        ) : (
                                            '—'
                                        )}
                                    </td>

                                    {/* Курс */}
                                    <td className="px-3 py-3 font-medium text-right">
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={data.currency_rate ?? ''}
                                                onChange={(e) =>
                                                    handleChange('currency_rate', e.target.value)
                                                }
                                                onBlur={(e) =>
                                                    handleChange(
                                                        'currency_rate',
                                                        parseNumber(e.target.value),
                                                    )
                                                }
                                                className="w-full px-2 py-1.5 text-sm border rounded text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        ) : (
                                            sub.currency_rate
                                        )}
                                    </td>

                                    {/* Цена */}
                                    <td className="px-3 py-3 font-medium text-right">
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={data.price ?? ''}
                                                onChange={(e) =>
                                                    handleChange('price', e.target.value)
                                                }
                                                onBlur={(e) =>
                                                    handleChange(
                                                        'price',
                                                        parseNumber(e.target.value),
                                                    )
                                                }
                                                className="w-full px-2 py-1.5 text-sm border rounded text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        ) : (
                                            sub.price
                                        )}
                                    </td>

                                    {/* Сумма */}
                                    <td className="px-3 py-3 font-medium text-right text-green-600">
                                        {calcRowTotal(isEditing ? (data as EstimateItem) : sub)}
                                        {/* {calcRowTotal({ ...sub, ...data })} */}
                                    </td>

                                    {/* Примечание */}
                                    <td className="px-3 py-3 text-xs text-right text-gray-600">
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={data.comment || ''}
                                                onChange={(e) =>
                                                    handleChange('comment', e.target.value)
                                                }
                                                className="w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        ) : (
                                            sub.comment || '—'
                                        )}
                                    </td>

                                    {/* Действия */}
                                    <td className="px-3 py-3">
                                        <div className="flex items-center justify-center gap-1">
                                            {isEditing ? (
                                                <>
                                                    <StyledTooltip title="Сохранить изменения">
                                                        <button
                                                            onClick={handleSave}
                                                            className="p-1.5 text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                                                        >
                                                            <Check className="w-3.5 h-3.5" />
                                                        </button>
                                                    </StyledTooltip>

                                                    <StyledTooltip title="Отменить">
                                                        <button
                                                            onClick={handleCancel}
                                                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                                        >
                                                            <X className="w-5 h-5 text-red-500" />
                                                        </button>
                                                    </StyledTooltip>
                                                </>
                                            ) : (
                                                <>
                                                    <StyledTooltip title="Редактировать сервис">
                                                        <button
                                                            onClick={() => handleEdit(sub)}
                                                            className="inline-flex items-center justify-center text-blue-600 transition-colors rounded-md h-7 w-7 hover:bg-blue-50"
                                                        >
                                                            <Pencil className="w-3.5 h-3.5" />
                                                        </button>
                                                    </StyledTooltip>

                                                    <StyledTooltip title="Удалить сервис">
                                                        <button
                                                            onClick={() =>
                                                                onDeleteEstimateItemId(sub.id)
                                                            }
                                                            className="inline-flex items-center justify-center text-red-600 transition-colors rounded-md h-7 w-7 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </StyledTooltip>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                </tbody>
            </table>
        </div>
    );
}
