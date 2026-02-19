import { useEffect, useState, useCallback } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    IconButton,
    Button,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/app/store';
import {
    fetchStageSubsections,
    deleteStageSubsection,
    type StageSubsection,
} from './stageSubsectionsSlice';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import toast from 'react-hot-toast';

interface Props {
    sectionId: number;
}

export default function StageSubsectionsList({ sectionId }: Props) {
    const dispatch = useAppDispatch();
    const { bySectionId, paginationBySectionId } = useAppSelector(
        (state) => state.stageSubsections,
    );

    const data = bySectionId[sectionId] ?? [];
    const pagination = paginationBySectionId[sectionId];

    const [searchText, setSearchText] = useState('');
    const [page, setPage] = useState(1);
    const size = 10;
    const [deleteId, setDeleteId] = useState<number | null>(null);

    // Сброс страницы при смене секции
    useEffect(() => {
        setPage(1);
    }, [sectionId]);

    // Загрузка данных
    useEffect(() => {
        if (sectionId) {
            dispatch(
                fetchStageSubsections({
                    stage_id: sectionId,
                    page,
                    size,
                    search: searchText,
                }),
            );
        }
    }, [dispatch, sectionId, page, size, searchText]);

    const handleDelete = (id: number) => setDeleteId(id);

    const confirmDelete = async () => {
        if (!deleteId) return;

        try {
            await dispatch(deleteStageSubsection({ id: deleteId, sectionId })).unwrap();
            toast.success('Подраздел удалён');
        } catch (err) {
            toast.error('Ошибка удаления');
        } finally {
            setDeleteId(null);
        }
    };

    const handlePrev = () => pagination?.hasPrev && setPage((p) => p - 1);
    const handleNext = () => pagination?.hasNext && setPage((p) => p + 1);

    return (
        <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
            {/* Заголовок + поиск */}
            <Box sx={{ p: 1.5, display: 'flex', gap: 1, alignItems: 'center' }}>
                <Typography variant="subtitle2" fontWeight={600}>
                    Подразделы
                </Typography>
                <Box sx={{ flex: 1 }} />
                <TextField
                    size="small"
                    placeholder="Поиск..."
                    value={searchText}
                    onChange={(e) => {
                        setSearchText(e.target.value);
                        setPage(1);
                    }}
                    sx={{ width: 200 }}
                    inputProps={{ style: { fontSize: '0.875rem' } }}
                />
                <Button
                    size="small"
                    startIcon={<Add />}
                    onClick={() => toast.error('Добавление подразделов скоро будет')}
                    sx={{ height: 32, px: 1.5, fontSize: '0.875rem' }}
                >
                    Добавить
                </Button>
            </Box>

            {/* Таблица */}
            {data.length === 0 ? (
                <Box sx={{ py: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        {searchText ? 'Нет результатов' : 'Подразделы отсутствуют'}
                    </Typography>
                </Box>
            ) : (
                <>
                    <Table size="small" sx={{ minWidth: 0 }}>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'grey.50' }}>
                                <TableCell sx={{ py: 1, fontSize: '0.875rem', fontWeight: 600 }}>
                                    Название
                                </TableCell>
                                <TableCell
                                    align="right"
                                    sx={{ py: 1, fontSize: '0.875rem', fontWeight: 600 }}
                                >
                                    Действия
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.map((sub) => (
                                <TableRow key={sub.id} hover sx={{ cursor: 'default' }}>
                                    <TableCell sx={{ py: 1.25, fontSize: '0.875rem' }}>
                                        {sub.name}
                                    </TableCell>
                                    <TableCell align="right" sx={{ py: 1.25 }}>
                                        <IconButton
                                            size="small"
                                            onClick={() => toast.error('Редактирование...')}
                                        >
                                            <Edit fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => handleDelete(sub.id)}
                                        >
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {/* Пагинация */}
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            p: 1.5,
                            borderTop: '1px solid',
                            borderColor: 'divider',
                        }}
                    >
                        <Button
                            size="small"
                            disabled={!pagination?.hasPrev}
                            onClick={handlePrev}
                            sx={{ minWidth: 32, px: 1 }}
                        >
                            ←
                        </Button>
                        <Typography variant="body2" sx={{ mx: 1, lineHeight: '32px' }}>
                            {page} / {pagination?.pages || 1}
                        </Typography>
                        <Button
                            size="small"
                            disabled={!pagination?.hasNext}
                            onClick={handleNext}
                            sx={{ minWidth: 32, px: 1 }}
                        >
                            →
                        </Button>
                    </Box>
                </>
            )}

            {/* Подтверждение удаления */}
            <ConfirmDialog
                open={!!deleteId}
                title="Удалить?"
                message="Это действие нельзя отменить."
                onConfirm={confirmDelete}
                onCancel={() => setDeleteId(null)}
            />
        </Paper>
    );
}
