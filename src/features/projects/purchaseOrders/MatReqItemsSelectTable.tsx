import { useState, useMemo, useEffect } from 'react';
import type { ReferenceResult } from '@/features/reference/referenceSlice';
import type { MaterialRequestItem } from '../material_request_items/materialRequestItemsSlice';
import { useCurrencyRates } from '@/utils/useCurrencyRates';
import { parseNumber } from '@/utils/parseNumber';
import ReferencesSelect from '@/components/ui/ReferencesSelect';
import { Save } from 'lucide-react';
import { fetchRecommendSuppliers, type SupplierRecommend } from '@/utils/fetchRecommendSuppliers';
import SupplierRecommendSelect from '@/components/ui/SupplierRecommendSelect';

export type EditableItem = MaterialRequestItem & {
    supplier_id?: number;
    best_price?: number;
};

interface MatReqItemsSelectTableProps {
    items: MaterialRequestItem[];
    refs: Record<string, ReferenceResult>;
    onSubmit: (items: EditableItem[]) => void;
    onCancel: () => void;
}

export default function MatReqItemsSelectTable({
    items,
    refs,
    onSubmit,
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

    // LOAD SUPPLIERS
    const loadSuppliers = async (item: EditableItem) => {
        if (!item.material_id || !item.currency) return;

        // кеш
        if (suppliersMap[item.id]) return;

        try {
            const data = await fetchRecommendSuppliers(item.material_id, item.currency);

            setSuppliersMap((prev) => ({
                ...prev,
                [item.id]: data,
            }));

            //АВТОПОДСТАНОВКА ЛУЧШЕГО
            const best = data?.[0];
            if (best?.best_price != null) {
                const best_price = best.best_price;
                setEditedItems((prev) =>
                    prev.map((row) =>
                        row.id === item.id
                            ? {
                                  ...row,
                                  price: best_price,
                                  best_price: best_price,
                                  supplier_id: best.id,
                              }
                            : row,
                    ),
                );
            }
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

                if (item) {
                    loadSuppliers(item);
                }

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
                        <th className="px-3 py-2 text-sm text-left">Материал</th>
                        <th className="px-3 py-2 text-sm text-center w-28">Ед.изм</th>
                        <th className="px-3 py-2 text-sm text-center w-28 ">Кол-во</th>
                        <th className="px-3 py-2 text-sm text-center w-36">Валюта</th>
                        <th className="px-3 py-2 text-sm text-center w-28">Курс НБКР</th>
                        <th className="px-3 py-2 text-sm text-center w-28">Цена</th>
                        <th className="px-3 py-2 text-sm text-right w-28">Сумма</th>
                        <th className="px-3 py-2 text-sm text-center w-80">Поставщик</th>
                        <th className="w-32 px-3 py-2 text-sm text-center ">Лучшая цена</th>
                    </tr>
                </thead>

                <tbody>
                    {editedItems?.map((sub) => {
                        const isSelected = selectedIds.includes(sub.id);
                        const suppliers = suppliersMap[sub.id] || [];

                        return (
                            <tr key={sub.id} className="border-b bg-blue-50/40 hover:bg-gray-50">
                                <td className="px-1 py-1 text-center">
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => toggleOne(sub.id)}
                                    />
                                </td>

                                <td className="px-1 py-1 border w-72 bg-blue-50/40">
                                    {refs.materials.lookup(Number(sub.material_id))}
                                </td>

                                <td className="px-1 py-1 text-center border w-28 bg-blue-50/40">
                                    {refs.unitsOfMeasure.lookup(Number(sub.unit_of_measure))}
                                </td>

                                <td
                                    className={`w-24 px-1 py-1 border ${
                                        isSelected ? 'bg-white' : 'bg-blue-50/40'
                                    }`}
                                >
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
                                        className={`w-full px-2 py-1.5 border rounded text-right ${
                                            isSelected ? 'bg-white' : 'bg-blue-50/40'
                                        }`}
                                    />
                                </td>

                                <td
                                    className={` px-1 py-1.5 border ${
                                        isSelected ? 'bg-white' : 'bg-blue-50/40'
                                    }`}
                                >
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

                                <td
                                    className={`w-24 px-1 py-1 border ${
                                        isSelected ? 'bg-white' : 'bg-blue-50/40'
                                    }`}
                                >
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
                                        className={`w-full px-2 py-1.5 border rounded text-right ${
                                            isSelected ? 'bg-white' : 'bg-blue-50/40'
                                        }`}
                                    />
                                </td>

                                <td
                                    className={`w-24 px-1 py-1 border ${
                                        isSelected ? 'bg-white' : 'bg-blue-50/40'
                                    }`}
                                >
                                    <input
                                        type="text"
                                        value={sub.price}
                                        disabled={!isSelected}
                                        onChange={(e) =>
                                            updateRow(sub.id, 'price', parseNumber(e.target.value))
                                        }
                                        className={`w-full px-2 py-1.5 border rounded text-right ${
                                            isSelected ? 'bg-white' : 'bg-blue-50/40'
                                        }`}
                                    />
                                </td>

                                <td className="px-1 py-1 font-bold text-right text-green-700 border bg-green-50">
                                    {calcSum(sub)}
                                </td>

                                {/* Поставщик */}
                                <td
                                    className={`px-1 py-1.5 border ${
                                        isSelected ? 'bg-white' : 'bg-blue-50/40'
                                    }`}
                                >
                                    <SupplierRecommendSelect
                                        suppliers={suppliers}
                                        value={sub.supplier_id}
                                        disabled={!isSelected}
                                        // onChange={(supplier) => {
                                        //     if (supplier.best_price != null) {
                                        //         updateRow(sub.id, 'supplier_id', supplier.id);
                                        //         updateRow(sub.id, 'price', supplier.best_price);
                                        //         updateRow(
                                        //             sub.id,
                                        //             'best_price',
                                        //             supplier.best_price,
                                        //         );
                                        //     }
                                        // }}
                                        onChange={(supplier) => {
                                            if (supplier.best_price != null) {
                                                updateRow(sub.id, 'supplier_id', supplier.id);
                                                updateRow(sub.id, 'price', supplier.best_price);
                                                updateRow(
                                                    sub.id,
                                                    'best_price',
                                                    supplier.best_price,
                                                );
                                            }
                                        }}
                                    />
                                </td>

                                <td
                                    className={`w-24 px-1 py-1 border ${
                                        isSelected ? 'bg-white' : 'bg-blue-50/40'
                                    }`}
                                >
                                    <input
                                        type="text"
                                        value={sub.best_price ?? ''}
                                        disabled={!isSelected}
                                        onChange={(e) =>
                                            updateRow(
                                                sub.id,
                                                'best_price',
                                                parseNumber(e.target.value),
                                            )
                                        }
                                        className={`w-full px-2 py-1.5 border rounded text-right ${
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
                    onClick={() => onSubmit(selectedItems)}
                    className="flex items-center gap-2 px-4 py-2 text-white border rounded-lg bg-sky-600 hover:bg-sky-700 disabled:opacity-50"
                    disabled={!selectedItems.length}
                >
                    <Save className="w-4 h-4" /> Создать
                </button>
            </div>
        </div>
    );
}
