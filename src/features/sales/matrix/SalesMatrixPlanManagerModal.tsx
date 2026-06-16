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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
            onClick={(event) => event.target === event.currentTarget && onClose()}
        >
            <div className="w-full max-w-md p-5 text-white bg-gray-900 border border-gray-800 shadow-2xl rounded-2xl">
                <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                        <div className="text-lg font-semibold">Планы этажа</div>
                        <div className="mt-0.5 text-sm text-gray-400">
                            {blockName} · {floorLabel}
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-lg bg-gray-800 p-1.5 text-gray-300 hover:bg-gray-700"
                    >
                        <X size={15} />
                    </button>
                </div>

                <div className="flex gap-2 p-3 mb-4 text-sm text-gray-300 border border-gray-700 rounded-xl bg-gray-800/60">
                    <Info size={14} className="mt-0.5 shrink-0 text-blue-400" />
                    <span>
                        У зоны в SVG должен быть <strong className="text-white">id</strong>,
                        совпадающий с <strong className="text-white">номером лота</strong>. На этаж
                        — один SVG.
                    </span>
                </div>

                <label
                    className={`mb-4 flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                        limitReached || saving
                            ? 'cursor-not-allowed bg-gray-700 opacity-60'
                            : 'bg-blue-600 hover:bg-blue-500'
                    }`}
                >
                    <Upload size={15} />
                    {limitReached ? 'SVG уже загружен' : saving ? 'Загрузка...' : 'Загрузить SVG'}
                    <input
                        type="file"
                        accept=".svg,image/svg+xml"
                        className="hidden"
                        onChange={onUpload}
                        disabled={limitReached || saving}
                    />
                </label>

                <div className="space-y-2">
                    {loading ? (
                        <div className="px-4 py-6 text-sm text-center text-gray-500 border border-gray-700 border-dashed rounded-xl">
                            Загружаем файлы...
                        </div>
                    ) : files.length ? (
                        files.map((file) => (
                            <div
                                key={file.id}
                                className="p-3 border border-gray-700 rounded-xl bg-gray-800/50"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="text-sm font-medium text-white truncate">
                                            {file.name}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                                            <span className="rounded-full border border-gray-600 px-2 py-0.5">
                                                SVG
                                            </span>
                                            <span>Активный план</span>
                                        </div>
                                    </div>

                                    <div className="flex shrink-0 items-center gap-1.5">
                                        <button
                                            onClick={() => onDownload(file)}
                                            className="p-2 transition-colors bg-gray-700 rounded-lg hover:bg-gray-600"
                                        >
                                            <Download size={13} />
                                        </button>
                                        <button
                                            onClick={() => void onDelete(file.id)}
                                            className="p-2 transition-colors bg-red-700 rounded-lg hover:bg-red-600"
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="px-4 py-6 text-sm text-center text-gray-500 border border-gray-700 border-dashed rounded-xl">
                            Для этого этажа пока не загружен SVG-план
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
