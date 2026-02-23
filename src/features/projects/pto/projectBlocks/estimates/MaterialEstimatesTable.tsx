import {
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    IconButton,
    Collapse,
    Box,
    CircularProgress,
    Chip,
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp, Edit, Delete } from '@mui/icons-material';
import { Fragment, useState } from 'react';
import type { MaterialEstimate } from './materialEstimatesSlice';
import MaterialEstimateItemsTable from './estimateItems/MaterialEstimateItemsTable';
import { useReference } from '@/features/reference/useReference';

interface Props {
    data: MaterialEstimate[];
    onDelete: (id: number) => void;
    onEdit: (estimate: MaterialEstimate) => void;
}

/*************************************************************************************************************/
export default function MaterialEstimatesTable({ data, onDelete, onEdit }: Props) {
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    // Справочники
    const refs = {
        users: useReference('users'),
        statuses: useReference('generalStatuses'),
    };

    const handleDelete = async (id: number) => {
        setDeletingId(id);
        try {
            await onDelete(id);
        } finally {
            setDeletingId(null);
        }
    };

    const formatDate = (date: string | null) => {
        if (!date) return '—';
        return new Date(date).toLocaleDateString('ru-RU');
    };

    // Сокращение статусов
    const getShortStatus = (statusId: number | null) => {
        if (statusId === null) return '—';
        const fullStatus = refs.statuses.lookup(statusId);
        const statusMap: Record<string, string> = {
            Черновик: 'Черн.',
            Подписан: 'Подп.',
            Отклонен: 'Откл.',
            Архив: 'Арх.',
        };
        return statusMap[fullStatus] || fullStatus;
    };

    /**********************************************************************************************************************************/
    return (
        <Box sx={{ overflowX: 'auto', width: '100%' }}>
            <Table
                size="small"
                sx={{
                    minWidth: 1000,
                    borderCollapse: 'collapse',
                    '& th': {
                        fontSize: 13,
                        fontWeight: 600,
                        bgcolor: '#f0f9ff',
                        color: '#0c4a6e',
                        textAlign: 'center',
                        // py: 1,
                        borderBottom: '2px solid #bae6fd',
                    },
                    '& td': {
                        fontSize: 13,
                        textAlign: 'center',
                        // py: 1,
                        borderBottom: '1px solid #e2e8f0',
                    },
                    '& tbody tr:hover': {
                        bgcolor: '#f0f9ff',
                    },
                }}
            >
                <TableHead>
                    <TableRow>
                        <TableCell width={40} />
                        <TableCell>Статус</TableCell>
                        <TableCell>Плановый бюджет</TableCell>
                        <TableCell>Общая площадь</TableCell>
                        <TableCell>Продаваемая площадь</TableCell>
                        <TableCell>Пользователь</TableCell>
                        <TableCell>Подписал</TableCell>
                        <TableCell>Время подписание</TableCell>
                        <TableCell>Цена материалов</TableCell>
                        <TableCell>Цена услуг</TableCell>
                        <TableCell>Общая стоимость</TableCell>
                        <TableCell>Действия</TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {data.map((estimate) => {
                        const isOpen = expandedId === estimate.id;

                        return (
                            <Fragment key={estimate.id}>
                                <TableRow hover>
                                    <TableCell>
                                        <Box
                                            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                                        >
                                            <IconButton
                                                size="small"
                                                onClick={() =>
                                                    setExpandedId(isOpen ? null : estimate.id)
                                                }
                                            >
                                                {isOpen ? (
                                                    <KeyboardArrowUp
                                                        fontSize="small"
                                                        sx={{ color: '#1e40af' }}
                                                    />
                                                ) : (
                                                    <KeyboardArrowDown
                                                        fontSize="small"
                                                        sx={{ color: '#1e40af' }}
                                                    />
                                                )}
                                            </IconButton>
                                        </Box>
                                    </TableCell>

                                    <TableCell>
                                        <Chip
                                            label={getShortStatus(estimate.status)}
                                            size="small"
                                            sx={{
                                                px: 1,
                                                bgcolor: 'white',
                                                border: '1px solid #508ef3',
                                                color: '#3b82f6',
                                                borderRadius: '2px',
                                                height: '20px',
                                                '& .MuiChip-label': {
                                                    padding: 0,
                                                },
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>{estimate.planned_budget}</TableCell>
                                    <TableCell>{estimate.total_area}</TableCell>
                                    <TableCell>{estimate.sale_area}</TableCell>
                                    <TableCell>
                                        {estimate.created_user_id != null
                                            ? refs.users.lookup(estimate.created_user_id)
                                            : '—'}
                                    </TableCell>
                                    <TableCell>
                                        {estimate.approved_user_id != null
                                            ? refs.users.lookup(estimate.approved_user_id)
                                            : '—'}
                                    </TableCell>
                                    <TableCell>{formatDate(estimate.approved_at)}</TableCell>
                                    <TableCell>{estimate.total_price_material}</TableCell>
                                    <TableCell>{estimate.total_price_service}</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#1e40af' }}>
                                        {estimate.total_price}
                                    </TableCell>

                                    <TableCell align="right">
                                        <IconButton size="small" onClick={() => onEdit(estimate)}>
                                            <Edit fontSize="small" sx={{ color: '#1e40af' }} />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            disabled={deletingId === estimate.id}
                                            onClick={() => handleDelete(estimate.id)}
                                        >
                                            {deletingId === estimate.id ? (
                                                <CircularProgress size={16} color="error" />
                                            ) : (
                                                <Delete fontSize="small" color="error" />
                                            )}
                                        </IconButton>
                                    </TableCell>
                                </TableRow>

                                <TableRow>
                                    <TableCell colSpan={12} sx={{ p: 0, border: 0 }}>
                                        <Collapse in={isOpen} timeout="auto" unmountOnExit>
                                            <Box sx={{ bgcolor: '#fafafa', p: 1 }}>
                                                <MaterialEstimateItemsTable
                                                    items={estimate.items}
                                                />
                                            </Box>
                                        </Collapse>
                                    </TableCell>
                                </TableRow>
                            </Fragment>
                        );
                    })}
                </TableBody>
            </Table>
        </Box>
    );
}
