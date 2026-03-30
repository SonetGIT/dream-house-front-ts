import { useState, useMemo } from 'react';
import type { ReferenceResult } from '@/features/reference/referenceSlice';
import type { EstimateItem } from '../../pto/projectBlocks/estimatess/estimateItems/estimateItemsSlice';

interface MaterialsSelectTableProps {
    items: EstimateItem[];
    refs: Record<string, ReferenceResult>;
    calcRowTotal: (row: any) => number;
    projectId: number;
    blockId: number;
    onNext: (items: EstimateItem[]) => void;
}

export default function MaterialsItemSelectTable({
    items,
    refs,
    calcRowTotal,
    onNext,
}: MaterialsSelectTableProps) {
    //STATE
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);

    const materialItems = items.filter((i) => i.item_type === 1);

    //SELECT
    const isAllSelected = useMemo(() => {
        return materialItems.length > 0 && selectedIds.length === materialItems.length;
    }, [selectedIds, materialItems]);

    const toggleAll = () => {
        if (isAllSelected) {
            setSelectedIds([]);
        } else {
            setSelectedIds(materialItems.map((i) => i.id));
        }
    };

    const toggleOne = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
        );
    };

    const selectedItems = useMemo(() => {
        return materialItems.filter((i) => selectedIds.includes(i.id));
    }, [selectedIds, materialItems]);

    //RENDER
    return (
        <div className="overflow-hidden bg-white border rounded-lg shadow-sm">
            {/* ACTION BAR */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
                <div className="text-sm font-medium text-sky-600">
                    Выбрано: {selectedItems.length}
                </div>
                <button
                    className="px-4 py-2 text-sm font-medium text-white rounded-md bg-sky-600 hover:bg-sky-700 disabled:opacity-50"
                    disabled={!selectedItems.length || loading}
                    onClick={() => onNext(selectedItems)}
                >
                    Далее
                </button>
            </div>

            <table className="w-full">
                <thead className="text-gray-700 bg-gray-50">
                    <tr className="border-b">
                        <th className="px-3 py-2 text-xs">
                            <input type="checkbox" checked={isAllSelected} onChange={toggleAll} />
                        </th>
                        <th className="px-3 py-2 text-xs text-left">К заказу</th>
                        <th className="px-3 py-2 text-xs text-left">Этап</th>
                        <th className="px-3 py-2 text-xs text-left">Подэтап</th>
                        <th className="px-3 py-2 text-xs text-left">Тип</th>
                        <th className="px-3 py-2 text-xs text-left">Материал</th>
                        <th className="px-3 py-2 text-xs text-left">Ед. изм</th>
                        <th className="px-3 py-2 text-xs text-right">Кол-во</th>
                        <th className="px-3 py-2 text-xs text-right">Коэфф.</th>
                        <th className="px-3 py-2 text-xs text-right">Валюта</th>
                        <th className="px-3 py-2 text-xs text-right">Курс НБКР</th>
                        <th className="px-3 py-2 text-xs text-right">Цена</th>
                        <th className="px-3 py-2 text-xs text-right">Сумма</th>
                        <th className="px-3 py-2 text-xs text-right">Примечание</th>
                    </tr>
                </thead>

                <tbody>
                    {materialItems.map((sub) => {
                        const isSelected = selectedIds.includes(sub.id);

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
                                <td className="px-3 py-3 text-sm">
                                    <span
                                        className={
                                            sub.remaining > 0
                                                ? 'text-green-400'
                                                : sub.remaining === 0
                                                  ? 'text-yellow-400'
                                                  : 'text-red-400'
                                        }
                                    >
                                        {sub.remaining}
                                    </span>
                                </td>

                                <td className="px-3 py-3 text-sm">
                                    {refs.blockStages.lookup(Number(sub.stage_id))}
                                </td>

                                <td className="px-3 py-3 text-sm">
                                    {refs.stageSubsections.lookup(Number(sub.subsection_id))}
                                </td>

                                <td className="px-3 py-3 text-sm">
                                    {refs.materialTypes.lookup(Number(sub.material_type))}
                                </td>

                                <td className="px-3 py-3 text-sm">
                                    {refs.materials.lookup(Number(sub.material_id))}
                                </td>

                                <td className="px-3 py-3 text-sm">
                                    {refs.unitsOfMeasure.lookup(Number(sub.unit_of_measure))}
                                </td>

                                <td className="px-3 py-3 text-right">{sub.quantity_planned}</td>

                                <td className="px-3 py-3 text-right">{Number(sub.coefficient)}</td>

                                <td className="px-3 py-3 text-right text-blue-700">
                                    {refs.currencies.lookup(Number(sub.currency))}
                                </td>

                                <td className="px-3 py-3 text-right">{sub.currency_rate}</td>

                                <td className="px-3 py-3 text-right">{sub.price}</td>

                                <td className="px-3 py-3 font-medium text-right text-green-600">
                                    {calcRowTotal(sub)}
                                </td>

                                <td className="px-3 py-3 text-xs">{sub.comment || '—'}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
