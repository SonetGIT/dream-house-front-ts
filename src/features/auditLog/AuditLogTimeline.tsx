import { Box, CircularProgress, Divider, Stack, Typography, Paper } from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { formatDateTime } from '@/utils/formatDateTime';
import { AuditLogDiff } from './AuditLogDiff';
import { fetchAuditLog } from './auditLogSlice';
import { useEffect } from 'react';
interface PropsType {
    entity_type: string;
    entity_id: number;
}

export default function AuditLogTimeline(props: PropsType) {
    const dispatch = useAppDispatch();
    const { data, loading, error } = useAppSelector((state) => state.auditLog);
    console.log('props.entity_type', props.entity_type, props.entity_id);
    useEffect(() => {
        dispatch(
            fetchAuditLog({
                entity_type: props.entity_type,
                entity_id: props.entity_id,
            }),
        );
    }, [dispatch, props.entity_id]);
    if (loading) {
        return (
            <Box display="flex" justifyContent="center" p={2}>
                <CircularProgress size={24} />
            </Box>
        );
    }

    if (error) {
        return (
            <Typography color="error" variant="body2">
                {error}
            </Typography>
        );
    }

    if (!data.length) {
        return (
            <Typography variant="body2" color="text.secondary">
                История изменений отсутствует
            </Typography>
        );
    }

    return (
        <Stack spacing={2}>
            {data.map((log) => (
                <Paper key={log.id} variant="outlined" sx={{ p: 2 }}>
                    <Stack spacing={1}>
                        <Typography variant="caption" color="text.secondary">
                            {formatDateTime(log.created_at)}
                        </Typography>

                        <Typography variant="subtitle2">Действие: {log.action}</Typography>

                        <Divider />

                        <AuditLogDiff oldValues={log.old_values} newValues={log.new_values} />
                    </Stack>
                </Paper>
            ))}
        </Stack>
    );
}
