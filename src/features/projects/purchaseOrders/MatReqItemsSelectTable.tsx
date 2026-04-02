import { useState, useMemo, useEffect } from 'react';
import type { ReferenceResult } from '@/features/reference/referenceSlice';
import type { MaterialRequestItem } from '../material_request_items/materialRequestItemsSlice';
import { useCurrencyRates } from '@/utils/useCurrencyRates';
import { parseNumber } from '@/utils/parseNumber';
import ReferencesSelect from '@/components/ui/ReferencesSelect';
import { Save } from 'lucide-react';
import { fetchRecommendSuppliers, type SupplierRecommend } from '@/utils/fetchRecommendSuppliers';
import SupplierRecommendSelect from '@/components/ui/SupplierRecommendSelect';

type EditableItem = MaterialRequestItem & {
    supplierRating_id?: number;
};

interface MatReqItemsSelectTableProps {
    items: MaterialRequestItem[];
    refs: Record<string, ReferenceResult>;
    onCancel: () => void;
}

export default function MatReqItemsSelectTable({
    items,
    refs,
    onCancel,
}: MatReqItemsSelectTableProps) {
    const rates = useCurrencyRates();

    // STATE
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [editedItems, setEditedItems] = useState<EditableItem[]>(items);
    const [suppliersMap, setSuppliersMap] = useState<Record<number, SupplierRecommend[]>>({});

    const currencies = refs.currencies?.data ?? [];

    useEffect(() => {
        setEditedItems(items);
    }, [items]);

    // ===== LOAD SUPPLIERS =====
    const loadSuppliers = async (item: MaterialRequestItem) => {
        if (!item.material_id || !item.currency) return;

        // кеш
        if (suppliersMap[item.id]) return;

        try {
            const data = await fetchRecommendSuppliers(item.material_id, item.currency);

            setSuppliersMap((prev) => ({
                ...prev,
                [item.id]: data,
            }));
        } catch (e) {
            console.error('Ошибка загрузки поставщиков', e);
        }
    };

    // SELECT
    const isAllSelected = useMemo(() => {
        return editedItems.length > 0 && selectedIds.length === editedItems.length;
    }, [selectedIds, editedItems]);

    const toggleAll = () => {
        if (isAllSelected) {
            setSelectedIds([]);
        } else {
            setSelectedIds(editedItems.map((i) => i.id));
            editedItems.forEach(loadSuppliers); // загрузка для всех
        }
    };

    const toggleOne = (id: number) => {
        setSelectedIds((prev) => {
            const isSelected = prev.includes(id);

            if (isSelected) {
                return prev.filter((i) => i !== id);
            } else {
                const item = editedItems.find((i) => i.id === id);
                if (item) loadSuppliers(item); //
                return [...prev, id];
            }
        });
    };

    const selectedItems = useMemo(() => {
        return editedItems.filter((i) => selectedIds.includes(i.id));
    }, [selectedIds, editedItems]);

    // EDIT
    const updateRow = (id: number, field: keyof EditableItem, value: any) => {
        setEditedItems((prev) =>
            prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
        );
    };

    const calcSum = (row: MaterialRequestItem) => {
        const total =
            (row.quantity || 0) *
            (row.price || 0) *
            (row.coefficient || 1) *
            (row.currency_rate || 1);
        return Number(isNaN(total) ? '0.00' : total.toFixed(2));
    };

    const renderStars = (rating: number) => {
        const fullStars = Math.round(rating);

        return '⭐'.repeat(fullStars);
    };

    // RENDER
    return (
        <div className="overflow-hidden bg-white border rounded-lg shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
                <div className="text-sm font-medium text-sky-600">
                    Выбрано: {selectedItems.length}
                </div>
            </div>

            <table className="w-full">
                <thead className="text-gray-700 bg-gray-50">
                    <tr className="border-b">
                        <th className="px-3 py-2 text-xs">
                            <input type="checkbox" checked={isAllSelected} onChange={toggleAll} />
                        </th>
                        <th className="w-64 px-3 py-2 text-sm text-left">Материал</th>
                        <th className="px-3 py-2 text-sm text-center">Ед.изм</th>
                        <th className="px-3 py-2 text-sm text-center">Кол-во</th>
                        <th className="px-3 py-2 text-sm text-center">Валюта</th>
                        <th className="px-3 py-2 text-sm text-center">Курс НБКР</th>
                        <th className="px-3 py-2 text-sm text-center">Цена</th>
                        <th className="px-3 py-2 text-sm text-right">Сумма</th>
                        <th className="px-3 py-2 text-sm text-center w-72">Поставщик</th>
                        <th className="px-3 py-2 text-sm text-center">Лучшая цена</th>
                    </tr>
                </thead>

                <tbody>
                    {editedItems?.map((sub) => {
                        const isSelected = selectedIds.includes(sub.id);
                        const suppliers = suppliersMap[sub.id] || [];

                        return (
                            <tr
                                key={sub.id}
                                className={`border-b ${
                                    isSelected ? 'bg-blue-50/40' : 'hover:bg-gray-50'
                                }`}
                            >
                                <td className="px-3 py-3">
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => toggleOne(sub.id)}
                                    />
                                </td>

                                <td className="w-64 px-1 py-1 border">
                                    {refs.materials.lookup(Number(sub.material_id))}
                                </td>

                                <td className="px-1 py-1 text-center border">
                                    {refs.unitsOfMeasure.lookup(Number(sub.unit_of_measure))}
                                </td>

                                <td className="px-1 py-1 border">
                                    <input
                                        type="text"
                                        value={sub.quantity}
                                        disabled={!isSelected}
                                        onChange={(e) =>
                                            updateRow(
                                                sub.id,
                                                'quantity',
                                                parseNumber(e.target.value),
                                            )
                                        }
                                        className="w-full px-2 py-1.5 border rounded text-right"
                                    />
                                </td>

                                <td className="px-1 py-1 border">
                                    <ReferencesSelect
                                        options={currencies}
                                        value={sub.currency}
                                        disabled={!isSelected}
                                        onChange={(v) => {
                                            updateRow(sub.id, 'currency', v);

                                            if (!v) return;

                                            const rate = rates.find(
                                                (r) => Number(r.currency_id) === Number(v),
                                            )?.rate;

                                            updateRow(sub.id, 'currency_rate', rate ?? 1);

                                            loadSuppliers({ ...sub, currency: v }); //
                                        }}
                                    />
                                </td>

                                <td className="px-1 py-1 border">
                                    <input
                                        type="text"
                                        value={sub.currency_rate}
                                        disabled={!isSelected}
                                        onChange={(e) =>
                                            updateRow(
                                                sub.id,
                                                'currency_rate',
                                                parseNumber(e.target.value),
                                            )
                                        }
                                        className="w-full px-2 py-1.5 border rounded text-right"
                                    />
                                </td>

                                <td className="px-1 py-1 border">
                                    <input
                                        type="text"
                                        value={sub.price}
                                        disabled={!isSelected}
                                        onChange={(e) =>
                                            updateRow(sub.id, 'price', parseNumber(e.target.value))
                                        }
                                        className="w-full px-2 py-1.5 border rounded text-right"
                                    />
                                </td>

                                <td className="px-1 py-1 font-bold text-right text-green-700 border bg-green-50">
                                    {calcSum(sub)}
                                </td>
                                {/* Поставщик */}
                                <td className="px-1 py-1 border w-72">
                                    <SupplierRecommendSelect
                                        suppliers={suppliers}
                                        value={sub.supplierRating_id}
                                        disabled={!isSelected}
                                        onChange={(supplier) => {
                                            updateRow(sub.id, 'supplierRating_id', supplier.id);
                                            console.log('isSele', isSelected);
                                            if (supplier.best_price != null) {
                                                updateRow(sub.id, 'price', supplier.best_price);
                                            }
                                        }}
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
                    className="flex items-center gap-2 px-4 py-2 text-white border rounded-lg bg-sky-600 hover:bg-sky-700 disabled:opacity-50"
                    disabled={!selectedItems.length}
                >
                    <Save className="w-4 h-4" /> Создать
                </button>
            </div>
        </div>
    );
}
