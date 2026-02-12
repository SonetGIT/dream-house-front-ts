import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableRow,
    Paper,
    Typography,
    IconButton,
    CircularProgress,
} from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { Fragment, useEffect, useState } from 'react';
import { fetchAuditLog } from './auditLogSlice';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { formatDateTime } from '@/utils/formatDateTime';
import { useReference } from '../reference/useReference';
import { AuditLogMetadataList } from './AuditLogMetadataList';

/* ===================== types ===================== */

interface FormField {
    type: string;
    name: string;
    label: string;
}

interface FormSection {
    id: string;
    contents: FormField[];
}

export interface FormMetadata {
    formName: string;
    label: string;
    sections: FormSection[];
}

interface PropsType {
    entity_type: string;
    entity_id: number;
    formMetadata?: FormMetadata;
}

/********************************************************************************************************************************/
export function AuditLogTable({ entity_type, entity_id, formMetadata }: PropsType) {
    const dispatch = useAppDispatch();
    const { data, loading, error } = useAppSelector((state) => state.auditLog);

    const users = useReference('users');
    const [openRowId, setOpenRowId] = useState<number | null>(null);

    useEffect(() => {
        if (entity_id) {
            dispatch(fetchAuditLog({ entity_type, entity_id }));
        }
    }, [dispatch, entity_type, entity_id]);

    const handleToggle = (id: number) => {
        setOpenRowId((prev) => (prev === id ? null : id));
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress size={28} />
            </Box>
        );
    }

    if (error) {
        return (
            <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid', borderColor: 'error.light' }}>
                <Typography color="error" variant="body2">
                    {error}
                </Typography>
            </Paper>
        );
    }

    if (!data?.length) {
        return (
            <Paper
                sx={{
                    p: 4,
                    textAlign: 'center',
                    borderRadius: 2,
                    border: '1px dashed',
                    borderColor: 'divider',
                }}
            >
                <Typography variant="body2" color="text.secondary">
                    История изменений отсутствует
                </Typography>
            </Paper>
        );
    }

    /****************************************************************************************************************************/
    return (
        <Box>
            {data.map((log) => {
                const isOpen = openRowId === log.id;
                return (
                    <Fragment key={log.id}>
                        {/* ===== ROW TABLE ===== */}
                        <Paper variant="outlined" sx={{ mb: isOpen ? 0 : 1 }}>
                            <Table size="small">
                                <TableBody>
                                    <TableRow
                                        hover
                                        sx={{ cursor: 'pointer' }}
                                        onClick={() => handleToggle(log.id)}
                                    >
                                        <TableCell width={160}>
                                            <Typography variant="caption">
                                                {formatDateTime(log.created_at)}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            <Typography variant="body2">
                                                {users.lookup(log.user_id)}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            <Typography variant="body2">
                                                {log.entity_type}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            <Typography variant="body2">{log.action}</Typography>
                                        </TableCell>

                                        <TableCell width={48} align="right">
                                            {Object.keys(log.old_values || {}).length > 0 && (
                                                <IconButton size="small">
                                                    {isOpen ? (
                                                        <ExpandLess fontSize="small" />
                                                    ) : (
                                                        <ExpandMore fontSize="small" />
                                                    )}
                                                </IconButton>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </Paper>

                        {/* Детали истории */}
                        {isOpen && (
                            <Box mb={2}>
                                <AuditLogMetadataList
                                    formMetadata={formMetadata!}
                                    oldValues={log.old_values || {}}
                                    newValues={log.new_values || {}}
                                />
                            </Box>
                        )}
                    </Fragment>
                );
            })}
        </Box>
    );
}
