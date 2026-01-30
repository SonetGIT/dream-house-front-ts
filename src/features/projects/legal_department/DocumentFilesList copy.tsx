// DocumentFilesList.tsx
import { useEffect, useState } from 'react';
import {
    Box,
    Tooltip,
    Typography,
    CircularProgress,
    IconButton,
    Snackbar,
    Alert,
} from '@mui/material';
import { Delete as DeleteIcon, Download as DownloadIcon } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { fetchDocumentFiles, deleteDocumentFile, clearDocumentFiles } from './documentFilesSlice';
import { formatBytes } from '@/utils/formatBytes';

interface DocumentFilesListProps {
    documentId: number;
}

export function DocumentFilesList({ documentId }: DocumentFilesListProps) {
    const dispatch = useAppDispatch();
    const { data, loading, error } = useAppSelector((state) => state.documentFiles);
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'error';
    }>({
        open: false,
        message: '',
        severity: 'success',
    });

    useEffect(() => {
        if (documentId) {
            dispatch(fetchDocumentFiles(documentId));
        }
        return () => {
            dispatch(clearDocumentFiles());
        };
    }, [dispatch, documentId]);

    const handleDownload = (file: any) => {
        const url = `/api/documentFiles/download/${file.id}`;
        const link = document.createElement('a');
        link.href = url;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDelete = async (fileId: number) => {
        try {
            await dispatch(deleteDocumentFile(fileId)).unwrap();
            setSnackbar({ open: true, message: 'Файл удалён', severity: 'success' });
        } catch (err: any) {
            setSnackbar({
                open: true,
                message: err.message || 'Ошибка удаления файла',
                severity: 'error',
            });
        }
    };

    const getFileIcon = (mimeType: string) => {
        if (mimeType.startsWith('image/'))
            return <img src="/icons/image-file.svg" width={36} alt="Изображение" />;
        if (mimeType === 'application/pdf')
            return <img src="/icons/pdf-file.svg" width={36} alt="PDF" />;
        return <img src="/icons/generic-file.svg" width={36} alt="Файл" />;
    };

    if (loading && !data.length) return <CircularProgress size={24} />;
    if (error) return <Typography color="error">{error}</Typography>;
    if (!data.length) return <Typography>Файлы отсутствуют</Typography>;

    return (
        <>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
                {data.map((file) => (
                    <Tooltip key={file.id} title={`${file.name} (${formatBytes(file.file_size)})`}>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 80,
                                position: 'relative',
                                '&:hover .file-actions': { opacity: 1 },
                            }}
                        >
                            <Box
                                onClick={() => handleDownload(file)}
                                sx={{
                                    cursor: 'pointer',
                                    '&:hover': {
                                        transform: 'scale(1.05)',
                                        transition: 'transform 0.2s',
                                    },
                                }}
                            >
                                {getFileIcon(file.mime_type)}
                            </Box>

                            <Typography
                                variant="caption"
                                textAlign="center"
                                sx={{
                                    mt: 0.5,
                                    maxWidth: 80,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}
                            >
                                {file.name}
                            </Typography>

                            {/* Кнопки действий */}
                            <Box
                                className="file-actions"
                                sx={{
                                    position: 'absolute',
                                    top: -10,
                                    right: -10,
                                    display: 'flex',
                                    gap: 0.5,
                                    opacity: 0,
                                    transition: 'opacity 0.2s',
                                }}
                            >
                                <IconButton
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDownload(file);
                                    }}
                                    sx={{ bgcolor: 'white', boxShadow: 1 }}
                                >
                                    <DownloadIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(file.id);
                                    }}
                                    sx={{ bgcolor: 'white', boxShadow: 1, color: 'error.main' }}
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        </Box>
                    </Tooltip>
                ))}
            </Box>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                // onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
}
