import { useState, useMemo } from 'react';
import type { ReferenceResult } from '@/features/reference/referenceSlice';
import type { EstimateItem } from '../../pto/projectBlocks/estimatess/estimateItems/estimateItemsSlice';

interface MaterialsSelectTableProps {
    items: EstimateItem[];
    loading: boolean;
    refs: Record<string, ReferenceResult>;
    calcRowTotal: (row: any) => number;
    projectId: number;
    blockId: number;
    onNext: (items: EstimateItem[]) => void;
}

//компонент для выбора материалов из заявок на материалы (одобренные), которые будут добавлены в заявку на закупку.
export default function MaterialsItemSelectTable({
    items,
    loading,
    refs,
    calcRowTotal,
    blockId,
    onNext,
}: MaterialsSelectTableProps) {
    //STATE
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const blockStages = refs.blockStages?.data || [];

    const currentBlockStageIds = useMemo(() => {
        return new Set(
            blockStages
                .filter((stage: any) => Number(stage.block_id) === Number(blockId))
                .map((stage: any) => Number(stage.id)),
        );
    }, [blockId, blockStages]);

    const materialItems = useMemo(() => {
        return items.filter((item) => {
            if (item.item_type !== 1) return false;
            if (item.stage_id == null) return true;

            return currentBlockStageIds.has(Number(item.stage_id));
        });
    }, [items, currentBlockStageIds]);

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

                                <td className="px-3 py-3 text-sm text-left">
                                    {refs.blockStages.lookup(Number(sub.stage_id))}
                                </td>

                                <td className="px-3 py-3 text-sm text-left">
                                    {refs.stageSubsections.lookup(Number(sub.subsection_id))}
                                </td>

                                <td className="px-3 py-3 text-sm text-left">
                                    {refs.materialTypes.lookup(Number(sub.material_type))}
                                </td>

                                <td className="px-3 py-3 text-sm text-left">
                                    {refs.materials.lookup(Number(sub.material_id))}
                                </td>

                                <td className="px-3 py-3 text-sm text-left">
                                    {refs.unitsOfMeasure.lookup(Number(sub.unit_of_measure))}
                                </td>
                                <td className="px-3 py-3 text-sm text-right whitespace-nowrap">
                                    <span
                                        className={
                                            sub.remaining > 0
                                                ? 'font-medium text-green-600'
                                                : sub.remaining === 0
                                                  ? 'text-yellow-500'
                                                  : 'text-red-400'
                                        }
                                    >
                                        {sub.remaining}
                                    </span>
                                    <span className="mx-1 text-gray-400">/</span>
                                    <span className="text-gray-700">{sub.quantity_planned}</span>
                                </td>
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
