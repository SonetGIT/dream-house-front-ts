import { useEffect, useState } from 'react';
import { Box, Paper, Typography, Button, CircularProgress } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { fetchMaterialEstimates, deleteMaterialEstimate } from './materialEstimatesSlice';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import toast from 'react-hot-toast';
import MaterialEstimatesTable from './MaterialEstimatesTable';
import MaterialEstimateCreateEditDialog from './MaterialEstimateCreateEditDialog';

interface Props {
    blockId: number;
}

export default function MaterialEstimatesPage({ blockId }: Props) {
    const dispatch = useAppDispatch();
    const { data, pagination, loading } = useAppSelector((state) => state.materialEstimates);

    const [page, setPage] = useState(1);
    const size = 10;
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [openEstimateDialog, setOpenEstimateDialog] = useState(false);
    const [editingEstimate, setEditingEstimate] = useState(null);

    /* FETCH */
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

    /* DELETE */
    const handleDelete = (id: number) => {
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;

        try {
            await dispatch(deleteMaterialEstimate(deleteId)).unwrap();
            toast.success('Смета удалена');

            // перезапрос текущей страницы
            dispatch(
                fetchMaterialEstimates({
                    block_id: blockId,
                    page,
                    size,
                }),
            );
        } catch {
            toast.error('Ошибка удаления');
        } finally {
            setDeleteId(null);
        }
    };

    /* PAGINATION */
    const handlePrev = () => pagination?.hasPrev && setPage((p) => p - 1);
    const handleNext = () => pagination?.hasNext && setPage((p) => p + 1);

    /******************************************************************************************************************************************/
    return (
        <Paper sx={{ p: 2, borderRadius: 3 }}>
            {/* Header */}
            <Box>
                <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={() => {
                        setEditingEstimate(null);
                        setOpenEstimateDialog(true);
                    }}
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
                    <MaterialEstimatesTable
                        blockId={blockId}
                        data={data}
                        onDelete={handleDelete}
                        onEdit={(estimate: any) => {
                            setEditingEstimate(estimate);
                            setOpenEstimateDialog(true);
                        }}
                    />

                    {/* PAGINATION */}
                    {/* <Box
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
                    </Box> */}
                </>
            )}

            <MaterialEstimateCreateEditDialog
                open={openEstimateDialog}
                onClose={() => {
                    setOpenEstimateDialog(false);
                    setEditingEstimate(null);
                }}
                blockId={blockId}
                estimate={editingEstimate}
            />

            {/* DELETE CONFIRM */}
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
