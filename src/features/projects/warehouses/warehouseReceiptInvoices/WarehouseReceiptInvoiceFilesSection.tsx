import { useCallback, useEffect, useRef, useState } from 'react';
import { Upload, Download, Trash2, X } from 'lucide-react';
import { Box, CircularProgress, Typography } from '@mui/material';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/app/store';
import {
    clearDocumentFiles,
    deleteDocumentFile,
    downloadDocumentFile,
    fetchDocumentFiles,
    uploadDocumentFile,
} from '../../legal_department/files/documentFilesSlice';
import { formatBytes } from '@/utils/formatBytes';
import { formatDate } from '@/utils/formatData';
import { StyledTooltip } from '@/components/ui/StyledTooltip';
import { getFileIcon } from '@/utils/getFileIcon';
import { createDocument, fetchDocuments } from '../../documents/documentsSlice';

interface UploadingFile {
    uid: string;
    file: File;
    progress: number;
    done: boolean;
    error: boolean;
}

interface Props {
    invoiceId: number;
}

const getErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    return fallback;
};

export default function WarehouseReceiptInvoiceFilesSection({ invoiceId }: Props) {
    const dispatch = useAppDispatch();
    const inputRef = useRef<HTMLInputElement>(null);

    const { data, loading, error } = useAppSelector((state) => state.documentFiles);

    const [docId, setDocId] = useState<number | null>(null);
    const [uploading, setUploading] = useState<UploadingFile[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [initializing, setInitializing] = useState(false);

    const getOrCreateDocument = useCallback(async () => {
        const docsResult = await dispatch(
            fetchDocuments({
                entity_type: 'warehouseReceiptInvoice',
                entity_id: invoiceId,
                page: 1,
                size: 100,
            }),
        ).unwrap();

        const existingDocId = docsResult.data?.[0]?.id;

        if (existingDocId) {
            setDocId(existingDocId);
            return existingDocId;
        }

        const createdDocument = await dispatch(
            createDocument({
                entity_type: 'warehouseReceiptInvoice',
                entity_id: invoiceId,
                name: `Файлы накладной №${invoiceId}`,
                status: 3,
            }),
        ).unwrap();

        if (!createdDocument?.id) {
            throw new Error('Не удалось создать папку файлов накладной');
        }

        setDocId(createdDocument.id);
        return createdDocument.id;
    }, [dispatch, invoiceId]);

    const resolveDocument = useCallback(async () => {
        if (docId) return docId;

        return getOrCreateDocument();
    }, [docId, getOrCreateDocument]);

    const refreshFiles = useCallback(
        async (documentId?: number) => {
            const currentDocId = documentId ?? (await resolveDocument());
            await dispatch(fetchDocumentFiles(currentDocId)).unwrap();
        },
        [dispatch, resolveDocument],
    );

    useEffect(() => {
        let mounted = true;

        const init = async () => {
            try {
                setInitializing(true);
                setDocId(null);
                dispatch(clearDocumentFiles());

                const currentDocId = await getOrCreateDocument();

                if (!mounted) return;

                await dispatch(fetchDocumentFiles(currentDocId)).unwrap();
            } catch (error: unknown) {
                console.error(error);
                toast.error(getErrorMessage(error, 'Ошибка получения файлов'));
            } finally {
                if (mounted) {
                    setInitializing(false);
                }
            }
        };

        init();

        return () => {
            mounted = false;
        };
    }, [dispatch, getOrCreateDocument]);

    const handleFiles = useCallback(
        async (files: FileList | null) => {
            if (!files || files.length === 0) return;

            const fileArray = Array.from(files);

            const entries: UploadingFile[] = fileArray.map((file) => ({
                uid: `${file.name}-${Date.now()}-${Math.random()}`,
                file,
                progress: 0,
                done: false,
                error: false,
            }));

            setUploading((prev) => [...prev, ...entries]);

            try {
                const currentDocId = await resolveDocument();

                for (const entry of entries) {
                    setUploading((prev) =>
                        prev.map((item) =>
                            item.uid === entry.uid ? { ...item, progress: 35 } : item,
                        ),
                    );

                    await dispatch(
                        uploadDocumentFile({
                            documentId: currentDocId,
                            file: entry.file,
                        }),
                    ).unwrap();

                    setUploading((prev) =>
                        prev.map((item) =>
                            item.uid === entry.uid ? { ...item, progress: 100, done: true } : item,
                        ),
                    );

                    toast.success(`Файл «${entry.file.name}» загружен`);
                }

                await refreshFiles(currentDocId);

                setTimeout(() => {
                    setUploading((prev) =>
                        prev.filter((item) => !entries.some((entry) => entry.uid === item.uid)),
                    );
                }, 700);

                if (inputRef.current) {
                    inputRef.current.value = '';
                }
            } catch (error: unknown) {
                console.error(error);

                setUploading((prev) =>
                    prev.map((item) =>
                        entries.some((entry) => entry.uid === item.uid)
                            ? { ...item, error: true }
                            : item,
                    ),
                );

                toast.error(getErrorMessage(error, 'Ошибка загрузки файлов'));
            }
        },
        [dispatch, refreshFiles, resolveDocument],
    );

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            handleFiles(e.dataTransfer.files);
        },
        [handleFiles],
    );

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleCancelUpload = (uid: string) => {
        setUploading((prev) => prev.filter((item) => item.uid !== uid));
    };

    const handleDownload = async (fileId: number, filename: string) => {
        try {
            await dispatch(
                downloadDocumentFile({
                    file_id: fileId,
                    filename,
                }),
            ).unwrap();
        } catch (error: unknown) {
            console.error(error);
            toast.error(getErrorMessage(error, 'Ошибка скачивания файла'));
        }
    };

    const handleDelete = async (fileId: number) => {
        try {
            await dispatch(deleteDocumentFile(fileId)).unwrap();
            toast.success('Файл удалён');
        } catch (error: unknown) {
            console.error(error);
            toast.error(getErrorMessage(error, 'Ошибка удаления файла'));
        }
    };

    const isBusy = initializing || loading;

    return (
        <div className="space-y-4 py-3">
            <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Сохранённые файлы
                    <span className="ml-1.5 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
                        {data.length}
                    </span>
                </p>

                {isBusy ? (
                    <Box display="flex" justifyContent="center" py={2}>
                        <CircularProgress size={24} />
                    </Box>
                ) : error ? (
                    <Typography color="error" variant="body2">
                        {error}
                    </Typography>
                ) : data.length === 0 ? (
                    <p className="px-1 text-xs italic text-gray-400">Нет прикреплённых файлов</p>
                ) : (
                    <div className="flex flex-col gap-1">
                        {data.map((file) => (
                            <div
                                key={file.id}
                                className="group flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 transition hover:border-blue-300 hover:bg-blue-50/30"
                            >
                                <div className="min-w-0 flex items-center gap-2.5">
                                    {getFileIcon(file.mime_type)}

                                    <div className="min-w-0">
                                        <p className="max-w-[260px] truncate text-xs font-medium text-gray-700">
                                            {file.name}
                                        </p>

                                        <p className="text-[10px] text-gray-400">
                                            {formatBytes(file.file_size || 0)}
                                            {file.created_at ? ` · ${formatDate(file.created_at)}` : ''}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                                    <StyledTooltip title="Скачать">
                                        <button
                                            type="button"
                                            onClick={() => handleDownload(file.id, file.name)}
                                            className="rounded p-1.5 text-gray-400 transition-colors hover:bg-blue-100 hover:text-blue-700"
                                        >
                                            <Download className="h-4 w-4" />
                                        </button>
                                    </StyledTooltip>

                                    <StyledTooltip title="Удалить">
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(file.id)}
                                            className="rounded p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </StyledTooltip>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {uploading.length > 0 && (
                <div className="space-y-2">
                    {uploading.map((entry) => (
                        <div
                            key={entry.uid}
                            className="rounded-lg border border-gray-200 bg-white px-3 py-2"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="truncate text-xs font-medium text-gray-700">
                                        {entry.file.name}
                                    </p>
                                    <p className="text-[10px] text-gray-400">
                                        {formatBytes(entry.file.size)}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => handleCancelUpload(entry.uid)}
                                    className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>

                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
                                <div
                                    className={`h-full rounded-full transition-all ${
                                        entry.error
                                            ? 'bg-red-500'
                                            : entry.done
                                              ? 'bg-green-500'
                                              : 'bg-blue-500'
                                    }`}
                                    style={{ width: `${entry.progress}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`rounded-xl border border-dashed p-4 transition ${
                    isDragging
                        ? 'border-blue-400 bg-blue-50/60'
                        : 'border-gray-300 bg-gray-50/70'
                }`}
            >
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-sm font-medium text-gray-700">Прикрепить файлы</p>
                        <p className="mt-1 text-xs text-gray-500">
                            Перетащите файлы сюда или выберите их вручную
                        </p>
                    </div>

                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
                        <Upload className="h-4 w-4" />
                        <span>Добавить файлы</span>
                        <input
                            ref={inputRef}
                            type="file"
                            hidden
                            multiple
                            onChange={(e) => handleFiles(e.target.files)}
                        />
                    </label>
                </div>
            </div>
        </div>
    );
}
