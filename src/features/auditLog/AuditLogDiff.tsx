import { Stack, Typography, Box } from '@mui/material';

interface Props {
    oldValues: Record<string, any> | null;
    newValues: Record<string, any> | null;
}

export const AuditLogDiff = ({ oldValues, newValues }: Props) => {
    if (!oldValues || !newValues) {
        return (
            <Typography variant="body2" color="text.secondary">
                Нет данных для сравнения
            </Typography>
        );
    }

    const keys = Object.keys(newValues).filter(
        (key) => JSON.stringify(oldValues[key]) !== JSON.stringify(newValues[key]),
    );

    if (!keys.length) {
        return (
            <Typography variant="body2" color="text.secondary">
                Изменений нет
            </Typography>
        );
    }

    return (
        <Stack spacing={1}>
            {keys.map((key) => (
                <Box key={key}>
                    <Typography variant="caption" color="text.secondary">
                        {key}
                    </Typography>

                    <Typography variant="body2">
                        <strong>Было:</strong> {JSON.stringify(oldValues[key]) || '—'}
                    </Typography>

                    <Typography variant="body2">
                        <strong>Стало:</strong> {JSON.stringify(newValues[key]) || '—'}
                    </Typography>
                </Box>
            ))}
        </Stack>
    );
};
