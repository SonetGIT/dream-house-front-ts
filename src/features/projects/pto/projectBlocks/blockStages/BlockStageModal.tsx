import { X, Calendar, FileText } from 'lucide-react';
import type { BlockStage } from './blockStagesSlice';
import { useEffect, useRef } from 'react';

interface BlockStageModalProps {
    editing: BlockStage | null;
    formData: {
        name: string;
        start_date: string;
        end_date: string;
    };
    onChange: (data: any) => void;
    onSubmit: (e: React.FormEvent) => void;
    onClose: () => void;
}

// Helper to convert ISO datetime to date input format (YYYY-MM-DD)
function toDateInputValue(isoString: string): string {
    if (!isoString) return '';
    // Handle both ISO datetime (2026-02-01T00:00) and date (2026-02-01)
    return isoString.split('T')[0];
}

export default function BlockStageModal({
    editing,
    formData,
    onChange,
    onSubmit,
    onClose,
}: BlockStageModalProps) {
    const nameInputRef = useRef<HTMLInputElement>(null);

    // Auto-focus name input when modal opens
    useEffect(() => {
        nameInputRef.current?.focus();
    }, []);

    // Handle Escape key to close modal
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    const startDateValue = toDateInputValue(formData.start_date);
    const endDateValue = toDateInputValue(formData.end_date);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center duration-200 bg-black/40 backdrop-blur-sm animate-in fade-in"
            onClick={onClose}
        >
            <div
                className="w-full max-w-[520px] bg-white rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* HEADER */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-sky-50 to-indigo-50">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-sky-600">
                            <FileText className="w-4 h-4 text-white" />
                        </div>
                        <h2 className="text-base font-semibold text-gray-800">
                            {editing ? 'Редактировать этап' : 'Добавить новый этап'}
                        </h2>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                        title="Закрыть (Esc)"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={onSubmit}>
                    <div className="px-6 py-5 space-y-4">
                        {/* NAME */}
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                Название этапа
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                ref={nameInputRef}
                                type="text"
                                value={formData.name}
                                onChange={(e) => onChange({ ...formData, name: e.target.value })}
                                placeholder="Например: Каркас монолитный"
                                required
                                className="w-full px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-md focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-100 transition-all"
                            />
                        </div>

                        {/* DATE RANGE */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* START DATE */}
                            <div className="space-y-1.5">
                                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                    <Calendar className="w-3.5 h-3.5 text-gray-500" />
                                    Дата начала
                                </label>
                                <input
                                    type="date"
                                    value={startDateValue}
                                    onChange={(e) =>
                                        onChange({ ...formData, start_date: e.target.value })
                                    }
                                    className="w-full px-3 py-2.5 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-100 transition-all"
                                />
                            </div>

                            {/* END DATE */}
                            <div className="space-y-1.5">
                                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                    <Calendar className="w-3.5 h-3.5 text-gray-500" />
                                    Дата окончания
                                </label>
                                <input
                                    type="date"
                                    value={endDateValue}
                                    onChange={(e) =>
                                        onChange({ ...formData, end_date: e.target.value })
                                    }
                                    min={startDateValue}
                                    className="w-full px-3 py-2.5 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-100 transition-all"
                                />
                            </div>
                        </div>

                        {/* Helper text */}
                        <p className="text-sm text-gray-500 flex items-start gap-1.5 mt-2">
                            <span className="text-sky-500 mt-0.5">ℹ</span>
                            <span>
                                Укажите название этапа и даты для автоматического расчета
                                длительности
                            </span>
                        </p>
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
                            className="px-5 py-2 text-sm font-medium text-white transition-colors rounded-md shadow-sm bg-sky-600 hover:bg-sky-700 disabled:bg-gray-300 disabled:cursor-not-allowed hover:shadow-md"
                        >
                            {editing ? 'Сохранить изменения' : 'Создать этап'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
