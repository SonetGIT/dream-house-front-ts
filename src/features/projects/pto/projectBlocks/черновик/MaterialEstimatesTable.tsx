import { Pencil, Trash2, ChevronDown, ChevronRight, PlusCircle } from 'lucide-react';
import { Fragment, useState } from 'react';
import type { MaterialEstimate } from '../estimatess/estimatesSlice';
import { useReference } from '@/features/reference/useReference';
import { type MaterialEstimateItem } from '../estimatess/estimateItems/estimateItemsSlice';
import { StyledTooltip } from '@/components/ui/StyledTooltip';
import { useAppSelector } from '@/app/store';
import EstimateItemsCreate from '../estimatess/estimateItems/MaterialEstimateItemsCreate';

interface MatEstTableProps {
    // blockId: number;
    data: MaterialEstimate[];
    onDeleteEstimateId: (id: number) => void;
    onDeleteEstimateItemId: (itemId: number) => void;
}

/**********************************************************************************************************************/
export function MaterialEstimatesTable({
    data,
    onDeleteEstimateId,
    onDeleteEstimateItemId,
}: MatEstTableProps) {
    const estimateItems = useAppSelector((state) => state.estimateItems.byEstimateId);
    console.log('estimateItems', estimateItems); // {}
    console.log('estimate', data);
    const [expandedRows, setExpandedRows] = useState<Set<string | number>>(new Set());
    const [activeTab, setActiveTab] = useState<{ [key: string]: string }>({ i1: 'materials' });
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [currentRowId, setCurrentRowId] = useState<number | null>(null);

    // Справочники
    const refs = {
        statuses: useReference('generalStatuses'),
        materials: useReference('materials'),
        materialTypes: useReference('materialTypes'),
        services: useReference('services'),
        serviceTypes: useReference('serviceTypes'),
        unitsOfMeasure: useReference('unitsOfMeasure'),
        currencies: useReference('currencies'),
    };

    const getStatusColor = (statusId: number | null) => {
        if (statusId === null) {
            return 'bg-gray-100 text-gray-600';
        }

        const fullStatus = refs.statuses.lookup(statusId);

        const statusColorMap: Record<string, string> = {
            Черновик: 'bg-yellow-100 text-yellow-700 ',
            Подписан: 'bg-green-100 text-green-700',
            Отклонен: 'bg-red-100 text-red-700',
            Архив: 'bg-blue-100 text-blue-700',
        };

        return statusColorMap[fullStatus] || 'bg-gray-100 text-gray-700';
    };

    const toggleRow = (id: number) => {
        setExpandedRows((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const setTabForRow = (rowId: number, tab: string) => {
        setActiveTab((prev) => ({ ...prev, [rowId]: tab }));
    };

    const rowTotal = (row: MaterialEstimateItem) => {
        const qty = Number(row.quantity_planned) || 0;
        const price = Number(row.price) || 0;
        const coef =
            row.coefficient === undefined || row.coefficient === null || row.coefficient === 1
                ? 1
                : Number(row.coefficient);

        return qty * price * coef;
    };

    const calculateTotal = () => {
        return data.reduce((sum, item) => sum + item.total_price, 0);
    };

    const handleAddMaterial = (rowId: number) => {
        setCurrentRowId(rowId);
        setIsFormOpen(true);
    };
    /*******************************************************************************************************************/
    return (
        <div className="space-y-4">
            {/* Table - ESTIMATES*/}
            <div className="overflow-hidden bg-white border rounded-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        {/* ESTIMATES- HEADER */}
                        <thead className="sticky top-0 z-10 bg-gray-50">
                            <tr className="border-b">
                                <th className="w-12 px-4 py-3 text-left bg-gray-50"></th>
                                <th className="w-24 px-4 py-3 text-left bg-gray-50">
                                    <div className="text-xs text-gray-600 uppercase">Статус</div>
                                </th>
                                <th className="px-4 py-3 text-right border-l bg-blue-50">
                                    <div className="text-xs font-semibold text-blue-700 uppercase">
                                        Материалы (сом)
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-right border-l bg-blue-50">
                                    <div className="text-xs font-semibold text-blue-700 uppercase">
                                        Услуги (сом)
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-right border-l bg-green-50">
                                    <div className="text-xs font-semibold text-green-700 uppercase">
                                        Стоимость (сом)
                                    </div>
                                </th>
                                <th className="w-24 px-4 py-3 text-center border-l bg-gray-50">
                                    <div className="text-xs text-gray-600 uppercase">Действия</div>
                                </th>
                            </tr>
                        </thead>
                        {/* ESTIMATES-DATA */}
                        <tbody>
                            {data?.map((item: MaterialEstimate) => {
                                const items = estimateItems[item.id] ?? []; // ← ВАЖНО
                                const isExpanded = expandedRows.has(item.id);
                                const currentTab = activeTab[item.id] || 'materials';
                                return (
                                    <Fragment key={item.id}>
                                        <tr className="transition-colors border-b hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => toggleRow(item.id)}
                                                    className="text-gray-400 transition-colors hover:text-gray-600"
                                                >
                                                    {isExpanded ? (
                                                        <ChevronDown className="w-4 h-4" />
                                                    ) : (
                                                        <ChevronRight className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </td>
                                            <td className="px-3 py-3">
                                                <span
                                                    className={`px-2 py-1 font-medium rounded ${getStatusColor(item.status)}`}
                                                >
                                                    {item.status != null
                                                        ? refs.statuses.lookup(item.status)
                                                        : '—'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 font-medium text-right text-gray-900 border-l bg-blue-50/30">
                                                {item.total_price_material}
                                            </td>
                                            <td className="px-4 py-3 font-medium text-right text-gray-900 border-l bg-blue-50/30">
                                                {item.total_price_service}
                                            </td>
                                            <td className="px-4 py-3 text-base font-bold text-right text-green-700 border-l bg-green-50/30">
                                                {item.total_price}
                                            </td>
                                            <td className="px-4 py-3 border-l">
                                                <div className="flex items-center justify-center gap-2">
                                                    <StyledTooltip title="Удалить смету">
                                                        <button
                                                            onClick={() =>
                                                                onDeleteEstimateId(item.id)
                                                            }
                                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </StyledTooltip>
                                                </div>
                                            </td>
                                        </tr>

                                        {/* ESTIMATE_ITEMS */}
                                        {isExpanded && (
                                            <tr className="border-b bg-gradient-to-r from-blue-50 to-blue-50/50">
                                                <td colSpan={12} className="px-4 py-6">
                                                    <div className="ml-8">
                                                        {/* Tabs */}
                                                        <div className="flex gap-2 mb-4 border-b">
                                                            <button
                                                                onClick={() =>
                                                                    setTabForRow(
                                                                        item.id,
                                                                        'materials',
                                                                    )
                                                                }
                                                                className={`px-4 py-2 text-sm font-medium transition-colors ${
                                                                    currentTab === 'materials'
                                                                        ? 'text-blue-600 border-b-2 border-blue-600'
                                                                        : 'text-gray-600 hover:text-gray-900'
                                                                }`}
                                                            >
                                                                Материалы
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    setTabForRow(
                                                                        item.id,
                                                                        'services',
                                                                    )
                                                                }
                                                                className={`px-4 py-2 text-sm font-medium transition-colors ${
                                                                    currentTab === 'services'
                                                                        ? 'text-blue-600 border-b-2 border-blue-600'
                                                                        : 'text-gray-600 hover:text-gray-900'
                                                                }`}
                                                            >
                                                                Услуги
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    setTabForRow(item.id, 'history')
                                                                }
                                                                className={`px-4 py-2 text-sm font-medium transition-colors ${
                                                                    currentTab === 'history'
                                                                        ? 'text-blue-600 border-b-2 border-blue-600'
                                                                        : 'text-gray-600 hover:text-gray-900'
                                                                }`}
                                                            >
                                                                История изменений
                                                            </button>
                                                        </div>

                                                        {/* MATERIALS */}
                                                        {currentTab === 'materials' && (
                                                            <div>
                                                                <div className="flex justify-end">
                                                                    <StyledTooltip title="Добавить материал">
                                                                        <button
                                                                            className="
                                                                                group
                                                                                p-1.5 
                                                                                text-orange-500
                                                                                rounded-lg 
                                                                                hover:bg-orange-600
                                                                                transition-all
                                                                                duration-300
                                                                                hover:text-white
                                                                                hover:scale-110
                                                                                hover:shadow-xl
                                                                                hover:-translate-y-1
                                                                                active:scale-95
                                                                                "
                                                                            onClick={() =>
                                                                                handleAddMaterial(
                                                                                    item.id,
                                                                                )
                                                                            }
                                                                        >
                                                                            <PlusCircle className="w-6 h-6 transition-transform duration-500 group-hover:rotate-90" />
                                                                        </button>
                                                                    </StyledTooltip>
                                                                </div>
                                                                <div className="overflow-hidden bg-white border rounded-lg shadow-sm">
                                                                    <table className="w-full">
                                                                        <thead className="text-gray-700 bg-gray-50">
                                                                            <tr className="border-b">
                                                                                <th className="px-3 py-2 text-xs text-left">
                                                                                    Тип
                                                                                </th>
                                                                                <th className="px-3 py-2 text-xs text-left">
                                                                                    Материал
                                                                                </th>
                                                                                <th className="px-3 py-2 text-xs text-left">
                                                                                    Ед. изм
                                                                                </th>
                                                                                <th className="px-3 py-2 text-xs text-right">
                                                                                    Кол-во
                                                                                </th>
                                                                                <th className="px-3 py-2 text-xs text-right">
                                                                                    Коэфф.
                                                                                </th>
                                                                                <th className="px-3 py-2 text-xs text-right">
                                                                                    Валюта
                                                                                </th>
                                                                                <th className="px-3 py-2 text-xs text-right">
                                                                                    Цена
                                                                                </th>
                                                                                <th className="px-3 py-2 text-xs text-right">
                                                                                    Сумма
                                                                                </th>
                                                                                <th className="px-3 py-2 text-xs text-right">
                                                                                    Примечание
                                                                                </th>
                                                                                <th className="px-3 py-2 text-xs text-center">
                                                                                    Действия
                                                                                </th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {items
                                                                                .filter(
                                                                                    (
                                                                                        sub: MaterialEstimateItem,
                                                                                    ) =>
                                                                                        sub.item_type ===
                                                                                        1,
                                                                                )
                                                                                .map(
                                                                                    (
                                                                                        sub: MaterialEstimateItem,
                                                                                    ) => (
                                                                                        <tr
                                                                                            key={
                                                                                                sub.id
                                                                                            }
                                                                                            className="transition-colors border-b hover:bg-gray-50"
                                                                                        >
                                                                                            <td className="px-3 py-3 text-sm text-gray-600">
                                                                                                {sub.material_type !=
                                                                                                null
                                                                                                    ? refs.materialTypes.lookup(
                                                                                                          sub.material_type,
                                                                                                      )
                                                                                                    : '—'}
                                                                                            </td>
                                                                                            <td className="px-3 py-3 text-sm text-gray-600">
                                                                                                {sub.material_id !=
                                                                                                null
                                                                                                    ? refs.materials.lookup(
                                                                                                          sub.material_id,
                                                                                                      )
                                                                                                    : '-'}
                                                                                            </td>

                                                                                            <td className="px-3 py-3 text-sm text-gray-600">
                                                                                                {sub.unit_of_measure !=
                                                                                                null
                                                                                                    ? refs.unitsOfMeasure.lookup(
                                                                                                          sub.unit_of_measure,
                                                                                                      )
                                                                                                    : '—'}
                                                                                            </td>
                                                                                            <td className="px-3 py-3 text-sm text-right text-gray-900">
                                                                                                {
                                                                                                    sub.quantity_planned
                                                                                                }
                                                                                            </td>
                                                                                            <td className="px-3 py-3 text-sm text-right text-gray-900">
                                                                                                {
                                                                                                    sub.coefficient
                                                                                                }
                                                                                            </td>
                                                                                            <td className="px-3 py-3 text-sm text-right text-blue-700">
                                                                                                {sub.currency !=
                                                                                                null
                                                                                                    ? refs.currencies.lookup(
                                                                                                          sub.currency,
                                                                                                      )
                                                                                                    : '—'}
                                                                                            </td>
                                                                                            <td className="px-3 py-3 font-medium text-right">
                                                                                                {
                                                                                                    sub.price
                                                                                                }
                                                                                            </td>
                                                                                            <td className="px-3 py-3 font-medium text-right text-green-600">
                                                                                                {rowTotal(
                                                                                                    sub,
                                                                                                )}
                                                                                            </td>

                                                                                            <td className="px-3 py-3 text-xs text-right text-gray-600">
                                                                                                {sub.comment ||
                                                                                                    '—'}
                                                                                            </td>
                                                                                            <td className="px-3 py-3">
                                                                                                <div className="flex items-center justify-center gap-1">
                                                                                                    <button className="p-1 text-gray-400 hover:text-blue-600">
                                                                                                        <Pencil className="w-3.5 h-3.5" />
                                                                                                    </button>
                                                                                                    <StyledTooltip title="Удалить позицию">
                                                                                                        <button
                                                                                                            onClick={() =>
                                                                                                                onDeleteEstimateItemId(
                                                                                                                    sub.id,
                                                                                                                )
                                                                                                            }
                                                                                                            className="p-1 text-gray-400 hover:text-red-600"
                                                                                                        >
                                                                                                            <Trash2 className="w-3.5 h-3.5" />
                                                                                                        </button>
                                                                                                    </StyledTooltip>
                                                                                                </div>
                                                                                            </td>
                                                                                        </tr>
                                                                                    ),
                                                                                )}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* SERVICES */}
                                                        {currentTab === 'services' && (
                                                            <div>
                                                                <div className="flex justify-end">
                                                                    <StyledTooltip title="Добавить услугу">
                                                                        <button
                                                                            className="
                                                                                group
                                                                                p-1.5 
                                                                                text-orange-500 
                                                                                rounded-lg 
                                                                                hover:bg-orange-600
                                                                                transition-all
                                                                                duration-300
                                                                                hover:text-white
                                                                                hover:scale-110
                                                                                hover:shadow-xl
                                                                                hover:-translate-y-1
                                                                                active:scale-95
                                                                                "
                                                                        >
                                                                            <PlusCircle className="w-6 h-6 transition-transform duration-500 group-hover:rotate-90" />
                                                                        </button>
                                                                    </StyledTooltip>
                                                                </div>
                                                                <div className="overflow-hidden bg-white border rounded-lg shadow-sm">
                                                                    <table className="w-full text-sm">
                                                                        <thead className="text-gray-700 bg-gray-50">
                                                                            <tr className="border-b">
                                                                                <th className="px-3 py-2 text-xs text-left">
                                                                                    Группа услуг
                                                                                </th>
                                                                                <th className="px-3 py-2 text-xs text-left">
                                                                                    Услуга
                                                                                </th>
                                                                                <th className="px-3 py-2 text-xs text-left">
                                                                                    Ед. изм
                                                                                </th>
                                                                                <th className="px-3 py-2 text-xs text-right">
                                                                                    Кол-во
                                                                                </th>
                                                                                <th className="px-3 py-2 text-xs text-right">
                                                                                    Коэфф.
                                                                                </th>
                                                                                <th className="px-3 py-2 text-xs text-right">
                                                                                    Валюта
                                                                                </th>
                                                                                <th className="px-3 py-2 text-xs text-right">
                                                                                    Цена
                                                                                </th>
                                                                                <th className="px-3 py-2 text-xs text-right">
                                                                                    Сумма
                                                                                </th>
                                                                                <th className="px-3 py-2 text-xs text-right">
                                                                                    Примечание
                                                                                </th>
                                                                                <th className="px-3 py-2 text-xs text-center">
                                                                                    Действия
                                                                                </th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {items
                                                                                .filter(
                                                                                    (
                                                                                        sub: MaterialEstimateItem,
                                                                                    ) =>
                                                                                        sub.item_type ===
                                                                                        2,
                                                                                )
                                                                                .map(
                                                                                    (
                                                                                        sub: MaterialEstimateItem,
                                                                                    ) => (
                                                                                        <tr
                                                                                            key={
                                                                                                sub.id
                                                                                            }
                                                                                            className="transition-colors border-b hover:bg-gray-50"
                                                                                        >
                                                                                            <td className="px-3 py-3 text-sm text-gray-600">
                                                                                                {sub.service_type !=
                                                                                                null
                                                                                                    ? refs.serviceTypes.lookup(
                                                                                                          sub.service_type,
                                                                                                      )
                                                                                                    : '—'}
                                                                                            </td>
                                                                                            <td className="px-3 py-3 text-sm text-gray-600">
                                                                                                {sub.service_id !=
                                                                                                null
                                                                                                    ? refs.services.lookup(
                                                                                                          sub.service_id,
                                                                                                      )
                                                                                                    : '-'}
                                                                                            </td>

                                                                                            <td className="px-3 py-3 text-sm text-gray-600">
                                                                                                {sub.unit_of_measure !=
                                                                                                null
                                                                                                    ? refs.unitsOfMeasure.lookup(
                                                                                                          sub.unit_of_measure,
                                                                                                      )
                                                                                                    : '—'}
                                                                                            </td>
                                                                                            <td className="px-3 py-3 text-sm text-right text-gray-900">
                                                                                                {
                                                                                                    sub.quantity_planned
                                                                                                }
                                                                                            </td>
                                                                                            <td className="px-3 py-3 text-sm text-right text-gray-900">
                                                                                                {
                                                                                                    sub.coefficient
                                                                                                }
                                                                                            </td>
                                                                                            <td className="px-3 py-3 text-sm text-right text-blue-700">
                                                                                                {sub.currency !=
                                                                                                null
                                                                                                    ? refs.currencies.lookup(
                                                                                                          sub.currency,
                                                                                                      )
                                                                                                    : '—'}
                                                                                            </td>
                                                                                            <td className="px-3 py-3 font-medium text-right">
                                                                                                {
                                                                                                    sub.price
                                                                                                }
                                                                                            </td>
                                                                                            <td className="px-3 py-3 font-medium text-right text-green-600">
                                                                                                {rowTotal(
                                                                                                    sub,
                                                                                                )}
                                                                                            </td>

                                                                                            <td className="px-3 py-3 text-xs text-right text-gray-600">
                                                                                                {sub.comment ||
                                                                                                    '—'}
                                                                                            </td>
                                                                                            <td className="px-3 py-3">
                                                                                                <div className="flex items-center justify-center gap-1">
                                                                                                    <button className="p-1 text-gray-400 hover:text-blue-600">
                                                                                                        <Pencil className="w-3.5 h-3.5" />
                                                                                                    </button>
                                                                                                    <button
                                                                                                        className="p-1 text-gray-400 hover:text-red-600"
                                                                                                        onClick={() =>
                                                                                                            onDeleteEstimateItemId(
                                                                                                                sub.id,
                                                                                                            )
                                                                                                        }
                                                                                                    >
                                                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                                                    </button>
                                                                                                </div>
                                                                                            </td>
                                                                                        </tr>
                                                                                    ),
                                                                                )}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* HISTORY */}
                                                        {currentTab === 'history' && (
                                                            <div className="p-6 bg-white border rounded-lg">
                                                                <div className="space-y-3">
                                                                    <div className="flex items-start gap-3 pb-3 border-b">
                                                                        <div className="w-2 h-2 mt-2 bg-blue-600 rounded-full"></div>
                                                                        <div className="flex-1">
                                                                            <div className="text-sm font-medium text-gray-900">
                                                                                Смета создана
                                                                            </div>
                                                                            <div className="mt-1 text-xs text-gray-500">
                                                                                Системы Админ • 15
                                                                                февраля 2026
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
                                );
                            })}
                            <tr className="font-bold border-t-2 border-green-600 bg-gradient-to-r from-green-50 to-green-100">
                                <td colSpan={4}></td>

                                <td className="px-4 py-4 text-base text-right text-gray-900">
                                    ИТОГО:
                                </td>

                                <td className="px-4 py-4 text-lg text-right text-green-700">
                                    {calculateTotal()}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <EstimateItemsCreate
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                // onSubmit={handleFormSubmit}
            />
        </div>
    );
}
