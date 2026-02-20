import { useEffect, useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    IconButton,
    Button,
    CircularProgress,
    Collapse,
    Select,
    MenuItem,
} from '@mui/material';
import { Add, Edit, Delete, KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { fetchMaterialEstimates, deleteMaterialEstimate } from './materialEstimatesSlice';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import toast from 'react-hot-toast';
import { ReferenceSelect } from '@/components/ui/ReferenceSelect';

interface Props {
    blockId: number;
}

/********************************************************************************************************/
export default function MaterialEstimatesList({ blockId }: Props) {
    const dispatch = useAppDispatch();
    const { data, pagination, loading } = useAppSelector((state) => state.materialEstimates);

    const [page, setPage] = useState(1);
    const size = 10;
    const [status, setStatus] = useState<number | undefined>(undefined);
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    /* FETCH */
    useEffect(() => {
        if (!blockId) return;

        dispatch(
            fetchMaterialEstimates({
                block_id: blockId,
                status,
                page,
                size,
            }),
        );
    }, [dispatch, blockId, page, size, status]);

    /* DELETE */
    const confirmDelete = async () => {
        if (!deleteId) return;

        try {
            await dispatch(deleteMaterialEstimate(deleteId)).unwrap();
            toast.success('Смета удалена');
        } catch {
            toast.error('Ошибка удаления');
        } finally {
            setDeleteId(null);
        }
    };

    const handlePrev = () => pagination?.hasPrev && setPage((p) => p - 1);
    const handleNext = () => pagination?.hasNext && setPage((p) => p + 1);

    return (
        <Paper sx={{ p: 2, borderRadius: 3 }}>
            {/* Header */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    // mb: 2,
                    // gap: 2,
                }}
            >
                <Box sx={{ display: 'flex', gap: 2 }}>
                    {/* <ReferenceSelect
                        size="small"
                        value={status ?? ''}
                        // displayEmpty
                        onChange={(e) =>
                            setStatus(e.target.value === '' ? undefined : Number(e.target.value))
                        }
                    >
                        <MenuItem value="">Все статусы</MenuItem>
                        <MenuItem value={1}>Черновик</MenuItem>
                        <MenuItem value={2}>На согласовании</MenuItem>
                        <MenuItem value={3}>Утверждена</MenuItem>
                    </ReferenceSelect> */}
                </Box>

                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => toast.error('Форма создания пока не подключена')}
                >
                    Добавить смету
                </Button>
            </Box>

            {/* CONTENT */}
            {loading ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            ) : data.length === 0 ? (
                <Typography color="text.secondary">Сметы отсутствуют</Typography>
            ) : (
                <>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell width={50} />
                                <TableCell>Плановый бюджет</TableCell>
                                <TableCell>Общая площадь</TableCell>
                                <TableCell>Продоваемая площадь</TableCell>
                                <TableCell>Статус</TableCell>
                                <TableCell>Пользователь</TableCell>
                                <TableCell>Подписал</TableCell>
                                <TableCell>Время подписание</TableCell>
                                <TableCell>Цена материалов</TableCell>
                                <TableCell>Цена услуг</TableCell>
                                <TableCell>Общая стоимость</TableCell>
                                <TableCell align="right">Действия</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {data.map((estimate) => {
                                const isOpen = expandedId === estimate.id;

                                return (
                                    <>
                                        <TableRow key={estimate.id} hover>
                                            <TableCell>
                                                <IconButton
                                                    size="small"
                                                    onClick={() =>
                                                        setExpandedId(isOpen ? null : estimate.id)
                                                    }
                                                >
                                                    {isOpen ? (
                                                        <KeyboardArrowUp fontSize="small" />
                                                    ) : (
                                                        <KeyboardArrowDown fontSize="small" />
                                                    )}
                                                </IconButton>
                                            </TableCell>
                                            <TableCell>{estimate.planned_budget}</TableCell>
                                            <TableCell>{estimate.total_area}</TableCell>
                                            <TableCell>{estimate.sale_area}</TableCell>
                                            <TableCell>{estimate.status}</TableCell>
                                            <TableCell>{estimate.created_user_id}</TableCell>
                                            <TableCell>{estimate.approved_user_id}</TableCell>
                                            <TableCell>{estimate.approved_at}</TableCell>
                                            <TableCell>{estimate.total_price_material}</TableCell>
                                            <TableCell>{estimate.total_price_service}</TableCell>
                                            <TableCell>{estimate.total_price}</TableCell>
                                            <TableCell align="right">
                                                <IconButton size="small">
                                                    <Edit fontSize="small" />
                                                </IconButton>

                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => setDeleteId(estimate.id)}
                                                >
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>

                                        {/* ITEMS */}
                                        <TableRow>
                                            <TableCell colSpan={12} sx={{ p: 0, border: 0 }}>
                                                <Collapse in={isOpen} timeout="auto" unmountOnExit>
                                                    <Box sx={{ bgcolor: '#fafafa' }}>
                                                        {estimate.items.length === 0 ? (
                                                            <Typography sx={{ p: 2 }}>
                                                                Нет позиций
                                                            </Typography>
                                                        ) : (
                                                            <Table
                                                                size="small"
                                                                sx={{
                                                                    borderCollapse: 'collapse',
                                                                    '& th': {
                                                                        fontSize: 12,
                                                                        fontWeight: 600,
                                                                        bgcolor: '#f2f2f2',
                                                                        color: '#555',
                                                                        py: 0.8,
                                                                        borderBottom:
                                                                            '1px solid #ddd',
                                                                    },
                                                                    '& td': {
                                                                        fontSize: 13,
                                                                        py: 0.6,
                                                                        borderBottom:
                                                                            '1px solid #eee',
                                                                    },
                                                                    '& tbody tr:hover': {
                                                                        bgcolor: '#f9f9f9',
                                                                    },
                                                                }}
                                                            >
                                                                <TableHead>
                                                                    <TableRow>
                                                                        <TableCell>Тип</TableCell>
                                                                        <TableCell>
                                                                            Группа услуг
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            Услуга
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            Тип материала
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            Материал
                                                                        </TableCell>
                                                                        <TableCell align="center">
                                                                            ед. изм
                                                                        </TableCell>
                                                                        <TableCell align="right">
                                                                            Кол-во
                                                                        </TableCell>
                                                                        <TableCell align="right">
                                                                            Коэффициент
                                                                        </TableCell>
                                                                        <TableCell align="center">
                                                                            Валюта
                                                                        </TableCell>
                                                                        <TableCell align="right">
                                                                            Цена
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            Примечание
                                                                        </TableCell>
                                                                    </TableRow>
                                                                </TableHead>

                                                                <TableBody>
                                                                    {estimate.items.map((item) => (
                                                                        <TableRow key={item.id}>
                                                                            <TableCell>
                                                                                {item.item_type}
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                {item.service_type}
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                {item.service_id}
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                {item.material_type}
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                {item.material_id}
                                                                            </TableCell>

                                                                            <TableCell align="center">
                                                                                {
                                                                                    item.unit_of_measure
                                                                                }
                                                                            </TableCell>

                                                                            <TableCell align="right">
                                                                                {
                                                                                    item.quantity_planned
                                                                                }
                                                                            </TableCell>

                                                                            <TableCell align="right">
                                                                                {item.coefficient}
                                                                            </TableCell>

                                                                            <TableCell align="center">
                                                                                {item.currency ||
                                                                                    null}
                                                                            </TableCell>

                                                                            <TableCell align="right">
                                                                                {item.price || 0}
                                                                            </TableCell>

                                                                            <TableCell>
                                                                                {item.comment}
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    ))}
                                                                </TableBody>
                                                            </Table>
                                                        )}
                                                    </Box>
                                                </Collapse>
                                            </TableCell>
                                        </TableRow>
                                    </>
                                );
                            })}
                        </TableBody>
                    </Table>

                    {/* PAGINATION */}
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            mt: 2,
                            gap: 1,
                        }}
                    >
                        <Button size="small" disabled={!pagination?.hasPrev} onClick={handlePrev}>
                            ←
                        </Button>

                        <Typography variant="body2">
                            {page} / {pagination?.pages || 1}
                        </Typography>

                        <Button size="small" disabled={!pagination?.hasNext} onClick={handleNext}>
                            →
                        </Button>
                    </Box>
                </>
            )}

            <ConfirmDialog
                open={!!deleteId}
                title="Удалить смету?"
                message="Это действие нельзя отменить."
                onConfirm={confirmDelete}
                onCancel={() => setDeleteId(null)}
            />
        </Paper>
    );
}
