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
    Stack,
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

// Константы стилей
const STYLES = {
    tableRow: {
        '&:hover': { bgcolor: 'action.hover' },
        transition: 'background-color 0.2s ease',
    },
    fileCell: {
        width: '60%',
        pl: 2,
        pr: 1,
    },
    actionButton: {
        width: 36,
        height: 36,
        transition: 'all 0.2s ease',
    },
    downloadButton: {
        '&:hover': {
            color: 'primary.main',
            bgcolor: 'primary.lighter',
        },
    },
} as const;

export function LegalDocFilesList({ documentId }: Props) {
    const dispatch = useAppDispatch();
    const { data, loading, error } = useAppSelector((s) => s.documentFiles);

    useEffect(() => {
        dispatch(fetchDocumentFiles(documentId));
    }, [dispatch, documentId]);

    // Loading state
    if (loading) {
        return (
            <Stack alignItems="center" py={2}>
                <CircularProgress size={24} />
            </Stack>
        );
    }

    // Error state
    if (error) {
        return (
            <Typography color="error" variant="body2">
                {error}
            </Typography>
        );
    }

    // Empty state
    if (!data.length) {
        return (
            <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                Файлы не загружены
            </Typography>
        );
    }

    // Main render
    return (
        <Paper variant="outlined">
            <Table size="small">
                <TableBody>
                    {data.map((file) => (
                        <TableRow key={file.id} sx={STYLES.tableRow}>
                            {/* Иконка + Название */}
                            <TableCell sx={STYLES.fileCell}>
                                <Stack direction="row" alignItems="center" spacing={1.5}>
                                    {getFileIcon(file.mime_type)}
                                    <Box>
                                        <Typography variant="body2" fontWeight={500} noWrap>
                                            {file.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {formatBytes(file.file_size)}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </TableCell>

                            {/* Действия */}
                            <TableCell align="right">
                                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
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
                                                ...STYLES.actionButton,
                                                ...STYLES.downloadButton,
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
                                            sx={STYLES.actionButton}
                                        >
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    </StyledTooltip>
                                </Stack>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Paper>
    );
}
