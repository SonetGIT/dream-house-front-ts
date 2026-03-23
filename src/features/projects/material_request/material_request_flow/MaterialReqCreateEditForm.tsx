import { Plus, Trash2 } from 'lucide-react';
import { useAppDispatch } from '@/app/store';

import ReferencesSelect from '@/components/ui/ReferencesSelect';
import type { ReferenceResult } from '@/features/reference/referenceSlice';

import type { EstimateItem } from '../../pto/projectBlocks/estimatess/estimateItems/estimateItemsSlice';
import { createMaterialReq } from '../materialRequestsSlice';

import { useMaterialRows, type MaterialRow } from './useMaterialRows';
import { parseNumber } from '@/utils/parseNumber';
import toast from 'react-hot-toast';

/* ================= PROPS ================= */

interface Props {
    projectId: number;
    blockId: number;

    initialItems?: EstimateItem[];
    refs: Record<string, ReferenceResult>;

    onCancel: () => void;
}

/* ================= COMPONENT ================= */

export default function MaterialReqCreateEditForm({
    projectId,
    blockId,
    initialItems = [],
    refs,
    onCancel,
}: Props) {
    const dispatch = useAppDispatch();

    const { rows, updateRow, addRow, removeRow } = useMaterialRows({
        initialItems,
        refs,
    });

    const materials = refs.materials?.data || [];
    const materialTypes = refs.materialTypes?.data || [];
    const units = refs.unitsOfMeasure?.data || [];
    const currencies = refs.currencies?.data || [];
    const blockStages = refs.blockStages?.data || [];
    const stageSubsections = refs.stageSubsections?.data || [];

    const calcSum = (row: MaterialRow) => {
        const total =
            (row.quantity || 0) *
            (row.price || 0) *
            (row.coefficient || 1) *
            (row.currency_rate || 1);
        return Number(total.toFixed(2));
    };

    const handleSubmit = async () => {
        try {
            await dispatch(
                createMaterialReq({
                    project_id: projectId,
                    block_id: blockId,
                    status: 1, //На одобрении
                    items: rows.map((r) => ({
                        item_type: r.isFromEstimate ? 1 : 2,
                        stage_id: r.stage_id,
                        subsection_id: r.subsection_id,
                        material_type: r.material_type,
                        material_id: r.material_id,
                        unit_of_measure: r.unit_of_measure,
                        quantity: r.quantity,
                        coefficient: r.coefficient,
                        currency: r.currency,
                        currency_rate: r.currency_rate,
                        price: r.price,
                        comment: r.comment,
                    })),
                }),
            ).unwrap();
            onCancel();
        } catch (e) {
            toast.error('Ошибка создания заявки');
        }
    };

    return (
        <div className="space-y-4">
            <div className="overflow-hidden bg-white border rounded-lg">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr className="text-xs text-gray-600 border-b">
                            <th className="px-3 py-2 text-sm text-left">Этап</th>
                            <th className="px-3 py-2 text-sm text-left">Подэтап</th>
                            <th className="px-3 py-2 text-sm text-left">Тип</th>
                            <th className="px-3 py-2 text-sm text-left">Материал</th>
                            <th className="px-3 py-2 text-sm text-left">Ед. изм</th>
                            <th className="px-3 py-2 text-sm text-right">Кол-во</th>
                            <th className="px-3 py-2 text-sm text-right">Коэфф.</th>
                            <th className="px-3 py-2 text-sm text-right">Валюта</th>
                            <th className="px-3 py-2 text-sm text-right">Курс</th>
                            <th className="px-3 py-2 text-sm text-right">Цена</th>
                            <th className="px-3 py-2 text-sm text-right">Сумма</th>
                            <th className="px-3 py-2 text-sm text-right">Примечание</th>
                            <th className="px-3 py-2 text-sm text-center">Действие</th>
                        </tr>
                    </thead>

                    <tbody>
                        {rows.map((row, index) => {
                            const isReadonly = row.isFromEstimate;

                            const filteredMaterials = row.material_type
                                ? materials.filter(
                                      (m: any) => Number(m.type) === Number(row.material_type),
                                  )
                                : [];

                            const filteredSubStages = row.stage_id
                                ? stageSubsections.filter(
                                      (s: any) => Number(s.stage_id) === Number(row.stage_id),
                                  )
                                : [];

                            return (
                                <tr key={index} className="border-b hover:bg-gray-50">
                                    {/* Этап */}
                                    <td className="px-3 py-2">
                                        <ReferencesSelect
                                            options={blockStages}
                                            value={row.stage_id}
                                            disabled={isReadonly}
                                            onChange={(v) => updateRow(index, 'stage_id', v)}
                                        />
                                    </td>

                                    {/* Подэтап */}
                                    <td className="px-3 py-2">
                                        <ReferencesSelect
                                            options={filteredSubStages}
                                            value={row.subsection_id}
                                            disabled={!row.stage_id || isReadonly}
                                            onChange={(v) => updateRow(index, 'subsection_id', v)}
                                        />
                                    </td>

                                    {/* Тип */}
                                    <td className="px-3 py-2">
                                        <ReferencesSelect
                                            options={materialTypes}
                                            value={row.material_type}
                                            disabled={isReadonly}
                                            onChange={(v) => updateRow(index, 'material_type', v)}
                                        />
                                    </td>

                                    {/* Материал */}
                                    <td className="px-3 py-2">
                                        <ReferencesSelect
                                            options={filteredMaterials}
                                            value={row.material_id}
                                            disabled={!row.material_type || isReadonly}
                                            onChange={(v) => updateRow(index, 'material_id', v)}
                                        />
                                    </td>

                                    {/* Ед */}
                                    <td className="px-3 py-2">
                                        <ReferencesSelect
                                            options={units}
                                            value={row.unit_of_measure}
                                            disabled={isReadonly}
                                            onChange={(v) => updateRow(index, 'unit_of_measure', v)}
                                        />
                                    </td>

                                    {/* Кол-во */}
                                    <td className="px-3 py-2">
                                        <input
                                            type="text"
                                            value={row.quantity}
                                            onChange={(e) =>
                                                updateRow(
                                                    index,
                                                    'quantity',
                                                    parseNumber(e.target.value),
                                                )
                                            }
                                            className="w-full px-2 py-1 text-right border rounded border-fuchsia-500"
                                        />
                                    </td>

                                    {/* Коэфф */}
                                    <td className="px-3 py-2">
                                        <input
                                            type="text"
                                            value={row.coefficient ?? ''}
                                            disabled={isReadonly}
                                            onChange={(e) =>
                                                updateRow(
                                                    index,
                                                    'coefficient',
                                                    e.target.value as any,
                                                )
                                            }
                                            onBlur={(e) =>
                                                updateRow(
                                                    index,
                                                    'coefficient',
                                                    parseNumber(e.target.value),
                                                )
                                            }
                                            className="w-full px-2 py-1.5 border rounded text-right"
                                        />
                                    </td>

                                    {/* Валюта */}
                                    <td className="px-3 py-2">
                                        <ReferencesSelect
                                            options={currencies}
                                            value={row.currency}
                                            disabled={isReadonly}
                                            onChange={(v) => updateRow(index, 'currency', v)}
                                        />
                                    </td>

                                    {/* Курс */}
                                    <td className="px-3 py-2">
                                        <input
                                            type="text"
                                            value={row.currency_rate}
                                            disabled={isReadonly}
                                            onChange={(e) =>
                                                updateRow(
                                                    index,
                                                    'currency_rate',
                                                    parseNumber(e.target.value),
                                                )
                                            }
                                            className="w-full px-2 py-1 text-right border rounded"
                                        />
                                    </td>

                                    {/* Цена */}
                                    <td className="px-3 py-2">
                                        <input
                                            type="text"
                                            value={row.price}
                                            disabled={isReadonly}
                                            onChange={(e) =>
                                                updateRow(
                                                    index,
                                                    'price',
                                                    parseNumber(e.target.value),
                                                )
                                            }
                                            className="w-full px-2 py-1 text-right border rounded"
                                        />
                                    </td>

                                    {/* Сумма */}
                                    <td className="px-3 py-2 text-right text-green-600">
                                        {calcSum(row)}
                                    </td>
                                    <td className="px-3 py-2 border">
                                        <input
                                            type="text"
                                            value={row.comment}
                                            onChange={(e) =>
                                                updateRow(index, 'comment', e.target.value)
                                            }
                                            className="w-full px-2 py-1.5 border rounded"
                                        />
                                    </td>

                                    {/* Delete */}
                                    <td className="px-3 py-2 text-center">
                                        <button
                                            onClick={() => removeRow(index)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-between">
                <button
                    onClick={addRow}
                    className="flex items-center px-4 py-2 text-sm text-white rounded bg-sky-600"
                >
                    <Plus className="w-4 h-4" />
                    Добавить материал
                </button>

                <div className="flex gap-2">
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 text-sm text-white bg-blue-600 rounded"
                    >
                        Создать заявку
                    </button>
                    <button onClick={onCancel} className="px-4 py-2 text-sm border rounded">
                        Отмена
                    </button>
                </div>
            </div>
        </div>
    );
}
