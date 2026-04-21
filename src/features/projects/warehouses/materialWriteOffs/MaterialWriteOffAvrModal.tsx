import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogActions, DialogContent } from '@mui/material';
import { Plus, Trash2 } from 'lucide-react';
import type { ReferenceResult } from '@/features/reference/referenceSlice';
import { parseNumber } from '@/utils/parseNumber';
import ReferencesSelect from '@/components/ui/ReferencesSelect';
import type { CreateMaterialWriteOffPayload } from './materialWriteOffSlice';

interface WarehouseStockItemOption {
    material_id: number;
    unit_of_measure: number | null;
    quantity: number;
}

interface WorkPerformedItemOption {
    id: number;
    service_id: number | null;
    service_type: number | null;
    stage_id: number | null;
    subsection_id: number | null;
    quantity: number;
}

interface WorkPerformedOption {
    id: number;
    performed_person_name: string;
    created_at?: string;
    items: WorkPerformedItemOption[];
}

interface MaterialWriteOffAvrModalProps {
    open: boolean;
    warehouseId: number;
    warehouseName?: string;
    currentUserId?: number;
    refs: Record<string, ReferenceResult>;
    workPerformedOptions: WorkPerformedOption[];
    warehouseStocks: WarehouseStockItemOption[];
    submitting?: boolean;
    onClose: () => void;
    onSubmit: (data: CreateMaterialWriteOffPayload) => void;
}

interface MaterialRowForm {
    material_id: number;
    unit_of_measure: number | null;
    quantity: number;
    note: string;
}

const emptyItem: MaterialRowForm = {
    material_id: 0,
    unit_of_measure: null,
    quantity: 1,
    note: '',
};

export default function MaterialWriteOffAvrModal({
    open,
    warehouseId,
    warehouseName,
    refs,
    workPerformedOptions,
    warehouseStocks,
    submitting = false,
    onClose,
    onSubmit,
}: MaterialWriteOffAvrModalProps) {
    const [selectedWorkPerformedId, setSelectedWorkPerformedId] = useState<number>(0);

    const [formData, setFormData] = useState<CreateMaterialWriteOffPayload>({
        warehouse_id: warehouseId,
        work_performed_item_id: 0,
        note: '',
        items: [{ ...emptyItem }],
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!open) return;

        setSelectedWorkPerformedId(0);
        setFormData({
            warehouse_id: warehouseId,
            work_performed_item_id: 0,
            note: '',
            items: [{ ...emptyItem }],
        });
        setErrors({});
    }, [open, warehouseId]);

    const selectedWorkPerformed = useMemo(() => {
        return workPerformedOptions.find((item) => item.id === selectedWorkPerformedId) ?? null;
    }, [workPerformedOptions, selectedWorkPerformedId]);

    const workPerformedItems = selectedWorkPerformed?.items ?? [];

    const materialOptions = useMemo(() => {
        return warehouseStocks.map((item) => ({
            id: item.material_id,
            name: `${refs.materials.lookup(item.material_id)} (${item.quantity})`,
        }));
    }, [warehouseStocks, refs.materials]);

    const selectedItemsCount = useMemo(() => {
        return formData.items.filter((item) => item.material_id && Number(item.quantity) > 0)
            .length;
    }, [formData.items]);

    const getWarehouseStock = (materialId: number) => {
        return warehouseStocks.find((item) => item.material_id === materialId) ?? null;
    };

    const getWorkItemLabel = (item: WorkPerformedItemOption) => {
        const parts = [
            refs.serviceTypes?.lookup?.(Number(item.service_type)),
            refs.services?.lookup?.(Number(item.service_id)),
            refs.blockStages?.lookup?.(Number(item.stage_id)),
            refs.stageSubsections?.lookup?.(Number(item.subsection_id)),
        ].filter(Boolean);

        return `${parts.join(' / ')}${item.quantity ? ` / ${item.quantity}` : ''}`;
    };

    const handleChange = (field: keyof CreateMaterialWriteOffPayload, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: '' }));
    };

    const handleWorkPerformedChange = (value: number) => {
        setSelectedWorkPerformedId(value);

        setFormData((prev) => ({
            ...prev,
            work_performed_item_id: 0,
        }));

        setErrors((prev) => ({
            ...prev,
            work_performed_id: '',
            work_performed_item_id: '',
        }));
    };

    const updateItem = (index: number, field: keyof MaterialRowForm, value: any) => {
        setFormData((prev) => ({
            ...prev,
            items: prev.items.map((item, itemIndex) => {
                if (itemIndex !== index) return item;

                if (field === 'material_id') {
                    const stock = getWarehouseStock(Number(value));

                    return {
                        ...item,
                        material_id: Number(value),
                        unit_of_measure: stock?.unit_of_measure ?? null,
                    };
                }

                return {
                    ...item,
                    [field]: value,
                };
            }),
        }));
    };

    const addItem = () => {
        setFormData((prev) => ({
            ...prev,
            items: [...prev.items, { ...emptyItem }],
        }));
    };

    const removeItem = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            items:
                prev.items.length === 1
                    ? prev.items
                    : prev.items.filter((_, itemIndex) => itemIndex !== index),
        }));
    };

    const validate = () => {
        const nextErrors: Record<string, string> = {};

        if (!formData.warehouse_id) {
            nextErrors.warehouse_id = 'Выберите склад';
        }

        if (!selectedWorkPerformedId) {
            nextErrors.work_performed_id = 'Выберите АВР';
        }

        if (!formData.work_performed_item_id) {
            nextErrors.work_performed_item_id = 'Выберите работу из АВР';
        }

        const hasValidItem = formData.items.some(
            (item) => item.material_id && Number(item.quantity) > 0,
        );

        if (!hasValidItem) {
            nextErrors.items = 'Добавьте хотя бы один материал';
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;

        const payload: CreateMaterialWriteOffPayload = {
            warehouse_id: warehouseId,
            work_performed_item_id: formData.work_performed_item_id,
            note: formData.note || null,
            items: formData.items
                .filter((item) => item.material_id && Number(item.quantity) > 0)
                .map((item) => ({
                    material_id: item.material_id,
                    unit_of_measure: item.unit_of_measure,
                    quantity: Number(item.quantity) || 0,
                    note: item.note || null,
                })),
        };

        onSubmit(payload);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
            <div className="p-6 pb-4 border-b border-gray-200 bg-gradient-to-br from-blue-50/30 to-indigo-50/20">
                <h2 className="mb-1 text-lg font-bold tracking-wide text-blue-900 uppercase">
                    Создать списание по АВР
                </h2>
                <p className="text-sm text-gray-600">Выберите АВР, работу и материалы со склада</p>
            </div>

            <DialogContent dividers className="p-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Склад
                        </label>
                        <input
                            type="text"
                            value={warehouseName || `Склад ID ${warehouseId}`}
                            readOnly
                            className="w-full h-10 px-3 text-sm font-medium text-blue-600 border border-gray-300 rounded-lg cursor-not-allowed bg-gray-50"
                        />
                        {errors.warehouse_id && (
                            <p className="mt-1 text-xs text-red-600">{errors.warehouse_id}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            АВР <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={selectedWorkPerformedId || ''}
                            onChange={(e) => handleWorkPerformedChange(Number(e.target.value))}
                            className={`w-full px-3 py-2 text-sm border rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 ${
                                errors.work_performed_id ? 'border-red-300' : 'border-gray-300'
                            }`}
                        >
                            <option value="">Выберите АВР</option>
                            {workPerformedOptions.map((item) => (
                                <option key={item.id} value={item.id}>
                                    №{item.id} - {item.performed_person_name}
                                </option>
                            ))}
                        </select>
                        {errors.work_performed_id && (
                            <p className="mt-1 text-xs text-red-600">{errors.work_performed_id}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Работа из АВР <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.work_performed_item_id || ''}
                            onChange={(e) =>
                                handleChange('work_performed_item_id', Number(e.target.value))
                            }
                            disabled={!selectedWorkPerformedId}
                            className={`w-full px-3 py-2 text-sm border rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:bg-gray-50 disabled:text-gray-400 ${
                                errors.work_performed_item_id ? 'border-red-300' : 'border-gray-300'
                            }`}
                        >
                            <option value="">Выберите работу</option>
                            {workPerformedItems.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {getWorkItemLabel(item)}
                                </option>
                            ))}
                        </select>
                        {errors.work_performed_item_id && (
                            <p className="mt-1 text-xs text-red-600">
                                {errors.work_performed_item_id}
                            </p>
                        )}
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Комментарий
                        </label>
                        <textarea
                            value={formData.note ?? ''}
                            onChange={(e) => handleChange('note', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                            placeholder="Комментарий к списанию"
                        />
                    </div>
                </div>

                <div className="mt-6 overflow-hidden bg-white border rounded-lg shadow-sm">
                    <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
                        <div className="text-sm font-medium text-sky-600">
                            Материалы со склада: {selectedItemsCount}
                        </div>

                        <button
                            type="button"
                            onClick={addItem}
                            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-white rounded-lg bg-sky-600 hover:bg-sky-700"
                        >
                            <Plus className="w-4 h-4" />
                            Добавить материал
                        </button>
                    </div>

                    <table className="w-full">
                        <thead className="text-gray-700 bg-gray-50">
                            <tr className="border-b">
                                <th className="px-3 py-2 text-sm text-left">Материал</th>
                                <th className="w-32 px-3 py-2 text-sm text-center">Остаток</th>
                                <th className="px-3 py-2 text-sm text-center w-36">Ед. изм</th>
                                <th className="w-32 px-3 py-2 text-sm text-center">Кол-во</th>
                                <th className="px-3 py-2 text-sm text-left">Примечание</th>
                                <th className="w-16 px-3 py-2 text-sm text-center"></th>
                            </tr>
                        </thead>

                        <tbody>
                            {formData.items.map((item, index) => {
                                const stock = getWarehouseStock(item.material_id);

                                return (
                                    <tr
                                        key={index}
                                        className="border-b bg-blue-50/40 hover:bg-gray-50"
                                    >
                                        <td className="px-1 py-1 border bg-blue-50/40">
                                            <ReferencesSelect
                                                options={materialOptions}
                                                value={item.material_id}
                                                onChange={(value) =>
                                                    updateItem(index, 'material_id', value)
                                                }
                                            />
                                        </td>

                                        <td className="px-2 py-2 text-sm text-center border bg-gray-50">
                                            {stock?.quantity ?? '—'}
                                        </td>

                                        <td className="px-2 py-2 text-sm text-center border bg-gray-50">
                                            {item.unit_of_measure
                                                ? refs.unitsOfMeasure.lookup(item.unit_of_measure)
                                                : '—'}
                                        </td>

                                        <td className="px-1 py-1 bg-white border">
                                            <input
                                                type="text"
                                                value={item.quantity}
                                                onChange={(e) =>
                                                    updateItem(
                                                        index,
                                                        'quantity',
                                                        parseNumber(e.target.value),
                                                    )
                                                }
                                                className="w-full px-2 py-1.5 border rounded text-right bg-white"
                                            />
                                        </td>

                                        <td className="px-1 py-1 bg-white border">
                                            <input
                                                type="text"
                                                value={item.note ?? ''}
                                                onChange={(e) =>
                                                    updateItem(index, 'note', e.target.value)
                                                }
                                                className="w-full px-2 py-1.5 border rounded bg-white"
                                                placeholder="Комментарий"
                                            />
                                        </td>

                                        <td className="px-2 py-1 text-center border bg-gray-50">
                                            <button
                                                type="button"
                                                onClick={() => removeItem(index)}
                                                disabled={formData.items.length === 1}
                                                className="p-1.5 text-gray-400 rounded hover:text-red-600 hover:bg-red-50 disabled:opacity-40"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {errors.items && (
                        <p className="px-4 py-2 text-xs text-red-600">{errors.items}</p>
                    )}
                </div>
            </DialogContent>

            <DialogActions className="gap-2 p-6 border-t border-gray-200 bg-gray-50/50">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={submitting}
                    className="px-4 py-2 font-medium text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                >
                    Отмена
                </button>

                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="px-4 py-2 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    Создать
                </button>
            </DialogActions>
        </Dialog>
    );
}
