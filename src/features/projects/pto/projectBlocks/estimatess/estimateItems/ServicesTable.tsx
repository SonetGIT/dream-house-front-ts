import { Pencil, Trash2 } from 'lucide-react';
import type { MaterialEstimateItem } from './estimateItemsSlice';

interface ServicesTableProps {
    items: MaterialEstimateItem[];
    refs: any;
    rowTotal: (row: MaterialEstimateItem) => number;
    onDeleteEstimateItemId: (id: number) => void;
}

export default function ServicesTable({
    items,
    refs,
    rowTotal,
    onDeleteEstimateItemId,
}: ServicesTableProps) {
    return (
        <div className="overflow-hidden bg-white border rounded-lg shadow-sm">
            <table className="w-full text-sm">
                <thead className="text-gray-700 bg-gray-50">
                    <tr className="border-b">
                        <th className="px-3 py-2 text-xs text-left">Группа услуг</th>
                        <th className="px-3 py-2 text-xs text-left">Услуга</th>
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
                        .map((sub) => (
                            <tr
                                key={sub.id}
                                className="transition-colors border-b hover:bg-gray-50"
                            >
                                <td className="px-3 py-3 text-sm text-gray-600">
                                    {sub.service_type != null
                                        ? refs.serviceTypes.lookup(sub.service_type)
                                        : '—'}
                                </td>

                                <td className="px-3 py-3 text-sm text-gray-600">
                                    {sub.service_id != null
                                        ? refs.services.lookup(sub.service_id)
                                        : '-'}
                                </td>

                                <td className="px-3 py-3 text-sm text-gray-600">
                                    {sub.unit_of_measure != null
                                        ? refs.unitsOfMeasure.lookup(sub.unit_of_measure)
                                        : '—'}
                                </td>

                                <td className="px-3 py-3 text-sm text-right text-gray-900">
                                    {sub.quantity_planned}
                                </td>

                                <td className="px-3 py-3 text-sm text-right text-gray-900">
                                    {sub.coefficient}
                                </td>

                                <td className="px-3 py-3 text-sm text-right text-blue-700">
                                    {sub.currency != null
                                        ? refs.currencies.lookup(sub.currency)
                                        : '—'}
                                </td>
                                <td className="px-3 py-3 font-medium text-right">
                                    {sub.currency_rate}
                                </td>
                                <td className="px-3 py-3 font-medium text-right">{sub.price}</td>

                                <td className="px-3 py-3 font-medium text-right text-green-600">
                                    {rowTotal(sub)}
                                </td>

                                <td className="px-3 py-3 text-xs text-right text-gray-600">
                                    {sub.comment || '—'}
                                </td>

                                <td className="px-3 py-3">
                                    <div className="flex items-center justify-center gap-1">
                                        <button className="p-1 text-gray-400 hover:text-blue-600">
                                            <Pencil className="w-3.5 h-3.5" />
                                        </button>

                                        <button
                                            className="p-1 text-gray-400 hover:text-red-600"
                                            onClick={() => onDeleteEstimateItemId(sub.id)}
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                </tbody>
            </table>
        </div>
    );
}
