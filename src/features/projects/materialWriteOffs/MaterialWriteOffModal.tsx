import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogActions, DialogContent } from '@mui/material';
import { Plus, Trash2 } from 'lucide-react';
import type { ReferenceResult } from '@/features/reference/referenceSlice';
import { parseNumber } from '@/utils/parseNumber';
import ReferencesSelect from '@/components/ui/ReferencesSelect';
import type {
    CreateMaterialWriteOffPayload,
    MaterialWriteOff,
    MaterialWriteOffItemPayload,
    UpdateMaterialWriteOffPayload,
} from './materialWriteOffSlice';

interface MaterialWriteOffModalProps {
    open: boolean;
    initialData?: MaterialWriteOff | null;
    projectId: number;
    blockId: number;
    currentUserId: number;
    refs: Record<string, ReferenceResult>;
    submitting?: boolean;
    onClose: () => void;
    onSubmit: (
        data: CreateMaterialWriteOffPayload | UpdateMaterialWriteOffPayload,
        id?: number,
    ) => void;
}

const emptyItem: MaterialWriteOffItemPayload = {
    material_id: 0,
    unit_of_measure: 0,
    quantity: 1,
    note: '',
    movement_id: null,
};

export default function MaterialWriteOffModal({
    open,
    initialData,
    projectId,
    blockId,
    currentUserId,
    refs,
    submitting = false,
    onClose,
    onSubmit,
}: MaterialWriteOffModalProps) {
    const isEdit = Boolean(initialData?.id);

    const [formData, setFormData] = useState<CreateMaterialWriteOffPayload>({
        project_id: projectId,
        block_id: blockId,
        warehouse_id: 0,
        work_performed_id: 0,
        work_performed_item_id: 0,
        write_off_date: new Date().toISOString().slice(0, 10),
        status: 1,
        note: '',
        created_user_id: currentUserId,
        items: [{ ...emptyItem }],
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const warehouses = refs.warehouses?.data ?? [];
    const materials = refs.materials?.data ?? [];
    const unitsOfMeasure = refs.unitsOfMeasure?.data ?? [];

    useEffect(() => {
        if (!open) return;

        if (initialData) {
            setFormData({
                project_id: initialData.project_id,
                block_id: initialData.block_id,
                warehouse_id: initialData.warehouse_id,
                work_performed_id: initialData.work_performed_id,
                work_performed_item_id: initialData.work_performed_item_id,
                write_off_date:
                    initialData.write_off_date?.slice(0, 10) ||
                    new Date().toISOString().slice(0, 10),
                status: initialData.status,
                note: initialData.note ?? '',
                created_user_id: initialData.created_user_id || currentUserId,
                foreman_user_id: initialData.foreman_user_id,
                planning_engineer_user_id: initialData.planning_engineer_user_id,
                main_engineer_user_id: initialData.main_engineer_user_id,
                general_director_user_id: initialData.general_director_user_id,
                items: initialData.items?.map((item) => ({
                    material_id: item.material_id,
                    unit_of_measure: item.unit_of_measure,
                    quantity: item.quantity,
                    note: item.note ?? '',
                    movement_id: item.movement_id ?? null,
                })) ?? [{ ...emptyItem }],
            });
        } else {
            setFormData({
                project_id: projectId,
                block_id: blockId,
                warehouse_id: 0,
                work_performed_id: 0,
                work_performed_item_id: 0,
                write_off_date: new Date().toISOString().slice(0, 10),
                status: 1,
                note: '',
                created_user_id: currentUserId,
                items: [{ ...emptyItem }],
            });
        }

        setErrors({});
    }, [open, initialData, projectId, blockId, currentUserId]);

    const selectedItemsCount = useMemo(() => {
        return formData.items.filter((item) => item.material_id && Number(item.quantity) > 0)
            .length;
    }, [formData.items]);

    const handleChange = (field: keyof CreateMaterialWriteOffPayload, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: '' }));
    };

    const updateItem = (index: number, field: keyof MaterialWriteOffItemPayload, value: any) => {
        setFormData((prev) => ({
            ...prev,
            items: prev.items.map((item, itemIndex) =>
                itemIndex === index ? { ...item, [field]: value } : item,
            ),
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

        if (!formData.warehouse_id) nextErrors.warehouse_id = 'Выберите склад';
        if (!formData.work_performed_id) nextErrors.work_performed_id = 'Укажите АВР';
        if (!formData.work_performed_item_id)
            nextErrors.work_performed_item_id = 'Укажите позицию АВР';
        if (!formData.write_off_date) nextErrors.write_off_date = 'Укажите дату списания';

        const hasValidItem = formData.items.some(
            (item) => item.material_id && Number(item.quantity) > 0,
        );
        if (!hasValidItem) nextErrors.items = 'Добавьте хотя бы один материал';

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;

        const payload = {
            ...formData,
            project_id: projectId,
            block_id: blockId,
            created_user_id: formData.created_user_id || currentUserId,
            items: formData.items
                .filter((item) => item.material_id && Number(item.quantity) > 0)
                .map((item) => ({
                    ...item,
                    quantity: Number(item.quantity) || 0,
                    note: item.note || null,
                    movement_id: item.movement_id ?? null,
                })),
        };

        onSubmit(payload, initialData?.id);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
            <div className="p-6 pb-4 border-b border-gray-200 bg-gradient-to-br from-blue-50/30 to-indigo-50/20">
                <h2 className="mb-1 text-lg font-bold tracking-wide text-blue-900 uppercase">
                    {isEdit
                        ? `Редактировать списание № ${initialData?.id}`
                        : 'Создать списание материалов'}
                </h2>
                <p className="text-sm text-gray-600">
                    Заполните данные списания и добавьте материалы
                </p>
            </div>

            <DialogContent dividers className="p-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Склад <span className="text-red-500">*</span>
                        </label>
                        <ReferencesSelect
                            options={warehouses}
                            value={formData.warehouse_id}
                            onChange={(value) => handleChange('warehouse_id', value)}
                        />
                        {errors.warehouse_id && (
                            <p className="mt-1 text-xs text-red-600">{errors.warehouse_id}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Дата списания <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={formData.write_off_date}
                            onChange={(e) => handleChange('write_off_date', e.target.value)}
                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 ${
                                errors.write_off_date ? 'border-red-300' : 'border-gray-300'
                            }`}
                        />
                        {errors.write_off_date && (
                            <p className="mt-1 text-xs text-red-600">{errors.write_off_date}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            ID АВР <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.work_performed_id || ''}
                            onChange={(e) =>
                                handleChange('work_performed_id', parseNumber(e.target.value))
                            }
                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 ${
                                errors.work_performed_id ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Например: 34"
                        />
                        {errors.work_performed_id && (
                            <p className="mt-1 text-xs text-red-600">{errors.work_performed_id}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            ID позиции АВР <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.work_performed_item_id || ''}
                            onChange={(e) =>
                                handleChange('work_performed_item_id', parseNumber(e.target.value))
                            }
                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 ${
                                errors.work_performed_item_id ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Например: 38"
                        />
                        {errors.work_performed_item_id && (
                            <p className="mt-1 text-xs text-red-600">
                                {errors.work_performed_item_id}
                            </p>
                        )}
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Примечание
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
                            Материалы к списанию: {selectedItemsCount}
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
                                <th className="px-3 py-2 text-sm text-center w-36">Ед. изм</th>
                                <th className="w-32 px-3 py-2 text-sm text-center">Кол-во</th>
                                <th className="px-3 py-2 text-sm text-left">Примечание</th>
                                <th className="w-16 px-3 py-2 text-sm text-center"> </th>
                            </tr>
                        </thead>

                        <tbody>
                            {formData.items.map((item, index) => (
                                <tr key={index} className="border-b bg-blue-50/40 hover:bg-gray-50">
                                    <td className="px-1 py-1 border bg-blue-50/40">
                                        <ReferencesSelect
                                            options={materials}
                                            value={item.material_id}
                                            onChange={(value) =>
                                                updateItem(index, 'material_id', value)
                                            }
                                        />
                                    </td>

                                    <td className="px-1 py-1 border bg-blue-50/40">
                                        <ReferencesSelect
                                            options={unitsOfMeasure}
                                            value={item.unit_of_measure}
                                            onChange={(value) =>
                                                updateItem(index, 'unit_of_measure', value)
                                            }
                                        />
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
                            ))}
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
                    {isEdit ? 'Сохранить' : 'Создать'}
                </button>
            </DialogActions>
        </Dialog>
    );
}
