import { useCallback, useEffect, useState } from 'react';
import { Box, Paper, Typography, Button, CircularProgress } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/app/store';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import toast from 'react-hot-toast';
import { createWorkPerformed, deleteWorkPerformed, fetchWorkPerformed } from './workPerformedSlice';
import {
    deleteWorkPerformedItem,
    fetchWorkPerformedItems,
} from './workPerformedItems/workPerformedItemsSlice';
import { useParams } from 'react-router-dom';
import WorkPerformedTable from './WorkPerformedTable';
import { useReference } from '@/features/reference/useReference';

/**********************************************************************************************************/
export default function WorkPerformedPage() {
    const dispatch = useAppDispatch();
    const { prjBlockId } = useParams();
    const blockId = Number(prjBlockId);
    const { data, loading } = useAppSelector((state) => state.workPerformed);
    console.log('data', data);
    const { data: blocks } = useAppSelector((state) => state.projectBlocks);

    const currentBlock = blocks.find((b) => b.id === blockId) ?? null;

    const blockName = currentBlock?.name || '';

    const page = 1;
    const size = 10;

    const [deleteState, setDeleteState] = useState<{
        type: 'avr' | 'avrItem';
        id: number;
    } | null>(null);

    const prjBlocks = useReference('projectBlocks');
    const users = useReference('users');

    const refs = {
        prjBlocks,
        users,
    };

    //LOAD WorkPerformed
    useEffect(() => {
        if (!blockId) return;

        dispatch(
            fetchWorkPerformed({
                block_id: blockId,
                page,
                size,
            }),
        );
    }, [blockId, page, size, dispatch]);

    //LOAD ESTIMATE ITEMS
    // useEffect(() => {
    //     dispatch(fetchWorkPerformedItems());
    // }, [dispatch]);

    //DELETE
    const confirmDelete = useCallback(async () => {
        if (!deleteState) return;

        try {
            if (deleteState.type === 'avrItem') {
                await dispatch(deleteWorkPerformedItem(deleteState.id)).unwrap();
                toast.success('Позиция удалена');
            } else {
                await dispatch(deleteWorkPerformed(deleteState.id)).unwrap();
                toast.success('АВР удален');

                dispatch(
                    fetchWorkPerformed({
                        block_id: blockId,
                        page,
                        size,
                    }),
                );
            }
        } catch {
            toast.error(`Ошибка удаления или у вас недостаточно прав на удаление`);
        } finally {
            setDeleteState(null);
        }
    }, [deleteState, dispatch, blockId, page, size]);

    const generateEstimateName = (blockName: string) => {
        return `Смета — ${blockName}`;
    };

    //CREATE
    const handleCreateWorkPerformed = useCallback(async () => {
        try {
            //Проверка: уже есть смета в этом блоке
            if (data.length > 0) {
                toast.error('В этом блоке уже существует смета');
                return;
            }

            const name = generateEstimateName(blockName);

            await dispatch(
                createWorkPerformed({
                    block_id: blockId,
                    status: 1,
                    // name,
                }),
            ).unwrap();

            toast.success('АВР создан');

            dispatch(
                fetchWorkPerformed({
                    block_id: blockId,
                    page,
                    size,
                }),
            );
        } catch {
            toast.error('Ошибка создания АВР');
        }
    }, [dispatch, blockId, blockName, page, size, data]);

    /*************************************************************************************************************************/
    return (
        <Paper sx={{ p: 2, borderRadius: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button variant="outlined" startIcon={<Add />} onClick={handleCreateWorkPerformed}>
                    Добавить смету
                </Button>
            </Box>

            {/* CONTENT */}
            {loading ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            ) : data?.length === 0 ? (
                <Typography color="text.secondary">АВР отсутствуют</Typography>
            ) : (
                <>
                    <WorkPerformedTable
                        blockId={blockId}
                        data={data}
                        refs={refs}
                        onDeleteWorkPerformedId={(id) => setDeleteState({ type: 'avr', id })} // удалить АВР
                        onDeleteWorkPerformedItemId={(itemId: number) =>
                            setDeleteState({ type: 'avrItem', id: itemId })
                        } // удалить позицию
                    />
                </>
            )}

            {/* DELETE CONFIRM */}
            <ConfirmDialog
                open={!!deleteState && deleteState.type === 'avr'}
                title="Удалить текущий АВР?"
                message="Это действие нельзя отменить."
                onConfirm={confirmDelete}
                onCancel={() => setDeleteState(null)}
            />
            <ConfirmDialog
                open={!!deleteState && deleteState.type === 'avrItem'}
                title="Удалить позицию?"
                message="Это действие нельзя отменить."
                onConfirm={confirmDelete}
                onCancel={() => setDeleteState(null)}
            />
        </Paper>
    );
}
