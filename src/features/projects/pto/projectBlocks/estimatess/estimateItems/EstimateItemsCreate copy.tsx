import { useState } from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';
import { StyledTooltip } from '@/components/ui/StyledTooltip';
import ReferencesSelect from '@/components/ui/ReferencesSelect';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    estimateId?: number | null;
}

interface Row {
    id: number;

    item_type: number | null;

    material_type: number | null;
    material_id: number | null;

    service_type: number | null;
    service_id: number | null;

    unit_of_measure: number | null;
    currency: number | null;

    quantity_planned: number;
    coefficient: number;
    price: number;

    comment: string;
}

export default function EstimateItemsCreatedd({ isOpen, onClose, estimateId }: Props) {
    const [rows, setRows] = useState<Row[]>([
        {
            id: Date.now(),

            item_type: 1,

            material_type: null,
            material_id: null,

            service_type: null,
            service_id: null,

            unit_of_measure: null,
            currency: null,

            quantity_planned: 1,
            coefficient: 1,
            price: 0,

            comment: '',
        },
    ]);

    if (!isOpen) return null;

    const updateRow = (id: number, field: keyof Row, value: any) => {
        setRows((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
    };

    const addRow = () => {
        setRows((prev) => [
            ...prev,
            {
                id: Date.now(),

                item_type: 1,

                material_type: null,
                material_id: null,

                service_type: null,
                service_id: null,

                unit_of_measure: null,
                currency: null,

                quantity_planned: 1,
                coefficient: 1,
                price: 0,

                comment: '',
            },
        ]);
    };

    const removeRow = (id: number) => {
        setRows((prev) => prev.filter((row) => row.id !== id));
    };

    const handleSubmit = () => {
        console.log('estimateId', estimateId);
        console.log('rows', rows);

        onClose();
    };

    const rowTotal = (row: Row) => {
        const qty = Number(row.quantity_planned) || 0;
        const price = Number(row.price) || 0;
        const coef = Number(row.coefficient) || 1;

        return qty * price * coef;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg shadow-xl w-[1200px] max-h-[80vh] overflow-auto p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Добавление позиций</h2>

                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        ✕
                    </button>
                </div>

                <div className="space-y-3">
                    {rows.map((row) => (
                        <div key={row.id} className="grid items-center grid-cols-11 gap-2">
                            {/* тип позиции */}
                            <ReferencesSelect
                                reference="materialEstimateItemTypes"
                                value={row.item_type}
                                onChange={(v) => updateRow(row.id, 'item_type', v)}
                            />

                            {/* тип материала */}
                            <ReferencesSelect
                                reference="materialTypes"
                                value={row.material_type}
                                onChange={(v) => updateRow(row.id, 'material_type', v)}
                                placeholder="Тип"
                            />

                            {/* материал */}
                            <ReferencesSelect
                                reference="materials"
                                value={row.material_id}
                                onChange={(v) => updateRow(row.id, 'material_id', v)}
                                parentField="material_type"
                                parentValue={row.material_type}
                                placeholder="Материал"
                            />

                            {/* ед измерения */}
                            <ReferencesSelect
                                reference="unitsOfMeasure"
                                value={row.unit_of_measure}
                                onChange={(v) => updateRow(row.id, 'unit_of_measure', v)}
                                placeholder="Ед."
                            />

                            <input
                                type="number"
                                value={row.quantity_planned}
                                onChange={(e) =>
                                    updateRow(row.id, 'quantity_planned', Number(e.target.value))
                                }
                                className="px-2 py-1 border rounded"
                            />

                            <input
                                type="number"
                                value={row.coefficient}
                                onChange={(e) =>
                                    updateRow(row.id, 'coefficient', Number(e.target.value))
                                }
                                className="px-2 py-1 border rounded"
                            />

                            <ReferencesSelect
                                reference="currencies"
                                value={row.currency}
                                onChange={(v) => updateRow(row.id, 'currency', v)}
                            />

                            <input
                                type="number"
                                value={row.price}
                                onChange={(e) => updateRow(row.id, 'price', Number(e.target.value))}
                                className="px-2 py-1 border rounded"
                            />

                            <div className="font-medium text-right text-green-600">
                                {rowTotal(row)}
                            </div>

                            <input
                                value={row.comment}
                                onChange={(e) => updateRow(row.id, 'comment', e.target.value)}
                                className="px-2 py-1 border rounded"
                                placeholder="Комментарий"
                            />

                            <StyledTooltip title="Удалить строку">
                                <button
                                    onClick={() => removeRow(row.id)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </StyledTooltip>
                        </div>
                    ))}
                </div>

                <div className="flex justify-between pt-4 border-t">
                    <StyledTooltip title="Добавить строку">
                        <button
                            onClick={addRow}
                            className="flex items-center gap-2 text-orange-600 hover:text-orange-700"
                        >
                            <PlusCircle size={20} />
                            Добавить
                        </button>
                    </StyledTooltip>

                    <div className="space-x-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 border rounded hover:bg-gray-100"
                        >
                            Отмена
                        </button>

                        <button
                            onClick={handleSubmit}
                            className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
                        >
                            Сохранить
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
