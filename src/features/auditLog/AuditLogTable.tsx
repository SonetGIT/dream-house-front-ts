import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Collapse,
    IconButton,
    CircularProgress,
} from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { Fragment, useEffect, useState } from 'react';
import { fetchAuditLog } from './auditLogSlice';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { formatDateTime } from '@/utils/formatDateTime';
import { AuditLogMetadataList } from './AuditLogMetadataList';
import { useReferenceMap } from '../reference/useReferenceMap';

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

export function AuditLogTable({ entity_type, entity_id, formMetadata }: PropsType) {
    const dispatch = useAppDispatch();
    const userRefs = useReferenceMap({ users: ['userFIO'] });
    const { data, loading, error } = useAppSelector((state) => state.auditLog);
    const [openRowId, setOpenRowId] = useState<number | null>(null);

    useEffect(() => {
        if (entity_id) {
            dispatch(fetchAuditLog({ entity_type, entity_id }));
        }
    }, [dispatch, entity_type, entity_id]);

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

    const handleToggle = (id: number) => setOpenRowId(openRowId === id ? null : id);

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Дата</TableCell>
                        <TableCell>Пользователь</TableCell>
                        <TableCell>Вид</TableCell>
                        <TableCell>Item affected</TableCell>
                        <TableCell>Change</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {data?.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} align="center">
                                <Typography variant="body2" color="text.secondary">
                                    История изменений отсутствует
                                </Typography>
                            </TableCell>
                        </TableRow>
                    )}

                    {data?.map((log) => (
                        <Fragment key={log.id}>
                            {/* Основная строка */}
                            <TableRow hover>
                                <TableCell>{formatDateTime(log.created_at)}</TableCell>
                                <TableCell>{userRefs.userFIO(log.user_id)}</TableCell>
                                <TableCell>{log.action}</TableCell>
                                <TableCell>{log.entity_type}</TableCell>
                                <TableCell>
                                    {Object.keys(log.old_values || {}).length > 0 ? (
                                        <IconButton
                                            size="small"
                                            onClick={() => handleToggle(log.id)}
                                        >
                                            {openRowId === log.id ? <ExpandLess /> : <ExpandMore />}
                                        </IconButton>
                                    ) : (
                                        '-'
                                    )}
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell colSpan={6} sx={{ p: 0 }}>
                                    <Collapse
                                        in={openRowId === log.id}
                                        timeout="auto"
                                        unmountOnExit
                                    >
                                        <AuditLogMetadataList
                                            formMetadata={formMetadata!}
                                            oldValues={log.old_values || {}}
                                            newValues={log.new_values || {}}
                                        />
                                    </Collapse>
                                </TableCell>
                            </TableRow>
                        </Fragment>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
