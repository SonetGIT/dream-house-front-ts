import { Ban, Trash2, Truck } from 'lucide-react';
import { StyledTooltip } from '@/components/ui/StyledTooltip';
import type { ReferenceResult } from '@/features/reference/referenceSlice';
import type { PurchaseOrderItem } from './purchaseOrderItemsSlice';

interface PropsType {
    items: PurchaseOrderItem[];
    refs: Record<string, ReferenceResult>;
    onDelete: (id: number) => void;
    onForDelivery: (id: number) => void;
    onRefusalToDeliver: (id: number) => void;
}

export default function PurchaseOrdersItemsTable({
    items,
    refs,
    onDelete,
    onForDelivery,
    onRefusalToDeliver,
}: PropsType) {
    const calcSum = (item: PurchaseOrderItem) => {
        return Number(
            (
                (Number(item.quantity) || 0) *
                (Number(item.price) || 0) *
                (Number(item.currency_rate) || 1)
            ).toFixed(2),
        );
    };

    if (!items?.length) {
        return (
            <div className="px-4 py-6 text-sm text-center text-gray-500">
                Позиции закупки отсутствуют
            </div>
        );
    }

    return (
        <div className="overflow-hidden border rounded-lg">
            <table className="w-full">
                <thead className="bg-gray-50">
                    <tr className="text-xs border-b">
                        <th className="px-3 py-2 text-xs text-left ">Материал</th>
                        <th className="px-3 py-2 text-xs text-center w-28">Ед. изм</th>
                        <th className="px-3 py-2 text-xs text-center w-28">Кол-во</th>
                        <th className="px-3 py-2 text-xs text-center w-28">Валюта</th>
                        <th className="px-3 py-2 text-xs text-center w-28">Курс</th>
                        <th className="px-3 py-2 text-xs text-center w-28">Цена</th>
                        <th className="w-32 px-3 py-2 text-xs text-right">Сумма</th>
                        <th className="w-32 px-3 py-2 text-xs text-center">Статус</th>
                        <th className="w-32 px-3 py-2 text-xs text-center">Доставлено</th>
                        <th className="w-24 px-3 py-2 text-xs text-center border-l">Действия</th>
                    </tr>
                </thead>

                <tbody>
                    {items.map((item) => (
                        <tr key={item.id} className="border-b hover:bg-gray-50">
                            <td className="px-3 py-2">
                                {refs.materials.lookup(Number(item.material_id))}
                            </td>
                            <td className="px-3 py-2 text-center">
                                {refs.unitsOfMeasure.lookup(Number(item.unit_of_measure))}
                            </td>
                            <td className="px-3 py-2 text-center">{item.quantity}</td>
                            <td className="px-3 py-2 text-center">
                                {refs.currencies.lookup(Number(item.currency))}
                            </td>
                            <td className="px-3 py-2 text-center">{item.currency_rate}</td>
                            <td className="px-3 py-2 text-center">{item.price}</td>
                            <td className="px-3 py-2 font-medium text-right text-green-700">
                                {calcSum(item)}
                            </td>
                            <td className="px-3 py-2 text-center">
                                <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold text-violet-500 bg-violet-100 border border-violet-200 rounded">
                                    {refs.purchaseOrderItemStatuses.lookup(Number(item.status))}
                                </span>
                            </td>
                            <td className="px-3 py-2 text-center">
                                {item.delivered_quantity ?? 0}
                            </td>

                            <td className="px-3 py-2 border-l">
                                <div className="flex items-center justify-center gap-1">
                                    <div className="flex justify-center rounded">
                                        <StyledTooltip title="На поставку">
                                            <button
                                                onClick={() => onForDelivery(item.id)}
                                                className="p-1.5 text-green-600 transition-colors hover:text-white hover:bg-green-400"
                                            >
                                                <Truck className="w-4 h-4" />
                                            </button>
                                        </StyledTooltip>
                                    </div>
                                    <div className="flex justify-center rounded">
                                        <StyledTooltip title="Отказано в поставке">
                                            <button
                                                onClick={() => onRefusalToDeliver(item.id)}
                                                className="p-1.5 text-red-600 transition-colors hover:text-white hover:bg-red-400"
                                            >
                                                <Ban className="w-4 h-4" />
                                            </button>
                                        </StyledTooltip>
                                    </div>
                                    <div className="flex justify-center">
                                        <StyledTooltip title="Удалить">
                                            <button
                                                onClick={() => onDelete(item.id)}
                                                className="p-1.5 text-gray-400 rounded hover:text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </StyledTooltip>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
