import type { ReferenceResult } from '@/features/reference/referenceSlice';
import type { WarehouseItem } from './warehouseStocksSlice';
import { useMemo, useState } from 'react';
import ReferencesSelect from '@/components/ui/ReferencesSelect';
import { parseNumber } from '@/utils/parseNumber';
import type { Pagination } from '@/features/users/userSlice';
import { TablePagination } from '@/components/ui/TablePagination';

type WarehouseItemProps = {
    items: WarehouseItem[];
    whItemPagination: Pagination | null;
    refs: Record<string, ReferenceResult>;
    // onDelete: (id: number) => void;
    onPageChange?: (page: number) => void;
    onSizeChange?: (size: number) => void;
    // onUpdateEstimateItem?: (id: number, data: Partial<EstimateItem>) => void;
};

export default function WarehouseStocksTable({
    items,
    whItemPagination,
    refs,
    // onDelete,
    onPageChange,
    onSizeChange,
}: WarehouseItemProps) {
    //STATE
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editedData, setEditedData] = useState<Partial<WarehouseItem>>({});
    // const rates = useCurrencyRates();

    //REFERENCES
    const materialTypes = refs.materialTypes?.data || [];
    const materials = refs.materials?.data || [];
    const units = refs.unitsOfMeasure?.data || [];

    //MEMOIZED LOOKUPS
    const materialsByType = useMemo(() => {
        const map: Record<number, any[]> = {};

        materials.forEach((m: any) => {
            const type = Number(m.type);
            if (!map[type]) map[type] = [];
            map[type].push(m);
        });

        return map;
    }, [materials]);

    //HANDLERS
    // const handleEdit = (item: EstimateItem) => {
    //     setEditingId(item.id);
    //     setEditedData({ ...item });
    // };

    // const handleSave = async () => {
    //     if (onUpdateEstimateItem && editingId !== null) {
    //         await onUpdateEstimateItem(editingId, editedData);
    //     }

    //     setEditingId(null);
    //     setEditedData({});
    // };

    // const handleCancel = () => {
    //     setEditingId(null);
    //     setEditedData({});
    // };

    const handleChange = (key: keyof WarehouseItem, value: any) => {
        setEditedData((prev) => {
            const updated = { ...prev, [key]: value };

            if (key === 'material_type') {
                updated.material_id = null;
                updated.unit_of_measure = null;
            }

            if (key === 'material_id') {
                const material = materials.find((m: any) => Number(m.id) === Number(value));

                if (material?.unit_of_measure) {
                    updated.unit_of_measure = Number(material.unit_of_measure);
                }
            }
            return updated;
        });
    };
    if (!items?.length) {
        return (
            <div className="w-full p-4 overflow-hidden text-sm text-center text-gray-400 bg-white border rounded-xl">
                Позиции в складе отсутствуют
            </div>
        );
    }
    /*******************************************************************************************************************/
    return (
        <div className="overflow-hidden bg-white border rounded-lg shadow-sm">
            <table className="w-full">
                <thead className="text-gray-700 bg-gray-50">
                    <tr className="border-b">
                        <th className="px-3 py-2 text-sm text-left">№</th>
                        <th className="px-3 py-2 text-sm text-left">Тип материала</th>
                        <th className="px-3 py-2 text-sm text-left">Материал</th>
                        <th className="px-3 py-2 text-sm text-left">Ед. изм</th>
                        <th className="px-3 py-2 text-sm text-right">Кол-во</th>
                        <th className="px-3 py-2 text-sm text-right">Мин. кол-во</th>
                        <th className="px-3 py-2 text-sm text-right">Мах. кол-во</th>
                    </tr>
                </thead>

                <tbody>
                    {items.map((whItem) => {
                        const isEditing = editingId === whItem.id;
                        const data = isEditing ? editedData : whItem;
                        const filteredMaterials = data.material_type
                            ? materialsByType[Number(data.material_type)] || []
                            : [];
                        return (
                            <tr
                                key={whItem.id}
                                className={`transition-colors border-b ${isEditing ? 'bg-blue-50/30' : 'hover:bg-gray-50'}`}
                            >
                                <td className="px-3 py-2.5 text-xs text-gray-700 font-medium">
                                    {whItem.id}
                                </td>
                                {/* Тип материала */}
                                <td className="px-3 py-3 text-sm text-gray-600">
                                    {isEditing ? (
                                        <ReferencesSelect
                                            options={materialTypes}
                                            value={data.material_type}
                                            onChange={(v) => handleChange('material_type', v)}
                                        />
                                    ) : whItem.material_type != null ? (
                                        refs.materialTypes.lookup(whItem.material_type)
                                    ) : (
                                        '—'
                                    )}
                                </td>

                                {/* Материал */}
                                <td className="px-3 py-3 text-sm text-gray-600">
                                    {isEditing ? (
                                        <ReferencesSelect
                                            options={filteredMaterials}
                                            value={data.material_id}
                                            disabled={!data.material_type}
                                            onChange={(v) => handleChange('material_id', v)}
                                        />
                                    ) : whItem.material_id != null ? (
                                        refs.materials.lookup(whItem.material_id)
                                    ) : (
                                        '—'
                                    )}
                                </td>

                                {/* Единица измерения */}
                                <td className="px-3 py-3 text-sm text-gray-600">
                                    {isEditing ? (
                                        <ReferencesSelect
                                            options={units}
                                            value={data.unit_of_measure}
                                            onChange={(v) => handleChange('unit_of_measure', v)}
                                        />
                                    ) : whItem.unit_of_measure != null ? (
                                        refs.unitsOfMeasure.lookup(whItem.unit_of_measure)
                                    ) : (
                                        '—'
                                    )}
                                </td>

                                {/* Количество */}
                                <td className="px-3 py-3 text-sm text-right text-gray-900">
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={data.quantity ?? ''}
                                            onChange={(e) =>
                                                handleChange('quantity', e.target.value)
                                            }
                                            onBlur={(e) =>
                                                handleChange(
                                                    'quantity',
                                                    parseNumber(e.target.value),
                                                )
                                            }
                                            className="w-full px-2 py-1.5 text-sm border rounded text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    ) : (
                                        whItem.quantity
                                    )}
                                </td>

                                {/* Мин */}
                                <td className="px-3 py-3 text-sm text-right text-gray-900">
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={data.min ?? ''}
                                            onChange={(e) => handleChange('min', e.target.value)}
                                            onBlur={(e) =>
                                                handleChange('min', parseNumber(e.target.value))
                                            }
                                            className="w-full px-2 py-1.5 text-sm border rounded text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    ) : (
                                        whItem.min
                                    )}
                                </td>
                                {/* Мах*/}
                                <td className="px-3 py-3 text-sm text-right text-gray-900">
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={data.max ?? ''}
                                            onChange={(e) => handleChange('max', e.target.value)}
                                            onBlur={(e) =>
                                                handleChange('max', parseNumber(e.target.value))
                                            }
                                            className="w-full px-2 py-1.5 text-sm border rounded text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    ) : (
                                        whItem.max
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            {whItemPagination && (
                <TablePagination
                    pagination={whItemPagination}
                    onPageChange={(newPage) => {
                        onPageChange?.(newPage);
                    }}
                    onSizeChange={(newSize) => {
                        onSizeChange?.(newSize);
                    }}
                    sizeOptions={[10, 25, 50, 100]}
                    showFirstButton
                    showLastButton
                />
            )}
        </div>
    );
}
