import { X, Building2, DollarSign, Ruler } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ProjectBlock } from './projectBlocksSlice';

interface BlockModalProps {
    open: boolean;
    onClose: () => void;
    projectId: number;
    block: ProjectBlock | null;
    onSubmit: (data: Partial<ProjectBlock>) => void;
}

export default function ProjectBlockModal({
    open,
    onClose,
    projectId,
    block,
    onSubmit,
}: BlockModalProps) {
    const nameInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState({
        project_id: projectId,
        name: block?.name || '',
        planned_budget: block?.planned_budget || 0,
        total_area: block?.total_area || 0,
        sale_area: block?.sale_area || 0,
    });

    // Reset form when modal opens with new block data
    useEffect(() => {
        if (open) {
            setFormData({
                project_id: projectId,
                name: block?.name || '',
                planned_budget: block?.planned_budget || 0,
                total_area: block?.total_area || 0,
                sale_area: block?.sale_area || 0,
            });
        }
    }, [open, block, projectId]);

    // Auto-focus name input when modal opens
    useEffect(() => {
        if (open) {
            nameInputRef.current?.focus();
        }
    }, [open]);

    // Handle Escape key to close modal
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    const parseNumber = (value: string) => {
        const normalized = value.replace(',', '.');
        const num = Number(normalized);
        return isNaN(num) ? 0 : num;
    };

    const handleChange = (key: keyof typeof formData, value: any) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 duration-200 bg-black/40 backdrop-blur-sm animate-in fade-in"
            onClick={onClose}
        >
            <div
                className="w-full max-w-[600px] bg-white rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* HEADER */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-blue-600 rounded-lg">
                            <Building2 className="w-4 h-4 text-white" />
                        </div>
                        <h2 className="text-base font-semibold text-gray-800">
                            {block ? 'Редактировать блок' : 'Добавить новый блок'}
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

                <form onSubmit={handleSubmit}>
                    <div className="px-6 py-5 space-y-5">
                        {/* NAME */}
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                Название блока
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                ref={nameInputRef}
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                placeholder="Например: Блок А, Корпус 1"
                                required
                                className="w-full px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                            />
                        </div>

                        {/* PLANNED BUDGET */}
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                <DollarSign className="w-3.5 h-3.5 text-gray-500" />
                                Плановый бюджет
                            </label>
                            <input
                                type="text"
                                value={formData.planned_budget}
                                onChange={(e) => handleChange('planned_budget', e.target.value)}
                                onBlur={(e) =>
                                    handleChange('planned_budget', parseNumber(e.target.value))
                                }
                                placeholder="0.00"
                                className="w-full px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-right"
                            />
                        </div>

                        {/* AREAS */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* TOTAL AREA */}
                            <div className="space-y-1.5">
                                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                    <Ruler className="w-3.5 h-3.5 text-gray-500" />
                                    Общая площадь, м²
                                </label>
                                <input
                                    type="text"
                                    value={formData.total_area}
                                    onChange={(e) => handleChange('total_area', e.target.value)}
                                    onBlur={(e) =>
                                        handleChange('total_area', parseNumber(e.target.value))
                                    }
                                    placeholder="0.00"
                                    className="w-full px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-right"
                                />
                            </div>

                            {/* SALE AREA */}
                            <div className="space-y-1.5">
                                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                    <Ruler className="w-3.5 h-3.5 text-gray-500" />
                                    Площадь продаж, м²
                                </label>
                                <input
                                    type="text"
                                    value={formData.sale_area}
                                    onChange={(e) => handleChange('sale_area', e.target.value)}
                                    onBlur={(e) =>
                                        handleChange('sale_area', parseNumber(e.target.value))
                                    }
                                    placeholder="0.00"
                                    className="w-full px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-right"
                                />
                            </div>
                        </div>

                        {/* INFO NOTE */}
                        <div className="p-3 border border-blue-200 rounded-lg bg-blue-50">
                            <p className="text-xs text-gray-600">
                                <span className="font-semibold text-blue-700">ℹ Примечание:</span>{' '}
                                Данные по объемам, прогрессу и количеству услуг рассчитываются
                                автоматически на основе связанных этапов и подэтапов.
                            </p>
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
                            disabled={!formData.name.trim()}
                            className="px-5 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed hover:shadow-md"
                        >
                            {block ? 'Сохранить изменения' : 'Создать блок'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
