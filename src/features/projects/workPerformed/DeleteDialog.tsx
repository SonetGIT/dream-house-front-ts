import { useState } from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';
import type { WorkPerformed } from '@/store/workPerformedSlice';

interface Props {
    item: WorkPerformed;
    onConfirm: () => Promise<void>;
    onClose: () => void;
}

export function DeleteDialog({ item, onConfirm, onClose }: Props) {
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        setLoading(true);
        await onConfirm();
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
                {/* header */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
                    <div className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-sm font-semibold">Удаление записи</span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* body */}
                <div className="px-5 py-4 space-y-3">
                    <p className="text-sm text-gray-600">
                        Вы действительно хотите удалить запись?
                    </p>
                    <div className="rounded-lg border border-gray-100 bg-gray-50 px-3.5 py-2.5 space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] text-gray-400 w-20 shrink-0">Код акта:</span>
                            <span className="text-xs font-semibold text-gray-800">{item.code ?? `ID #${item.id}`}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] text-gray-400 w-20 shrink-0">Исполнитель:</span>
                            <span className="text-xs text-gray-700">{item.performed_person_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] text-gray-400 w-20 shrink-0">Позиций:</span>
                            <span className="text-xs text-gray-700">{item.items.length}</span>
                        </div>
                    </div>
                    <p className="text-[11px] text-red-500">
                        Это действие необратимо. Все позиции акта также будут удалены.
                    </p>
                </div>

                {/* footer */}
                <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-100 bg-gray-50/50">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-3.5 py-1.5 rounded-md border border-gray-200 text-sm text-gray-600 hover:bg-gray-100 transition disabled:opacity-50"
                    >
                        Отмена
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={loading}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition disabled:opacity-60"
                    >
                        {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        Удалить
                    </button>
                </div>
            </div>
        </div>
    );
}
