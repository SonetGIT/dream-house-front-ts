import { Ban, Trash2, Truck } from 'lucide-react';
import { StyledTooltip } from '@/components/ui/StyledTooltip';
import type { ReferenceResult } from '@/features/reference/referenceSlice';
import type { PurchaseOrderItem } from './purchaseOrderItemsSlice';
import { purchaseOrderItemStatuses } from '@/utils/getStatusColor';
import React from 'react';

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
    const getStatusConfig = (statusId: number) => {
        return (
            purchaseOrderItemStatuses[statusId] || {
                label: 'Неизвестно',
                className: 'bg-gray-100 text-gray-800 border-gray-200',
            }
        );
    };
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
                        <th className="px-3 py-2 text-xs text-center w-52">Статус</th>
                        <th className="w-32 px-3 py-2 text-xs text-center">Доставлено</th>
                        <th className="w-24 px-3 py-2 text-xs text-center border-l">Действия</th>
                    </tr>
                </thead>

                <tbody>
                    {items.map((item) => {
                        const purchaseOrderItemStatuse = getStatusConfig(item.status);
                        const isConfirmed = item.status === 2;
                        const isRefused = item.status === 3;
                        const isDecisionMade = isConfirmed || isRefused;

                        const statusTitle = isConfirmed
                            ? 'Подтверждён поставщиком'
                            : isRefused
                              ? 'Отменён (нет у поставщика)'
                              : null;

                        return (
                            <React.Fragment key={item.id}>
                                <tr className="border-b hover:bg-gray-50">
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
                                    <td className="px-2 py-2 text-center text-gray-900 ">
                                        <span
                                            className={`
                                            inline-flex text-center px-2 py-0.5
                                            text-xs font-semibold border rounded-full
                                            ${purchaseOrderItemStatuse.className}
                                        `}
                                        >
                                            {item.status != null
                                                ? refs.purchaseOrderItemStatuses.lookup(
                                                      Number(item.status),
                                                  )
                                                : '—'}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                        {item.delivered_quantity ?? 0}
                                    </td>
                                    <td className="px-3 py-2 border-l">
                                        <div className="flex items-center justify-center gap-1">
                                            <div className="flex justify-center rounded">
                                                <StyledTooltip title={statusTitle || 'На поставку'}>
                                                    <span>
                                                        <button
                                                            disabled={isDecisionMade}
                                                            onClick={() => onForDelivery(item.id)}
                                                            className={`
                                                            p-1.5 transition-colors rounded
                                                            ${
                                                                isDecisionMade
                                                                    ? 'text-gray-300 cursor-not-allowed'
                                                                    : 'text-green-600 hover:text-white hover:bg-green-400'
                                                            }
                                                        `}
                                                        >
                                                            <Truck className="w-4 h-4" />
                                                        </button>
                                                    </span>
                                                </StyledTooltip>
                                            </div>

                                            <div className="flex justify-center rounded">
                                                <StyledTooltip
                                                    title={statusTitle || 'Отказано в поставке'}
                                                >
                                                    <span>
                                                        <button
                                                            disabled={isDecisionMade}
                                                            onClick={() =>
                                                                onRefusalToDeliver(item.id)
                                                            }
                                                            className={`
                                                            p-1.5 transition-colors rounded
                                                            ${
                                                                isDecisionMade
                                                                    ? 'text-gray-300 cursor-not-allowed'
                                                                    : 'text-red-600 hover:text-white hover:bg-red-400'
                                                            }
                                                        `}
                                                        >
                                                            <Ban className="w-4 h-4" />
                                                        </button>
                                                    </span>
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
                            </React.Fragment>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
