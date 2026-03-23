import ReferencesSelect from '@/components/ui/ReferencesSelect';
import { parseNumber } from '@/utils/parseNumber';
import { Trash2 } from 'lucide-react';

import type { ReferenceResult } from '@/features/reference/referenceSlice';
import type { MaterialRow } from './useMaterialRows';

/* ================= TYPES ================= */

interface Props {
    row: MaterialRow;
    index: number;
    refs: Record<string, ReferenceResult>;

    updateRow: <K extends keyof MaterialRow>(index: number, key: K, value: MaterialRow[K]) => void;

    removeRow: (index: number) => void;
}

/* ================= COMPONENT ================= */

export default function MaterialRow({ row, index, refs, updateRow, removeRow }: Props) {
    const isReadonly = row.isFromEstimate;

    const materials = refs.materials?.data || [];
    const materialTypes = refs.materialTypes?.data || [];

    const filteredMaterials = row.material_type
        ? materials.filter((m: any) => Number(m.type) === Number(row.material_type))
        : [];

    return (
        <tr className="border-b hover:bg-gray-50">
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

            {/* Кол-во */}
            <td className="px-3 py-2">
                <input
                    type="text"
                    value={row.quantity}
                    onChange={(e) => updateRow(index, 'quantity', parseNumber(e.target.value))}
                    className="w-full px-2 py-1 text-right border rounded"
                />
            </td>

            {/* Delete */}
            <td className="px-3 py-2 text-center">
                <button
                    type="button"
                    onClick={() => removeRow(index)}
                    className="text-red-500 hover:text-red-700"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </td>
        </tr>
    );
}
