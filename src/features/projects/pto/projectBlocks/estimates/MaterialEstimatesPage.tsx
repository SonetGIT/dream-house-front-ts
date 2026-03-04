import { useEffect, useState } from 'react';
import { Box, Paper, Typography, Button, CircularProgress } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/app/store';
import {
    fetchMaterialEstimates,
    deleteMaterialEstimate,
    createMaterialEstimate,
} from './materialEstimatesSlice';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import toast from 'react-hot-toast';
import { MaterialEstimatesTable } from './MaterialEstimatesTable';
import {
    deleteMaterialEstimateItem,
    fetchMaterialEstimateItems,
} from './estimateItems/materialEstimateItemsSlice';

interface Props {
    blockId: number;
}

export default function MaterialEstimatesPage({ blockId }: Props) {
    const dispatch = useAppDispatch();
    const { data, loading } = useAppSelector((state) => state.materialEstimates);

    const [page, setPage] = useState(1);
    const size = 10;
    const [deleteState, setDeleteState] = useState<{
        type: 'estimate' | 'item';
        id: number;
    } | null>(null);

    /* FETCH */
    /* подгрузка ESTIMATE*/
    useEffect(() => {
        if (!blockId) return;

        dispatch(
            fetchMaterialEstimates({
                block_id: blockId,
                page,
                size,
            }),
        );
    }, [dispatch, blockId, page]);

    /* подгрузка ESTIMATE-ITEM*/
    useEffect(() => {
        dispatch(fetchMaterialEstimateItems());
    }, [dispatch]);

    const confirmDelete = async () => {
        if (!deleteState) return;

        try {
            if (deleteState.type === 'item') {
                console.log('Deleting item:', deleteState.id);
                await dispatch(deleteMaterialEstimateItem(deleteState.id)).unwrap();
                toast.success('Позиция удалена');
            }

            if (deleteState.type === 'estimate') {
                await dispatch(deleteMaterialEstimate(deleteState.id)).unwrap();

                toast.success('Смета удалена');

                await dispatch(
                    fetchMaterialEstimates({
                        block_id: blockId,
                        page,
                        size,
                    }),
                ).unwrap();
            }
        } catch {
            toast.error('Ошибка удаления');
        } finally {
            setDeleteState(null);
        }
    };

    const handleCreateEstimate = async () => {
        try {
            await dispatch(
                createMaterialEstimate({
                    block_id: blockId,
                    status: 1, //  1 - черновик
                }),
            ).unwrap();

            toast.success('Смета создана');
        } catch {
            toast.error('Ошибка создания сметы');
        }
    };
    /******************************************************************************************************************************************/
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
                    <MaterialEstimatesTable
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
