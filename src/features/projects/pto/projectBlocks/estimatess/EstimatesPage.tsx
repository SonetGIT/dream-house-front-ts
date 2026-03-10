import { useCallback, useEffect, useState } from 'react';
import { Box, Paper, Typography, Button, CircularProgress } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { deleteEstimate, fetchEstimates, createEstimate } from './estimatesSlice';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import toast from 'react-hot-toast';
import { deleteEstimateItem, fetchEstimateItems } from './estimateItems/estimateItemsSlice';
import EstimatesTable from './EstimatesTable';

interface Props {
    blockId: number;
}

/**********************************************************************************************************/
export default function EstimatesPage({ blockId }: Props) {
    const dispatch = useAppDispatch();
    const { data, loading } = useAppSelector((state) => state.estimates);

    const [page, setPage] = useState(1);
    const size = 10;

    const [deleteState, setDeleteState] = useState<{
        type: 'estimate' | 'item';
        id: number;
    } | null>(null);

    //LOAD ESTIMATES
    useEffect(() => {
        if (!blockId) return;

        dispatch(
            fetchEstimates({
                block_id: blockId,
                page,
                size,
            }),
        );
    }, [blockId, page, size, dispatch]);

    //LOAD ESTIMATE ITEMS
    useEffect(() => {
        dispatch(fetchEstimateItems());
    }, [dispatch]);

    //DELETE
    const confirmDelete = useCallback(async () => {
        if (!deleteState) return;

        try {
            if (deleteState.type === 'item') {
                await dispatch(deleteEstimateItem(deleteState.id)).unwrap();
                toast.success('Позиция удалена');
            } else {
                await dispatch(deleteEstimate(deleteState.id)).unwrap();
                toast.success('Смета удалена');

                dispatch(
                    fetchEstimates({
                        block_id: blockId,
                        page,
                        size,
                    }),
                );
            }
        } catch {
            toast.error('Ошибка удаления');
        } finally {
            setDeleteState(null);
        }
    }, [deleteState, dispatch, blockId, page, size]);

    //CREATE
    const handleCreateEstimate = useCallback(async () => {
        try {
            await dispatch(
                createEstimate({
                    block_id: blockId,
                    status: 1,
                }),
            ).unwrap();

            toast.success('Смета создана');

            dispatch(
                fetchEstimates({
                    block_id: blockId,
                    page,
                    size,
                }),
            );
        } catch {
            toast.error('Ошибка создания сметы');
        }
    }, [dispatch, blockId, page, size]);

    /*************************************************************************************************************************/
    return (
        <Paper sx={{ p: 2, borderRadius: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button variant="outlined" startIcon={<Add />} onClick={handleCreateEstimate}>
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
                    <EstimatesTable
                        data={data}
                        onDeleteEstimateId={(id) => setDeleteState({ type: 'estimate', id })} // удалить смету
                        onDeleteEstimateItemId={(itemId: number) =>
                            setDeleteState({ type: 'item', id: itemId })
                        } // удалить позицию
                    />
                </>
            )}

            {/* DELETE CONFIRM */}
            <ConfirmDialog
                open={!!deleteState && deleteState.type === 'estimate'}
                title="Удалить смету?"
                message="Это действие нельзя отменить."
                onConfirm={confirmDelete}
                onCancel={() => setDeleteState(null)}
            />
            <ConfirmDialog
                open={!!deleteState && deleteState.type === 'item'}
                title="Удалить позицию?"
                message="Это действие нельзя отменить."
                onConfirm={confirmDelete}
                onCancel={() => setDeleteState(null)}
            />
        </Paper>
    );
}
