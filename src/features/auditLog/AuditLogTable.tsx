import {
    Box,
    Table,
    TableBody,
    TableCell,
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
import { useReference } from '../reference/useReference';
import { AuditLogMetadataList } from './AuditLogMetadataList';

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

    const { data, loading, error } = useAppSelector((state) => state.auditLog);
    const [openRowId, setOpenRowId] = useState<number | null>(null);

    const users = useReference('users');

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

    /******************************************************************************************************************************/
    return (
        <Paper>
            <Table className="table">
                <TableHead>
                    <TableRow>
                        <TableCell>Дата</TableCell>
                        <TableCell>Пользователь</TableCell>
                        <TableCell>Сущность</TableCell>
                        <TableCell>Действие</TableCell>
                        <TableCell>Свернуть</TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {data?.length === 0 && (
                        <TableRow>
                            <TableCell>
                                <Typography>История изменений отсутствует</Typography>
                            </TableCell>
                        </TableRow>
                    )}

                    {data?.map((log) => (
                        <Fragment key={log.id}>
                            {/* Основная строка */}
                            <TableRow
                                hover
                                sx={{ cursor: 'pointer' }}
                                onClick={() => handleToggle(log.id)}
                            >
                                <TableCell align="center">
                                    {formatDateTime(log.created_at)}
                                </TableCell>
                                <TableCell align="center">{users.lookup(log.user_id)}</TableCell>
                                <TableCell align="center">{log.entity_type}</TableCell>
                                <TableCell align="center">{log.action}</TableCell>
                                <TableCell align="center">
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
                                <TableCell colSpan={5} sx={{ p: 0 }}>
                                    <Collapse
                                        in={openRowId === log.id}
                                        timeout="auto"
                                        unmountOnExit
                                    >
                                        <Box
                                            sx={{
                                                all: 'unset',
                                                display: 'block',
                                                width: '100%',
                                                isolation: 'isolate',
                                            }}
                                        >
                                            <AuditLogMetadataList
                                                formMetadata={formMetadata!}
                                                oldValues={log.old_values || {}}
                                                newValues={log.new_values || {}}
                                            />
                                        </Box>
                                    </Collapse>
                                </TableCell>
                            </TableRow>
                        </Fragment>
                    ))}
                </TableBody>
            </Table>
        </Paper>
    );
}
