import {
    Box,
    Typography,
    IconButton,
    CircularProgress,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Tooltip,
} from '@mui/material';
import { InsertDriveFile, Image, PictureAsPdf, Download, Delete } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { fetchDocumentFiles, downloadDocumentFile, deleteDocumentFile } from './documentFilesSlice';
import { useEffect } from 'react';
import { formatBytes } from '@/utils/formatBytes';

type Props = {
    documentId: number;
};

const getFileIcon = (mime: string) => {
    if (mime.startsWith('image/')) return <Image color="primary" />;
    if (mime === 'application/pdf') return <PictureAsPdf color="error" />;
    return <InsertDriveFile />;
};

export function DocumentFilesList({ documentId }: Props) {
    const dispatch = useAppDispatch();
    const { data, loading, error } = useAppSelector((s) => s.documentFiles);

    useEffect(() => {
        dispatch(fetchDocumentFiles(documentId));
    }, [dispatch, documentId]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" py={2}>
                <CircularProgress size={24} />
            </Box>
        );
    }

    if (error) {
        return <Typography color="error">{error}</Typography>;
    }

    if (!data.length) {
        return (
            <Typography variant="body2" color="text.secondary">
                Файлы не загружены
            </Typography>
        );
    }

    return (
        <List dense>
            {data.map((file) => (
                <ListItem
                    key={file.id}
                    secondaryAction={
                        <Box display="flex" gap={1}>
                            <Tooltip title="Скачать">
                                <IconButton
                                    onClick={() =>
                                        dispatch(
                                            downloadDocumentFile({
                                                id: file.id,
                                                filename: file.name,
                                            }),
                                        )
                                    }
                                >
                                    <Download fontSize="small" />
                                </IconButton>
                            </Tooltip>

                            <Tooltip title="Удалить">
                                <IconButton
                                    color="error"
                                    onClick={() => dispatch(deleteDocumentFile(file.id))}
                                >
                                    <Delete fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    }
                >
                    <ListItemIcon>{getFileIcon(file.mime_type)}</ListItemIcon>
                    <ListItemText primary={file.name} secondary={formatBytes(file.file_size)} />
                </ListItem>
            ))}
        </List>
    );
}
