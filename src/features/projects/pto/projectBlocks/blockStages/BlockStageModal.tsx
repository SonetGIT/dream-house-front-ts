import { X } from 'lucide-react';
import type { BlockStage } from './blockStagesSlice';

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

export default function BlockStageModal({
    editing,
    formData,
    onChange,
    onSubmit,
    onClose,
}: BlockStageModalProps) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.25)' }}
            onClick={onClose}
        >
            <div
                className="w-full bg-white border border-gray-200 rounded shadow-xl"
                style={{ maxWidth: 480 }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* HEADER */}

                <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200">
                    <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>
                        {editing ? 'Редактировать этап' : 'Добавить этап'}
                    </span>

                    <button
                        onClick={onClose}
                        className="text-gray-400 transition-colors hover:text-gray-600"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={onSubmit}>
                    <div className="px-5 py-4 space-y-3.5">
                        {/* NAME */}

                        <div className="flex items-center gap-3">
                            <label
                                style={{
                                    fontSize: 12,
                                    color: '#6B7280',
                                    width: 110,
                                    flexShrink: 0,
                                }}
                            >
                                Название *
                            </label>

                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => onChange({ ...formData, name: e.target.value })}
                                placeholder="Введите название этапа"
                                className="flex-1 border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                style={{ fontSize: 13, color: '#111827' }}
                            />
                        </div>

                        {/* START DATE */}

                        <div className="flex items-center gap-3">
                            <label
                                style={{
                                    fontSize: 12,
                                    color: '#6B7280',
                                    width: 110,
                                }}
                            >
                                Дата начала
                            </label>

                            <input
                                type="date"
                                value={formData.start_date}
                                onChange={(e) =>
                                    onChange({ ...formData, start_date: e.target.value })
                                }
                                className="flex-1 border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                        </div>

                        {/* END DATE */}

                        <div className="flex items-center gap-3">
                            <label
                                style={{
                                    fontSize: 12,
                                    color: '#6B7280',
                                    width: 110,
                                }}
                            >
                                Дата окончания
                            </label>

                            <input
                                type="date"
                                value={formData.end_date}
                                onChange={(e) =>
                                    onChange({ ...formData, end_date: e.target.value })
                                }
                                className="flex-1 border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* FOOTER */}

                    <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-100 bg-gray-50">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-1.5 rounded border border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
                            style={{ fontSize: 12 }}
                        >
                            Отмена
                        </button>

                        <button
                            type="submit"
                            className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white"
                            style={{ fontSize: 12 }}
                        >
                            {editing ? 'Сохранить' : 'Создать'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
