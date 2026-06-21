import { Download, Info, Trash2, Upload, X } from 'lucide-react';
import type { DocumentFile } from '@/features/projects/legal_department/files/documentFilesSlice';

interface Props {
    open: boolean;
    onClose: () => void;
    blockName: string;
    floorLabel: string;
    files: DocumentFile[];
    loading: boolean;
    saving: boolean;
    limitReached: boolean;
    onUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
    onDownload: (file: DocumentFile) => void;
    onDelete: (fileId: number) => Promise<void>;
}

export default function SalesMatrixPlanManagerModal({
    open,
    onClose,
    blockName,
    floorLabel,
    files,
    loading,
    saving,
    limitReached,
    onUpload,
    onDownload,
    onDelete,
}: Props) {
    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={(event) => event.target === event.currentTarget && onClose()}
        >
            <div className="w-full max-w-md overflow-hidden bg-white border shadow-2xl border-stone-200 rounded-xl">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 p-3 border-b border-stone-200 bg-slate-50">
                    <div>
                        <div className="text-lg font-semibold text-slate-800">Планы этажа</div>
                        <div className="mt-0.5 text-sm text-slate-500">
                            {blockName} · {floorLabel}
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-200 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Info */}
                <div className="p-4">
                    <div className="flex gap-3 p-3 text-sm text-blue-800 border border-blue-200 rounded-lg bg-blue-50">
                        <Info size={16} className="mt-0.5 shrink-0 text-blue-600" />
                        <span>
                            У зоны в SVG должен быть <strong className="font-semibold">id</strong>,
                            совпадающий с <strong className="font-semibold">номером лота</strong>.
                            На этаж — один SVG.
                        </span>
                    </div>
                </div>

                {/* Upload Button */}
                <div className="px-4 pb-4">
                    <label
                        className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                            limitReached || saving
                                ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                    >
                        <Upload size={16} />
                        {limitReached
                            ? 'SVG уже загружен'
                            : saving
                              ? 'Загрузка...'
                              : 'Загрузить SVG'}
                        <input
                            type="file"
                            accept=".svg,image/svg+xml"
                            className="hidden"
                            onChange={onUpload}
                            disabled={limitReached || saving}
                        />
                    </label>
                </div>

                {/* Files List */}
                <div className="px-4 pb-5 space-y-2">
                    {loading ? (
                        <div className="px-4 py-6 text-sm text-center border border-dashed rounded-lg text-slate-500 border-stone-300 bg-slate-50">
                            Загружаем файлы...
                        </div>
                    ) : files.length ? (
                        files.map((file) => (
                            <div
                                key={file.id}
                                className="p-3 bg-white border rounded-lg border-stone-200"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium truncate text-slate-800">
                                            {file.name}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                                            <span className="rounded-full border border-stone-300 px-2 py-0.5 bg-slate-50">
                                                SVG
                                            </span>
                                            <span>Активный план</span>
                                        </div>
                                    </div>

                                    <div className="flex shrink-0 items-center gap-1.5">
                                        <button
                                            onClick={() => onDownload(file)}
                                            className="p-2 transition-colors rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                                            title="Скачать"
                                        >
                                            <Download size={14} />
                                        </button>
                                        <button
                                            onClick={() => void onDelete(file.id)}
                                            className="p-2 text-red-600 transition-colors rounded-lg bg-red-50 hover:bg-red-100"
                                            title="Удалить"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="px-4 py-6 text-sm text-center border border-dashed rounded-lg text-slate-500 border-stone-300 bg-slate-50">
                            Для этого этажа пока не загружен SVG-план
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
