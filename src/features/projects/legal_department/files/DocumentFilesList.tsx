import {
    Box,
    Typography,
    IconButton,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableRow,
    Paper,
} from '@mui/material';
import { Download, Delete } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { fetchDocumentFiles, downloadDocumentFile, deleteDocumentFile } from './documentFilesSlice';
import { useEffect } from 'react';
import { formatBytes } from '@/utils/formatBytes';
import { StyledTooltip } from '@/components/ui/StyledTooltip';
import { getFileIcon } from '@/utils/getFileIcon';

type Props = {
    documentId: number;
};
/**********************************************************************************************************************/
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
            <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                Файлы не загружены
            </Typography>
        );
    }

    /**********************************************************************************************************************/
    return (
        <Paper variant="outlined">
            <Table size="small">
                <TableBody>
                    {data.map((file) => (
                        <TableRow
                            key={file.id}
                            sx={{
                                '&:hover': {
                                    bgcolor: 'action.hover',
                                },
                                transition: 'background-color 0.2s',
                            }}
                        >
                            {/* Иконка + Название */}
                            <TableCell sx={{ width: '60%', pl: 2, pr: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    {getFileIcon(file.mime_type)}
                                    <Box>
                                        <Typography variant="body2" fontWeight={500}>
                                            {file.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {formatBytes(file.file_size)}
                                        </Typography>
                                    </Box>
                                </Box>
                            </TableCell>

                            {/* Действия */}
                            <TableCell>
                                <Box sx={{ display: 'flex', justifyContent: 'end', gap: 1 }}>
                                    <StyledTooltip title="Скачать">
                                        <IconButton
                                            size="small"
                                            onClick={() =>
                                                dispatch(
                                                    downloadDocumentFile({
                                                        file_id: file.id,
                                                        filename: file.name,
                                                    }),
                                                )
                                            }
                                            sx={{
                                                width: 34,
                                                height: 34,
                                                '&:hover': {
                                                    color: 'primary.main',
                                                },
                                            }}
                                        >
                                            <Download fontSize="small" />
                                        </IconButton>
                                    </StyledTooltip>
                                    <StyledTooltip title="Удалить">
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => dispatch(deleteDocumentFile(file.id))}
                                        >
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    </StyledTooltip>
                                </Box>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Paper>
    );
}
