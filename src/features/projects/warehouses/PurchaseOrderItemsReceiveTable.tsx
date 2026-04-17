import { useEffect, useMemo, useState } from 'react';
import { Save } from 'lucide-react';
import type { ReferenceResult } from '@/features/reference/referenceSlice';
import {
    type PurchaseOrderItem,
    type ReceivePurchaseOrderItemPayload,
} from '../purchaseOrderItems/purchaseOrderItemsSlice';
import { parseNumber } from '@/utils/parseNumber';

type ReceiveEditableItem = PurchaseOrderItem & {
    received_quantity: number;
    comment: string;
};

interface PurchaseOrderItemsReceiveTableProps {
    items: PurchaseOrderItem[];
    refs: Record<string, ReferenceResult>;
    loading?: boolean;
    onSubmit: (items: ReceivePurchaseOrderItemPayload[]) => void;
    onCancel: () => void;
}

const getRemaining = (item: PurchaseOrderItem) => {
    return Math.max(Number(item.quantity || 0) - Number(item.delivered_quantity || 0), 0);
};

export default function PurchaseOrderItemsReceiveTable({
    items,
    refs,
    loading = false,
    onSubmit,
    onCancel,
}: PurchaseOrderItemsReceiveTableProps) {
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [editedItems, setEditedItems] = useState<ReceiveEditableItem[]>([]);

    useEffect(() => {
        setEditedItems(
            items.map((item) => ({
                ...item,
                received_quantity: getRemaining(item),
                comment: '',
            })),
        );
        setSelectedIds([]);
    }, [items]);

    const availableItems = useMemo(() => {
        return editedItems.filter((item) => getRemaining(item) > 0);
    }, [editedItems]);

    const selectedItems = useMemo(() => {
        return editedItems.filter(
            (item) => selectedIds.includes(item.id) && Number(item.received_quantity || 0) > 0,
        );
    }, [editedItems, selectedIds]);

    const isAllSelected = useMemo(() => {
        return availableItems.length > 0 && selectedIds.length === availableItems.length;
    }, [availableItems, selectedIds]);

    const toggleAll = () => {
        if (isAllSelected) {
            setSelectedIds([]);
            return;
        }

        setSelectedIds(availableItems.map((item) => item.id));
    };

    const toggleOne = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id],
        );
    };

    const updateRow = (
        id: number,
        field: 'received_quantity' | 'comment',
        value: number | string,
    ) => {
        setEditedItems((prev) =>
            prev.map((item) => {
                if (item.id !== id) return item;

                if (field === 'received_quantity') {
                    return {
                        ...item,
                        received_quantity: Math.max(Number(value) || 0, 0),
                    };
                }

                return {
                    ...item,
                    comment: String(value),
                };
            }),
        );
    };

    const handleSubmit = () => {
        const payload = selectedItems
            .map((item) => ({
                purchase_order_item_id: item.id,
                received_quantity: Math.max(Number(item.received_quantity || 0), 0),
                comment: item.comment || '',
            }))
            .filter((item) => item.received_quantity > 0);

        onSubmit(payload);
    };

    if (loading) {
        return <div className="p-4 text-sm text-gray-500">Загрузка...</div>;
    }

    if (!availableItems.length) {
        return (
            <div className="p-4 text-sm text-gray-400 border rounded-lg">
                Нет товаров, подтверждённых поставщиком, для приёмки
            </div>
        );
    }

    return (
        <div className="overflow-hidden bg-white border rounded-lg shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
                <div className="text-sm font-medium text-sky-600">
                    Выбрано: {selectedItems.length}
                </div>

                <div className="text-xs text-violet-500">
                    Доступно к приёмке: {availableItems.length}
                </div>
            </div>

            <table className="w-full">
                <thead className="text-gray-700 bg-gray-50">
                    <tr className="border-b">
                        <th className="px-3 py-2 text-xs">
                            <input type="checkbox" checked={isAllSelected} onChange={toggleAll} />
                        </th>
                        <th className="px-3 py-2 text-sm text-left">№ закупа</th>
                        <th className="px-3 py-2 text-sm text-left">Материал</th>
                        <th className="px-3 py-2 text-sm text-center w-28">Ед. изм</th>
                        <th className="px-3 py-2 text-sm text-center w-28">Заказано</th>
                        <th className="px-3 py-2 text-sm text-center w-28">Принято</th>
                        <th className="px-3 py-2 text-sm text-center w-28">Остаток</th>
                        <th className="w-32 px-3 py-2 text-sm text-center">Принять</th>
                        <th className="px-3 py-2 text-sm text-left">Комментарий</th>
                    </tr>
                </thead>

                <tbody>
                    {availableItems.map((item) => {
                        const isSelected = selectedIds.includes(item.id);
                        const remaining = getRemaining(item);

                        return (
                            <tr key={item.id} className="border-b bg-blue-50/40 hover:bg-gray-50">
                                <td className="px-1 py-1 text-center">
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => toggleOne(item.id)}
                                    />
                                </td>

                                <td className="px-2 py-2 text-center border bg-blue-50/40">
                                    {item.purchase_order_id}
                                </td>

                                <td className="px-2 py-2 border min-w-72 bg-blue-50/40">
                                    {refs.materials.lookup(Number(item.material_id))}
                                </td>

                                <td className="px-2 py-2 text-center border bg-blue-50/40">
                                    {refs.unitsOfMeasure.lookup(Number(item.unit_of_measure))}
                                </td>

                                <td className="px-2 py-2 text-center border bg-blue-50/40">
                                    {item.quantity}
                                </td>

                                <td className="px-2 py-2 text-center border bg-blue-50/40">
                                    {item.delivered_quantity ?? 0}
                                </td>

                                <td className="px-2 py-2 font-bold text-center text-green-700 border bg-green-50">
                                    {remaining}
                                </td>

                                <td
                                    className={`px-1 py-1 border ${
                                        isSelected ? 'bg-white' : 'bg-blue-50/40'
                                    }`}
                                >
                                    <input
                                        type="text"
                                        value={item.received_quantity}
                                        disabled={!isSelected}
                                        onChange={(e) =>
                                            updateRow(
                                                item.id,
                                                'received_quantity',
                                                parseNumber(e.target.value),
                                            )
                                        }
                                        className={`w-full px-2 py-1.5 border rounded text-right ${
                                            isSelected ? 'bg-white' : 'bg-blue-50/40'
                                        }`}
                                    />
                                </td>

                                <td
                                    className={`px-1 py-1 border ${
                                        isSelected ? 'bg-white' : 'bg-blue-50/40'
                                    }`}
                                >
                                    <input
                                        type="text"
                                        value={item.comment}
                                        disabled={!isSelected}
                                        onChange={(e) =>
                                            updateRow(item.id, 'comment', e.target.value)
                                        }
                                        placeholder="Комментарий"
                                        className={`w-full px-2 py-1.5 border rounded ${
                                            isSelected ? 'bg-white' : 'bg-blue-50/40'
                                        }`}
                                    />
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            <div className="flex justify-end gap-4 px-2 py-2 border-t bg-gray-50">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                    Отмена
                </button>

                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!selectedItems.length}
                    className="flex items-center gap-2 px-4 py-2 text-white border rounded-lg bg-sky-600 hover:bg-sky-700 disabled:opacity-50"
                >
                    <Save className="w-4 h-4" />
                    Принять
                </button>
            </div>
        </div>
    );
}
