import { X, Package, DollarSign } from 'lucide-react';
import type { EstimateItem } from './estimateItemsSlice';
import { useEffect, useState, useRef } from 'react';
import ReferencesSelect from '@/components/ui/ReferencesSelect';
import { parseNumber } from '@/utils/parseNumber';

interface MaterialEditModalProps {
    item: EstimateItem | null;
    refs: any;
    onSubmit: (data: Partial<EstimateItem>) => void;
    onClose: () => void;
}

export default function MaterialEditModal({
    item,
    refs,
    onSubmit,
    onClose,
}: MaterialEditModalProps) {
    const firstInputRef = useRef<HTMLSelectElement>(null);

    const [formData, setFormData] = useState<Partial<EstimateItem>>({
        stage_id: item?.stage_id ?? null,
        subsection_id: item?.subsection_id ?? null,
        material_type: item?.material_type ?? null,
        material_id: item?.material_id ?? null,
        unit_of_measure: item?.unit_of_measure ?? null,
        quantity_planned: item?.quantity_planned ?? 1,
        coefficient: item?.coefficient ?? 1,
        currency: item?.currency ?? 1,
        currency_rate: item?.currency_rate ?? 1,
        price: item?.price ?? 0,
        comment: item?.comment ?? '',
    });

    const materialTypes = refs.materialTypes?.data || [];
    const materials = refs.materials?.data || [];
    const units = refs.unitsOfMeasure?.data || [];
    const currencies = refs.currencies?.data || [];
    const blockStages = refs.blockStages?.data || [];
    const stageSubsections = refs.stageSubsections?.data || [];

    const filteredMaterials = formData.material_type
        ? materials.filter((m: any) => Number(m.type) === Number(formData.material_type))
        : [];

    const filteredSubStages = formData.stage_id
        ? stageSubsections.filter((s: any) => Number(s.stage_id) === Number(formData.stage_id))
        : [];

    // Handle Escape key to close modal
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    const handleChange = (key: keyof EstimateItem, value: any) => {
        setFormData((prev) => {
            const updated = { ...prev, [key]: value };

            // Сброс зависимых полей
            if (key === 'stage_id') {
                updated.subsection_id = null;
            }
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

    const calculateTotal = () => {
        const qty = Number(formData.quantity_planned) || 0;
        const coef = Number(formData.coefficient) || 1;
        const price = Number(formData.price) || 0;
        const rate = Number(formData.currency_rate) || 1;
        return qty * coef * price * rate;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const total = calculateTotal();

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 duration-200 bg-black/40 backdrop-blur-sm animate-in fade-in"
            onClick={onClose}
        >
            <div
                className="w-full max-w-[900px] bg-white rounded-lg shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* HEADER */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-green-600 rounded-lg">
                            <Package className="w-4 h-4 text-white" />
                        </div>
                        <h2 className="text-base font-semibold text-gray-800">
                            Редактировать материал
                        </h2>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                        title="Закрыть (Esc)"
                    >
                        <X className="w-5 h-5 text-red-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="flex-1 px-6 py-5 space-y-5 overflow-y-auto">
                        {/* Этап и Подэтап */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">Этап</label>
                                <ReferencesSelect
                                    options={blockStages}
                                    value={formData.stage_id}
                                    onChange={(v) => handleChange('stage_id', v)}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">Подэтап</label>
                                <ReferencesSelect
                                    options={filteredSubStages}
                                    value={formData.subsection_id}
                                    disabled={!formData.stage_id}
                                    onChange={(v) => handleChange('subsection_id', v)}
                                />
                            </div>
                        </div>

                        {/* Тип материала и Материал */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                    Тип материала
                                    <span className="text-red-500">*</span>
                                </label>
                                <ReferencesSelect
                                    options={materialTypes}
                                    value={formData.material_type}
                                    onChange={(v) => handleChange('material_type', v)}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                    Материал
                                    <span className="text-red-500">*</span>
                                </label>
                                <ReferencesSelect
                                    options={filteredMaterials}
                                    value={formData.material_id}
                                    disabled={!formData.material_type}
                                    onChange={(v) => handleChange('material_id', v)}
                                />
                            </div>
                        </div>

                        {/* Единица измерения */}
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                Единица измерения
                                <span className="text-red-500">*</span>
                            </label>
                            <ReferencesSelect
                                options={units}
                                value={formData.unit_of_measure}
                                onChange={(v) => handleChange('unit_of_measure', v)}
                            />
                        </div>

                        {/* Количество и Коэффициент */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">
                                    Количество
                                </label>
                                <input
                                    type="text"
                                    value={formData.quantity_planned ?? ''}
                                    onChange={(e) =>
                                        handleChange('quantity_planned', e.target.value)
                                    }
                                    onBlur={(e) =>
                                        handleChange(
                                            'quantity_planned',
                                            parseNumber(e.target.value),
                                        )
                                    }
                                    className="w-full px-3 py-2.5 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-right"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">
                                    Коэффициент
                                </label>
                                <input
                                    type="text"
                                    value={formData.coefficient ?? ''}
                                    onChange={(e) => handleChange('coefficient', e.target.value)}
                                    onBlur={(e) =>
                                        handleChange('coefficient', parseNumber(e.target.value))
                                    }
                                    className="w-full px-3 py-2.5 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-right"
                                />
                            </div>
                        </div>

                        {/* Валюта и Курс */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">Валюта</label>
                                <ReferencesSelect
                                    options={currencies}
                                    value={formData.currency}
                                    onChange={(v) => handleChange('currency', v)}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">Курс</label>
                                <input
                                    type="text"
                                    value={formData.currency_rate ?? ''}
                                    onChange={(e) => handleChange('currency_rate', e.target.value)}
                                    onBlur={(e) =>
                                        handleChange('currency_rate', parseNumber(e.target.value))
                                    }
                                    className="w-full px-3 py-2.5 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-right"
                                />
                            </div>
                        </div>

                        {/* Цена */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">Цена</label>
                            <input
                                type="text"
                                value={formData.price ?? ''}
                                onChange={(e) => handleChange('price', e.target.value)}
                                onBlur={(e) => handleChange('price', parseNumber(e.target.value))}
                                className="w-full px-3 py-2.5 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-right"
                            />
                        </div>

                        {/* Итоговая сумма */}
                        <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <DollarSign className="w-5 h-5 text-green-600" />
                                    <span className="text-sm font-medium text-gray-700">
                                        Итоговая сумма:
                                    </span>
                                </div>
                                <span className="text-lg font-bold text-green-700">
                                    {total.toLocaleString('ru-RU', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </span>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                                Количество × Коэфф. × Цена × Курс = {formData.quantity_planned} ×{' '}
                                {formData.coefficient} × {formData.price} × {formData.currency_rate}
                            </p>
                        </div>

                        {/* Примечание */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">Примечание</label>
                            <textarea
                                value={formData.comment || ''}
                                onChange={(e) => handleChange('comment', e.target.value)}
                                rows={2}
                                placeholder="Дополнительная информация о материале..."
                                className="w-full px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                            />
                        </div>
                    </div>

                    {/* FOOTER */}
                    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400"
                        >
                            Отмена
                        </button>

                        <button
                            type="submit"
                            disabled={
                                !formData.material_type ||
                                !formData.material_id ||
                                !formData.unit_of_measure
                            }
                            className="px-5 py-2 text-sm font-medium text-white transition-colors bg-green-600 rounded-md shadow-sm hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed hover:shadow-md"
                        >
                            Сохранить изменения
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
