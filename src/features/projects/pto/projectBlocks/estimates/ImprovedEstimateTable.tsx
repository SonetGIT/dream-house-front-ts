import { Pencil, Trash2, ChevronDown, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import type { MaterialEstimate } from './materialEstimatesSlice';
import { formatDateTime } from '@/utils/formatDateTime';

interface ImprovedEstimateTableProps {
    blockId: number;
    data: MaterialEstimate[];
}

export function ImprovedEstimateTable({ data }: ImprovedEstimateTableProps) {
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set(['i1']));
    const [activeTab, setActiveTab] = useState<{ [key: string]: string }>({ i1: 'materials' });
    const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(
        new Set(['groupService', 'service', 'materialType']),
    );

    const toggleRow = (id: string) => {
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

    const setTabForRow = (rowId: string, tab: string) => {
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

    // const formatNumber = (num: number) => {
    //     if (num === 0) return '—';
    //     return num.formatDateTime('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    // };

    const calculateTotal = () => {
        // return data.reduce((sum, item) => sum + item.total_area, 0);
        return data.reduce((sum, item) => sum + 2000, 0);
    };

    const isColumnHidden = (column: string) => hiddenColumns.has(column);

    return (
        <div className="space-y-4">
            {/* Column Visibility Controls */}
            <div className="bg-white border rounded-lg p-3">
                <div className="flex items-center gap-2 flex-wrap">
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

            {/* Table */}
            <div className="bg-white border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-gray-50 z-10">
                            <tr className="border-b">
                                <th className="px-4 py-3 text-left w-12 bg-gray-50"></th>
                                <th className="px-4 py-3 text-left w-24 bg-gray-50">
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
                                <th className="px-4 py-3 text-left bg-blue-50 border-l">
                                    <div className="text-xs text-blue-700 uppercase font-semibold">
                                        Пользователь
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-right bg-blue-50">
                                    <div className="text-xs text-blue-700 uppercase font-semibold">
                                        Материалы (сом)
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-right bg-blue-50">
                                    <div className="text-xs text-blue-700 uppercase font-semibold">
                                        Услуги (сом)
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-right bg-green-50 border-l">
                                    <div className="text-xs text-green-700 uppercase font-semibold">
                                        Стоимость (сом)
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-center w-24 bg-gray-50 border-l">
                                    <div className="text-xs text-gray-600 uppercase">Действия</div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.map((item: any) => {
                                const isExpanded = expandedRows.has(item.id);
                                const currentTab = activeTab[item.id] || 'materials';
                                return (
                                    <>
                                        <tr
                                            key={item.id}
                                            className="border-b hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => toggleRow(item.id)}
                                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                                >
                                                    {isExpanded ? (
                                                        <ChevronDown className="w-4 h-4" />
                                                    ) : (
                                                        <ChevronRight className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                                    Черн.
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
                                            <td className="px-4 py-3 text-gray-900 border-l bg-blue-50/30">
                                                {item.user || 'Системы Админ'}
                                            </td>
                                            <td className="px-4 py-3 text-right text-gray-900 font-medium bg-blue-50/30">
                                                {formatDateTime(item.pricePerUnit)}
                                            </td>
                                            <td className="px-4 py-3 text-right text-gray-900 font-medium bg-blue-50/30">
                                                {formatDateTime(item.pricePerService)}
                                            </td>
                                            <td className="px-4 py-3 text-right text-green-700 font-bold text-base border-l bg-green-50/30">
                                                {formatDateTime(item.totalCost)}
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
                                            <tr className="bg-gradient-to-r from-blue-50 to-blue-50/50 border-b">
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
                                                                <button className="mb-3 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                                                                    + ДОБАВИТЬ МАТЕРИАЛ
                                                                </button>
                                                                <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
                                                                    <table className="w-full text-sm">
                                                                        <thead>
                                                                            <tr className="bg-gray-50 border-b text-xs text-gray-700">
                                                                                <th className="px-3 py-2 text-left">
                                                                                    Материал
                                                                                </th>
                                                                                <th className="px-3 py-2 text-left">
                                                                                    Тип
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
                                                                                <th className="px-3 py-2 text-right">
                                                                                    Цена (сом)
                                                                                </th>
                                                                                <th className="px-3 py-2 text-right font-semibold">
                                                                                    Сумма (сом)
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
                                                                            {item.material && (
                                                                                <tr className="border-b hover:bg-gray-50 transition-colors">
                                                                                    <td className="px-3 py-3 text-gray-900 font-medium">
                                                                                        {
                                                                                            item.material
                                                                                        }
                                                                                    </td>
                                                                                    <td className="px-3 py-3 text-gray-600">
                                                                                        {item.materialType ||
                                                                                            'Строит. материалы'}
                                                                                    </td>
                                                                                    <td className="px-3 py-3 text-gray-600">
                                                                                        {item.unit}
                                                                                    </td>
                                                                                    <td className="px-3 py-3 text-right text-gray-900 font-medium">
                                                                                        {
                                                                                            item.quantity
                                                                                        }
                                                                                    </td>
                                                                                    <td className="px-3 py-3 text-right text-gray-900 font-medium">
                                                                                        {
                                                                                            item.coefficient
                                                                                        }
                                                                                    </td>
                                                                                    <td className="px-3 py-3 text-right text-gray-900 font-medium">
                                                                                        {formatDateTime(
                                                                                            item.price,
                                                                                        )}
                                                                                    </td>
                                                                                    <td className="px-3 py-3 text-right text-blue-700 font-bold">
                                                                                        {formatDateTime(
                                                                                            /* item.quantity *
                                                                                                item.coefficient *   */
                                                                                            item.price,
                                                                                        )}
                                                                                    </td>
                                                                                    <td className="px-3 py-3 text-gray-600 text-xs">
                                                                                        {item.note ||
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
                                                                            )}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {currentTab === 'services' && (
                                                            <div>
                                                                <button className="mb-3 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                                                                    + ДОБАВИТЬ УСЛУГУ
                                                                </button>
                                                                <div className="bg-white border rounded-lg p-8 text-center text-gray-500">
                                                                    Услуги не добавлены
                                                                </div>
                                                            </div>
                                                        )}

                                                        {currentTab === 'history' && (
                                                            <div className="bg-white border rounded-lg p-6">
                                                                <div className="space-y-3">
                                                                    <div className="flex items-start gap-3 pb-3 border-b">
                                                                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                                                                        <div className="flex-1">
                                                                            <div className="text-sm font-medium text-gray-900">
                                                                                Смета создана
                                                                            </div>
                                                                            <div className="text-xs text-gray-500 mt-1">
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
                            <tr className="bg-gradient-to-r from-green-50 to-green-100 font-bold border-t-2 border-green-600">
                                <td
                                    colSpan={
                                        isColumnHidden('groupService') &&
                                        isColumnHidden('service') &&
                                        isColumnHidden('materialType')
                                            ? 6
                                            : 9
                                    }
                                    className="px-4 py-4 text-right text-gray-900 text-base"
                                >
                                    ИТОГО:
                                </td>
                                <td className="px-4 py-4 text-right text-green-700 text-lg">
                                    {/* {formatDateTime(calculateTotal())} */}
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
