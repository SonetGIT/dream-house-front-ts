import { Pencil, Trash2, ChevronDown, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import type { MaterialEstimate } from './materialEstimatesSlice';
import { formatDateTime } from '@/utils/formatDateTime';
import { useReference } from '@/features/reference/useReference';
import type { MaterialEstimateItem } from './estimateItems/materialEstimateItemsSlice';
import { MdOutlinePlaylistAdd } from 'react-icons/md';

interface ImprovedEstimateTableProps {
    blockId: number;
    data: MaterialEstimate[];
}

export function ImprovedEstimateTable({ data }: ImprovedEstimateTableProps) {
    const [expandedRows, setExpandedRows] = useState<Set<string | number>>(new Set());
    const [activeTab, setActiveTab] = useState<{ [key: string]: string }>({ i1: 'materials' });
    const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(
        new Set(['groupService', 'service', 'materialType']),
    );
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

    const toggleColumn = (column: string) => {
        setHiddenColumns((prev) => {
            const next = new Set(prev);
            if (next.has(column)) {
                next.delete(column);
            } else {
                next.add(column);
            }
            return next;
        });
    };

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
    // Сокращение статусов
    const getShortStatus = (statusId: number | null) => {
        if (statusId === null) return '—';
        const fullStatus = refs.statuses.lookup(statusId);
        const statusMap: Record<string, string> = {
            Черновик: 'Черн.',
            Подписан: 'Подп.',
            Отклонен: 'Откл.',
            Архив: 'Арх.',
        };
        return statusMap[fullStatus] || fullStatus;
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
    // const formatNumber = (num: number) => {
    //     if (num === 0) return '—';
    //     return num.formatDateTime('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    // };

    const calculateTotal = () => {
        return data.reduce((sum, item) => sum + item.total_price, 0);
        // return data.reduce((sum, item) => sum + 2000, 0);
    };

    const isColumnHidden = (column: string) => hiddenColumns.has(column);

    return (
        <div className="space-y-4">
            {/* Column Visibility Controls */}
            <div className="p-3 bg-white border rounded-lg">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Показать столбцы:</span>
                    <button
                        onClick={() => toggleColumn('groupService')}
                        className={`px-3 py-1 text-xs rounded-lg flex items-center gap-1 transition-colors ${
                            !isColumnHidden('groupService')
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        {!isColumnHidden('groupService') ? (
                            <Eye className="w-3 h-3" />
                        ) : (
                            <EyeOff className="w-3 h-3" />
                        )}
                        Группа услуг
                    </button>
                    <button
                        onClick={() => toggleColumn('service')}
                        className={`px-3 py-1 text-xs rounded-lg flex items-center gap-1 transition-colors ${
                            !isColumnHidden('service')
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        {!isColumnHidden('service') ? (
                            <Eye className="w-3 h-3" />
                        ) : (
                            <EyeOff className="w-3 h-3" />
                        )}
                        Услуга
                    </button>
                    <button
                        onClick={() => toggleColumn('materialType')}
                        className={`px-3 py-1 text-xs rounded-lg flex items-center gap-1 transition-colors ${
                            !isColumnHidden('materialType')
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        {!isColumnHidden('materialType') ? (
                            <Eye className="w-3 h-3" />
                        ) : (
                            <EyeOff className="w-3 h-3" />
                        )}
                        Тип материала
                    </button>
                </div>
            </div>

            {/* Table - ESTIMATES*/}
            <div className="overflow-hidden bg-white border rounded-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="sticky top-0 z-10 bg-gray-50">
                            <tr className="border-b">
                                <th className="w-12 px-4 py-3 text-left bg-gray-50"></th>
                                <th className="w-24 px-4 py-3 text-left bg-gray-50">
                                    <div className="text-xs text-gray-600 uppercase">Статус</div>
                                </th>
                                {!isColumnHidden('groupService') && (
                                    <th className="px-4 py-3 text-left bg-gray-50">
                                        <div className="text-xs text-gray-600 uppercase">
                                            Группа услуг
                                        </div>
                                    </th>
                                )}
                                {!isColumnHidden('service') && (
                                    <th className="px-4 py-3 text-left bg-gray-50">
                                        <div className="text-xs text-gray-600 uppercase">
                                            Услуга
                                        </div>
                                    </th>
                                )}
                                {!isColumnHidden('materialType') && (
                                    <th className="px-4 py-3 text-left bg-gray-50">
                                        <div className="text-xs text-gray-600 uppercase">
                                            Тип материала
                                        </div>
                                    </th>
                                )}
                                <th className="px-4 py-3 text-right bg-blue-50">
                                    <div className="text-xs font-semibold text-blue-700 uppercase">
                                        Материалы (сом)
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-right bg-blue-50">
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
                            {data?.map((item: any) => {
                                const isExpanded = expandedRows.has(item.id);
                                const currentTab = activeTab[item.id] || 'materials';
                                return (
                                    <>
                                        <tr
                                            key={item.id}
                                            className="transition-colors border-b hover:bg-gray-50"
                                        >
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
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded">
                                                    {getShortStatus(item.status)}
                                                </span>
                                            </td>
                                            {!isColumnHidden('groupService') && (
                                                <td className="px-4 py-3 text-gray-600">
                                                    {item.groupService || '—'}
                                                </td>
                                            )}
                                            {!isColumnHidden('service') && (
                                                <td className="px-4 py-3 text-gray-600">
                                                    {item.service || '—'}
                                                </td>
                                            )}
                                            {!isColumnHidden('materialType') && (
                                                <td className="px-4 py-3 text-gray-600">
                                                    {item.materialType || '—'}
                                                </td>
                                            )}
                                            <td className="px-4 py-3 font-medium text-right text-gray-900 bg-blue-50/30">
                                                {item.total_price_material}
                                            </td>
                                            <td className="px-4 py-3 font-medium text-right text-gray-900 bg-blue-50/30">
                                                {item.total_price_service}
                                            </td>
                                            <td className="px-4 py-3 text-base font-bold text-right text-green-700 border-l bg-green-50/30">
                                                {item.total_price}
                                            </td>
                                            <td className="px-4 py-3 border-l">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
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

                                                        {/* Tab Content */}
                                                        {currentTab === 'materials' && (
                                                            <div>
                                                                <button className="px-3 py-1 mb-3 text-sm text-white transition-colors bg-blue-500 rounded-lg shadow-sm hover:bg-blue-700">
                                                                    +Добавить материал
                                                                </button>
                                                                <div className="overflow-hidden bg-white border rounded-lg shadow-sm">
                                                                    <table className="w-full text-sm">
                                                                        <thead>
                                                                            <tr className="text-xs text-gray-700 border-b bg-gray-50">
                                                                                <th className="px-3 py-2 text-left">
                                                                                    Тип
                                                                                </th>
                                                                                <th className="px-3 py-2 text-left">
                                                                                    Материал
                                                                                </th>
                                                                                <th className="px-3 py-2 text-left">
                                                                                    Ед. изм
                                                                                </th>
                                                                                <th className="px-3 py-2 text-right">
                                                                                    Кол-во
                                                                                </th>
                                                                                <th className="px-3 py-2 text-right">
                                                                                    Коэфф.
                                                                                </th>
                                                                                <th className="px-3 py-2 font-semibold text-right">
                                                                                    Валюта
                                                                                </th>
                                                                                <th className="px-3 py-2 text-right">
                                                                                    Цена
                                                                                </th>
                                                                                <th className="px-3 py-2 font-semibold text-right">
                                                                                    Сумма
                                                                                </th>
                                                                                <th className="px-3 py-2 text-left">
                                                                                    Примечание
                                                                                </th>
                                                                                <th className="px-3 py-2 text-center">
                                                                                    Действия
                                                                                </th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {item?.items
                                                                                ?.filter(
                                                                                    (
                                                                                        sub: MaterialEstimateItem,
                                                                                    ) =>
                                                                                        sub.item_type ===
                                                                                        1, // 1 - материал
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
                                                                                            <td className="px-3 py-3 text-gray-600">
                                                                                                {sub.material_type !=
                                                                                                null
                                                                                                    ? refs.materialTypes.lookup(
                                                                                                          sub.material_type,
                                                                                                      )
                                                                                                    : '—'}
                                                                                            </td>
                                                                                            <td className="px-3 py-3 font-medium text-gray-600">
                                                                                                {sub.material_id !=
                                                                                                null
                                                                                                    ? refs.materials.lookup(
                                                                                                          sub.material_id,
                                                                                                      )
                                                                                                    : '-'}
                                                                                            </td>

                                                                                            <td className="px-3 py-3 text-gray-600">
                                                                                                {sub.unit_of_measure !=
                                                                                                null
                                                                                                    ? refs.unitsOfMeasure.lookup(
                                                                                                          sub.unit_of_measure,
                                                                                                      )
                                                                                                    : '—'}
                                                                                            </td>
                                                                                            <td className="px-3 py-3 font-medium text-right text-gray-900">
                                                                                                {
                                                                                                    sub.quantity_planned
                                                                                                }
                                                                                            </td>
                                                                                            <td className="px-3 py-3 font-medium text-right text-gray-900">
                                                                                                {
                                                                                                    sub.coefficient
                                                                                                }
                                                                                            </td>
                                                                                            <td className="px-3 py-3 font-bold text-right text-blue-700">
                                                                                                {sub.currency !=
                                                                                                null
                                                                                                    ? refs.currencies.lookup(
                                                                                                          sub.currency,
                                                                                                      )
                                                                                                    : '—'}
                                                                                            </td>
                                                                                            <td className="px-3 py-3 font-medium text-right text-gray-900">
                                                                                                {
                                                                                                    sub.price
                                                                                                }
                                                                                            </td>
                                                                                            <td className="px-3 py-3 font-medium text-right text-gray-900">
                                                                                                {rowTotal(
                                                                                                    sub,
                                                                                                )}
                                                                                            </td>

                                                                                            <td className="px-3 py-3 text-xs text-gray-600">
                                                                                                {sub.comment ||
                                                                                                    '—'}
                                                                                            </td>
                                                                                            <td className="px-3 py-3">
                                                                                                <div className="flex items-center justify-center gap-1">
                                                                                                    <button className="p-1 text-gray-400 hover:text-blue-600">
                                                                                                        <Pencil className="w-3.5 h-3.5" />
                                                                                                    </button>
                                                                                                    <button className="p-1 text-gray-400 hover:text-red-600">
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

                                                        {currentTab === 'services' && (
                                                            <div>
                                                                <button className="px-4 py-2 mb-3 text-sm text-white transition-colors bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700">
                                                                    + ДОБАВИТЬ УСЛУГУ
                                                                </button>
                                                                <div className="overflow-hidden bg-white border rounded-lg shadow-sm">
                                                                    <table className="w-full text-sm">
                                                                        <thead>
                                                                            <tr className="text-xs text-gray-700 border-b bg-gray-50">
                                                                                <th className="px-3 py-2 text-left">
                                                                                    Группа услуг
                                                                                </th>
                                                                                <th className="px-3 py-2 text-left">
                                                                                    Услуга
                                                                                </th>
                                                                                <th className="px-3 py-2 text-left">
                                                                                    Ед. изм
                                                                                </th>
                                                                                <th className="px-3 py-2 text-right">
                                                                                    Кол-во
                                                                                </th>
                                                                                <th className="px-3 py-2 text-right">
                                                                                    Коэфф.
                                                                                </th>
                                                                                <th className="px-3 py-2 font-semibold text-right">
                                                                                    Валюта
                                                                                </th>
                                                                                <th className="px-3 py-2 text-right">
                                                                                    Цена
                                                                                </th>
                                                                                <th className="px-3 py-2 font-semibold text-right">
                                                                                    Сумма
                                                                                </th>
                                                                                <th className="px-3 py-2 text-left">
                                                                                    Примечание
                                                                                </th>
                                                                                <th className="px-3 py-2 text-center">
                                                                                    Действия
                                                                                </th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {item?.items
                                                                                ?.filter(
                                                                                    (
                                                                                        sub: MaterialEstimateItem,
                                                                                    ) =>
                                                                                        sub.item_type ===
                                                                                        2, //services
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
                                                                                            <td className="px-3 py-3 text-gray-600">
                                                                                                {sub.service_type !=
                                                                                                null
                                                                                                    ? refs.serviceTypes.lookup(
                                                                                                          sub.service_type,
                                                                                                      )
                                                                                                    : '—'}
                                                                                            </td>
                                                                                            <td className="px-3 py-3 font-medium text-gray-600">
                                                                                                {sub.service_id !=
                                                                                                null
                                                                                                    ? refs.services.lookup(
                                                                                                          sub.service_id,
                                                                                                      )
                                                                                                    : '-'}
                                                                                            </td>

                                                                                            <td className="px-3 py-3 text-gray-600">
                                                                                                {sub.unit_of_measure !=
                                                                                                null
                                                                                                    ? refs.unitsOfMeasure.lookup(
                                                                                                          sub.unit_of_measure,
                                                                                                      )
                                                                                                    : '—'}
                                                                                            </td>
                                                                                            <td className="px-3 py-3 font-medium text-right text-gray-900">
                                                                                                {
                                                                                                    sub.quantity_planned
                                                                                                }
                                                                                            </td>
                                                                                            <td className="px-3 py-3 font-medium text-right text-gray-900">
                                                                                                {
                                                                                                    sub.coefficient
                                                                                                }
                                                                                            </td>
                                                                                            <td className="px-3 py-3 font-bold text-right text-blue-700">
                                                                                                {sub.currency !=
                                                                                                null
                                                                                                    ? refs.currencies.lookup(
                                                                                                          sub.currency,
                                                                                                      )
                                                                                                    : '—'}
                                                                                            </td>
                                                                                            <td className="px-3 py-3 font-medium text-right text-gray-900">
                                                                                                {
                                                                                                    sub.price
                                                                                                }
                                                                                            </td>
                                                                                            <td className="px-3 py-3 font-medium text-right text-gray-900">
                                                                                                {rowTotal(
                                                                                                    sub,
                                                                                                )}
                                                                                            </td>

                                                                                            <td className="px-3 py-3 text-xs text-gray-600">
                                                                                                {sub.comment ||
                                                                                                    '—'}
                                                                                            </td>
                                                                                            <td className="px-3 py-3">
                                                                                                <div className="flex items-center justify-center gap-1">
                                                                                                    <button className="p-1 text-gray-400 hover:text-blue-600">
                                                                                                        <Pencil className="w-3.5 h-3.5" />
                                                                                                    </button>
                                                                                                    <button className="p-1 text-gray-400 hover:text-red-600">
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
                                                                {/* <div className="p-8 text-center text-gray-500 bg-white border rounded-lg">
                                                                    Услуги не добавлены
                                                                </div> */}
                                                            </div>
                                                        )}

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
                                    </>
                                );
                            })}
                            <tr className="font-bold border-t-2 border-green-600 bg-gradient-to-r from-green-50 to-green-100">
                                <td
                                    colSpan={
                                        isColumnHidden('groupService') &&
                                        isColumnHidden('service') &&
                                        isColumnHidden('materialType')
                                            ? 6
                                            : 9
                                    }
                                    className="px-4 py-4 text-base text-right text-gray-900"
                                >
                                    ИТОГО:
                                </td>
                                <td className="px-4 py-4 text-lg text-right text-green-700">
                                    {calculateTotal()}
                                </td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
