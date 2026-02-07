import { Box, Typography, Paper, Divider, Chip } from '@mui/material';
import { formatDateTime } from '@/utils/formatDateTime';
import { useReference } from '@/features/reference/useReference';

interface DocumentHistoryItem {
    id: number;
    entity_type: string;
    entity_id: number;
    action: string;
    old_values: Record<string, any>;
    new_values: Record<string, any>;
    user_id: number;
    comment: string | null;
    created_at: string;
}

interface DocumentHistoryProps {
    history: DocumentHistoryItem[];
    loading?: boolean;
    error?: string;
}

// Поля для отслеживания изменений
const TRACKED_FIELDS = {
    name: 'Название',
    price: 'Цена',
    status: 'Статус',
    deadline: 'Крайний срок',
    description: 'Описание',
    responsible_users: 'Соисполнители',
};

export function DocumentHistoryTimeline({ history, loading = false, error }: DocumentHistoryProps) {
    const { lookup: getStatusName } = useReference('5c18ca4d-c9ab-41f3-936b-415f060b02b2');
    const { data: users } = useReference('d0336075-e674-41ef-aa38-189de9adaeb4');

    // useEffect(() => {
    //     dispatch(
    //         fetchAuditLog({
    //             entity_type: 'document',
    //             entity_id: doc.id,
    //         }),
    //     );
    // }, [dispatch, doc.id]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" p={3}>
                <Typography>Загрузка истории...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Paper sx={{ p: 2 }}>
                <Typography color="error">{error}</Typography>
            </Paper>
        );
    }

    if (!history?.length) {
        return (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">История изменений пуста</Typography>
            </Paper>
        );
    }

    // Получить имя пользователя
    const getUserName = (userId: number) => {
        return users?.find((u) => u.id === userId)?.name || `Пользователь #${userId}`;
    };

    // Форматировать значение поля
    const formatValue = (field: string, value: any) => {
        if (value === null || value === undefined) return '—';

        switch (field) {
            case 'price':
                return value.toLocaleString('ru-RU', { style: 'currency', currency: 'KZT' });
            case 'deadline':
                return value ? new Date(value).toLocaleDateString('ru-RU') : '—';
            case 'status':
                return getStatusName(value);
            case 'responsible_users':
                return Array.isArray(value)
                    ? value
                          .map((id) => users?.find((u) => u.id === id)?.name || `#${id}`)
                          .join(', ')
                    : String(value);
            default:
                return String(value);
        }
    };

    // Определить тип изменения
    const getChangeType = (field: string, oldValue: any, newValue: any) => {
        if (oldValue === null && newValue !== null) return 'added';
        if (oldValue !== null && newValue === null) return 'removed';
        if (Array.isArray(oldValue) && Array.isArray(newValue)) {
            const added = newValue.filter((v) => !oldValue.includes(v));
            const removed = oldValue.filter((v) => !newValue.includes(v));
            if (added.length > 0 && removed.length > 0) return 'modified';
            if (added.length > 0) return 'added';
            if (removed.length > 0) return 'removed';
        }
        return 'modified';
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                maxHeight: 600,
                overflowY: 'auto',
                pr: 1,
            }}
        >
            {history.map((entry) => {
                // Найти изменённые поля
                const changedFields = Object.keys(TRACKED_FIELDS).filter((field) => {
                    const oldValue = entry.old_values[field];
                    const newValue = entry.new_values[field];

                    if (Array.isArray(oldValue) && Array.isArray(newValue)) {
                        return JSON.stringify(oldValue.sort()) !== JSON.stringify(newValue.sort());
                    }
                    return oldValue !== newValue;
                });

                return (
                    <Paper
                        key={entry.id}
                        sx={{
                            p: 2,
                            borderRadius: 2,
                            borderLeft: '3px solid',
                            borderColor: 'primary.main',
                            bgcolor: 'background.paper',
                        }}
                    >
                        {/* Заголовок записи */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="subtitle2" fontWeight={600}>
                                {getUserName(entry.user_id)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {formatDateTime(entry.created_at)}
                            </Typography>
                        </Box>

                        {/* Изменённые поля */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                            {changedFields.map((field) => {
                                const oldValue = entry.old_values[field];
                                const newValue = entry.new_values[field];
                                const changeType = getChangeType(field, oldValue, newValue);

                                return (
                                    <Box key={field} sx={{ display: 'flex', gap: 1 }}>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ minWidth: 120 }}
                                        >
                                            {TRACKED_FIELDS[field as keyof typeof TRACKED_FIELDS]}:
                                        </Typography>

                                        {/* Старое значение */}
                                        {changeType !== 'added' && (
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 0.5,
                                                }}
                                            >
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        textDecoration: 'line-through',
                                                        color: 'text.disabled',
                                                    }}
                                                >
                                                    {formatValue(field, oldValue)}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    →
                                                </Typography>
                                            </Box>
                                        )}

                                        {/* Новое значение */}
                                        <Typography
                                            variant="body2"
                                            fontWeight={500}
                                            sx={{
                                                color:
                                                    changeType === 'removed'
                                                        ? 'error.main'
                                                        : 'text.primary',
                                            }}
                                        >
                                            {changeType === 'removed'
                                                ? 'удалено'
                                                : formatValue(field, newValue)}
                                        </Typography>
                                    </Box>
                                );
                            })}
                        </Box>

                        {/* Комментарий (если есть) */}
                        {entry.comment && (
                            <Box
                                sx={{
                                    mt: 1,
                                    pt: 1,
                                    borderTop: '1px solid',
                                    borderColor: 'divider',
                                }}
                            >
                                <Typography variant="body2" color="text.secondary">
                                    Комментарий: {entry.comment}
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                );
            })}
        </Box>
    );
}
