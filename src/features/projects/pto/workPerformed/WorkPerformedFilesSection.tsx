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
    workPerformedId: number;
}

export default function WorkPerformedFilesSection({ workPerformedId }: Props) {
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
                entity_type: 'workPerformed',
                entity_id: workPerformedId,
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
                entity_type: 'workPerformed',
                entity_id: workPerformedId,
                name: `Файлы Акта №${workPerformedId}`,
                status: 3,
            }),
        ).unwrap();

        if (!createdDocument?.id) {
            throw new Error('Не удалось создать папку файлов акта');
        }

        setDocId(createdDocument.id);
        return createdDocument.id;
    }, [dispatch, workPerformedId]);

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
            } catch (e: any) {
                console.error(e);
                toast.error(e.message || 'Ошибка получения файлов');
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
            } catch (e: any) {
                console.error(e);

                setUploading((prev) =>
                    prev.map((item) =>
                        entries.some((entry) => entry.uid === item.uid)
                            ? { ...item, error: true }
                            : item,
                    ),
                );

                toast.error(e.message || 'Ошибка загрузки файлов');
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
        } catch (e: any) {
            console.error(e);
            toast.error(e.message || 'Ошибка скачивания файла');
        }
    };

    const handleDelete = async (fileId: number) => {
        try {
            await dispatch(deleteDocumentFile(fileId)).unwrap();
            toast.success('Файл удалён');
        } catch (e: any) {
            console.error(e);
            toast.error(e.message || 'Ошибка удаления файла');
        }
    };

    const isBusy = initializing || loading;

    return (
        <div className="py-3 space-y-4">
            <div>
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Сохранённые файлы
                    <span className="ml-1.5 px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-medium text-[10px]">
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
                                className="flex items-center justify-between gap-3 px-3 py-2 transition bg-white border border-gray-200 rounded-lg group hover:border-blue-300 hover:bg-blue-50/30"
                            >
                                <div className="flex items-center gap-2.5 min-w-0">
                                    {getFileIcon(file.mime_type)}

                                    <div className="min-w-0">
                                        <p className="text-xs font-medium text-gray-700 truncate max-w-[260px]">
                                            {file.name}
                                        </p>

                                        <p className="text-[10px] text-gray-400">
                                            {formatBytes(file.file_size || 0)}
                                            {file.created_at
                                                ? ` · ${formatDate(file.created_at)}`
                                                : ''}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-center gap-1.5">
                                    <StyledTooltip title="Скачать">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDownload(file.id, file.name);
                                            }}
                                            className="
                                                p-1.5
                                                text-gray-400
                                                hover:text-blue-600
                                                hover:bg-blue-100
                                                rounded
                                                transition-colors
                                            "
                                        >
                                            <Download className="w-4 h-4" />
                                        </button>
                                    </StyledTooltip>

                                    <StyledTooltip title="Удалить">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(file.id);
                                            }}
                                            className="
                                                p-1.5
                                                text-gray-400
                                                hover:text-red-600
                                                hover:bg-red-100
                                                rounded
                                                transition-colors
                                            "
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </StyledTooltip>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {uploading.length > 0 && (
                <div>
                    <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Загружается
                    </p>

                    <div className="flex flex-col gap-1.5">
                        {uploading.map((item) => (
                            <div
                                key={item.uid}
                                className={`flex items-center gap-3 px-3 py-2.5 bg-white border rounded-lg ${
                                    item.error ? 'border-red-200' : 'border-blue-200'
                                }`}
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-medium text-gray-700 truncate max-w-[200px]">
                                            {item.file.name}
                                        </span>

                                        <span
                                            className={`text-[10px] font-semibold shrink-0 ml-2 ${
                                                item.error ? 'text-red-600' : 'text-blue-600'
                                            }`}
                                        >
                                            {item.error
                                                ? 'Ошибка'
                                                : item.done
                                                  ? '✓'
                                                  : `${item.progress}%`}
                                        </span>
                                    </div>

                                    <div className="h-1 overflow-hidden bg-gray-100 rounded-full">
                                        <div
                                            className={`h-full rounded-full transition-all duration-150 ${
                                                item.error
                                                    ? 'bg-red-500'
                                                    : item.done
                                                      ? 'bg-emerald-500'
                                                      : 'bg-blue-500'
                                            }`}
                                            style={{ width: `${item.progress}%` }}
                                        />
                                    </div>

                                    <p className="text-[10px] text-gray-400 mt-0.5">
                                        {formatBytes(item.file.size)}
                                        {item.done ? ' — готово' : ''}
                                    </p>
                                </div>

                                {!item.done && (
                                    <button
                                        className="p-1 text-gray-400 transition rounded shrink-0 hover:bg-gray-100 hover:text-gray-600"
                                        title="Убрать"
                                        onClick={() => handleCancelUpload(item.uid)}
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => inputRef.current?.click()}
                className={`
                    relative flex flex-col items-center justify-center gap-2 px-4 py-5 rounded-xl border-2 border-dashed cursor-pointer transition
                    ${
                        isDragging
                            ? 'border-blue-400 bg-blue-50 scale-[1.01]'
                            : 'border-gray-200 bg-gray-50/60 hover:border-blue-300 hover:bg-blue-50/40'
                    }
                `}
            >
                <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition ${
                        isDragging ? 'bg-blue-100' : 'bg-white border border-gray-200'
                    }`}
                >
                    <Upload
                        className={`w-4 h-4 transition ${
                            isDragging ? 'text-blue-600' : 'text-gray-400'
                        }`}
                    />
                </div>

                <div className="text-center">
                    <p className="text-xs font-medium text-gray-600">
                        {isDragging
                            ? 'Отпустите для загрузки'
                            : 'Перетащите файлы или нажмите для выбора'}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                        PDF, DOC, DOCX, XLS, XLSX, JPG, PNG
                    </p>
                </div>

                <input
                    ref={inputRef}
                    type="file"
                    multiple
                    hidden
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                    onChange={(e) => handleFiles(e.target.files)}
                    onClick={(e) => e.stopPropagation()}
                />
            </div>
        </div>
    );
}
