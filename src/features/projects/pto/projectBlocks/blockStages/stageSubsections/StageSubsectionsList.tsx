import { useEffect, useState } from 'react';
import { Box, Paper, Typography, TextField, IconButton, Button } from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { fetchStageSubsections, deleteStageSubsection } from './stageSubsectionsSlice';
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

    useEffect(() => {
        setPage(1);
    }, [sectionId]);

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

    const confirmDelete = async () => {
        if (!deleteId) return;

        try {
            await dispatch(deleteStageSubsection({ id: deleteId, sectionId })).unwrap();
            toast.success('Подраздел удалён');
        } catch {
            toast.error('Ошибка удаления');
        } finally {
            setDeleteId(null);
        }
    };

    const handlePrev = () => pagination?.hasPrev && setPage((p) => p - 1);
    const handleNext = () => pagination?.hasNext && setPage((p) => p + 1);

    return (
        <Paper
            sx={{
                borderRadius: 2,
                overflow: 'hidden',
                // bgcolor: 'grey.50',
            }}
        >
            {/* Поиск + кнопка */}
            <Box
                sx={{
                    p: 1,
                    display: 'flex',
                    gap: 1,
                    alignItems: 'center',
                }}
            >
                <TextField
                    size="small"
                    placeholder="Поиск..."
                    value={searchText}
                    onChange={(e) => {
                        setSearchText(e.target.value);
                        setPage(1);
                    }}
                    sx={{
                        width: 160,
                        '& .MuiOutlinedInput-root': {
                            height: 30,
                            fontSize: '0.8rem',
                        },
                    }}
                />

                <Button
                    size="small"
                    startIcon={<Add />}
                    sx={{ height: 30, fontSize: '0.8rem' }}
                    onClick={() => toast.error('Добавление подразделов скоро будет')}
                >
                    Добавить
                </Button>
            </Box>

            {/* Список */}
            {data.length === 0 ? (
                <Box sx={{ py: 2, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                        {searchText ? 'Нет результатов' : 'Подразделы отсутствуют'}
                    </Typography>
                </Box>
            ) : (
                <>
                    {data.map((sub) => (
                        <Box
                            key={sub.id}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                px: 2,
                                py: 1,
                                fontSize: '0.85rem',
                                borderTop: '1px solid',
                                borderColor: 'divider',
                                '&:hover': {
                                    bgcolor: 'action.hover',
                                },
                            }}
                        >
                            <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                                {sub.name}
                            </Typography>

                            <Box>
                                <IconButton
                                    size="small"
                                    onClick={() => toast.error('Редактирование...')}
                                >
                                    <Edit fontSize="small" />
                                </IconButton>

                                <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => setDeleteId(sub.id)}
                                >
                                    <Delete fontSize="small" />
                                </IconButton>
                            </Box>
                        </Box>
                    ))}

                    {/* Пагинация */}
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            p: 1,
                            borderTop: '1px solid',
                            borderColor: 'divider',
                            gap: 1,
                        }}
                    >
                        <Button
                            size="small"
                            disabled={!pagination?.hasPrev}
                            onClick={handlePrev}
                            sx={{ minWidth: 28, px: 0.5 }}
                        >
                            ←
                        </Button>
                        <Typography variant="caption" sx={{ lineHeight: '28px' }}>
                            {page} / {pagination?.pages || 1}
                        </Typography>
                        <Button
                            size="small"
                            disabled={!pagination?.hasNext}
                            onClick={handleNext}
                            sx={{ minWidth: 28, px: 0.5 }}
                        >
                            →
                        </Button>
                    </Box>
                </>
            )}

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
