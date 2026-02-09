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
    Stack,
} from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { useState } from 'react';
import type { AuditLogItem } from './auditLogSlice';

interface AuditLogTableProps {
    logs: AuditLogItem[];
}

export function AuditLogTable({ logs }: AuditLogTableProps) {
    const [openRowId, setOpenRowId] = useState<number | null>(null);

    const handleToggle = (id: number) => setOpenRowId(openRowId === id ? null : id);

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Time</TableCell>
                        <TableCell>User</TableCell>
                        <TableCell>Event type</TableCell>
                        <TableCell>Item affected</TableCell>
                        <TableCell>Change</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {logs.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} align="center">
                                <Typography variant="body2" color="text.secondary">
                                    История изменений отсутствует
                                </Typography>
                            </TableCell>
                        </TableRow>
                    )}

                    {logs.map((log) => (
                        <Box key={log.id} component="tbody">
                            {/* Основная строка */}
                            <TableRow hover>
                                <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                                <TableCell>{log.user_id}</TableCell>
                                <TableCell>{log.action}</TableCell>
                                <TableCell>-</TableCell>
                                <TableCell>-</TableCell>
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

                            {/* Подтаблица для diff */}
                            <TableRow>
                                <TableCell colSpan={6} sx={{ p: 0, border: 0 }}>
                                    <Collapse
                                        in={openRowId === log.id}
                                        timeout="auto"
                                        unmountOnExit
                                    >
                                        <Table size="small">
                                            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                                <TableRow>
                                                    <TableCell>Field</TableCell>
                                                    <TableCell>Old Value</TableCell>
                                                    <TableCell>New Value</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {Object.keys(log.old_values || {}).map((key) => {
                                                    let oldVal = log.old_values?.[key];
                                                    let newVal = log.new_values?.[key];

                                                    // Преобразуем массив пользователей в строку
                                                    if (Array.isArray(oldVal))
                                                        oldVal = oldVal
                                                            .map((u: any) => u.name || u)
                                                            .join(', ');
                                                    if (Array.isArray(newVal))
                                                        newVal = newVal
                                                            .map((u: any) => u.name || u)
                                                            .join(', ');

                                                    return (
                                                        <TableRow key={key}>
                                                            <TableCell>{key}</TableCell>
                                                            <TableCell
                                                                sx={{
                                                                    color: 'red',
                                                                    fontWeight: 500,
                                                                }}
                                                            >
                                                                {oldVal ?? '-'}
                                                            </TableCell>
                                                            <TableCell
                                                                sx={{
                                                                    color: 'green',
                                                                    fontWeight: 500,
                                                                }}
                                                            >
                                                                {newVal ?? '-'}
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </Collapse>
                                </TableCell>
                            </TableRow>
                        </Box>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
