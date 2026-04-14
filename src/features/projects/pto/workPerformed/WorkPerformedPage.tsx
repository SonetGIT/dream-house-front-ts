import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { TablePagination } from '@/components/ui/TablePagination';
import Modal from '@/components/ui/Modal';
import WorkPerformedFlow from './creatAVR/WorkPerformedFlow';
import { calcRowTotal } from '@/utils/calcRowTotal';

/**********************************************************************************************************/
export default function WorkPerformedPage() {
    const dispatch = useAppDispatch();
    const { projectId } = useParams();
    const { prjBlockId } = useParams();
    const blockId = Number(prjBlockId);
    const { data, pagination, loading } = useAppSelector((state) => state.workPerformed);
    const { data: blocks } = useAppSelector((state) => state.projectBlocks);

    const projectBlocks = useMemo(
        () => blocks.filter((b) => b.project_id === Number(projectId)),
        [blocks, Number(projectId)],
    );

    // const currentBlock = blocks.find((b) => b.id === blockId) ?? null;

    // const blockName = currentBlock?.name || '';

    const [page, setPage] = useState(1);
    const [size, setSize] = useState(10);
    const [modal, setModal] = useState<'create' | 'edit' | 'delete' | null>(null);
    const [step, setStep] = useState<'select' | 'estimate' | 'form'>('select');
    const [deleteState, setDeleteState] = useState<{
        type: 'avr' | 'avrItem';
        id: number;
    } | null>(null);

    const prjBlocks = useReference('projectBlocks');
    const users = useReference('users');
    const generalStatuses = useReference('generalStatuses');
    const serviceTypes = useReference('serviceTypes');
    const services = useReference('services');
    const unitsOfMeasure = useReference('unitsOfMeasure');
    const currencies = useReference('currencies');
    const blockStages = useReference('blockStages');
    const stageSubsections = useReference('stageSubsections');
    const workPerformedItemTypes = useReference('workPerformedItemTypes');

    const refs = {
        prjBlocks,
        users,
        generalStatuses,
        serviceTypes,
        services,
        unitsOfMeasure,
        currencies,
        blockStages,
        stageSubsections,
        workPerformedItemTypes,
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
                toast.success('АВР успешно удален');

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

    //CREATE
    const handleCreate = () => {
        setModal('create');
    };

    /*************************************************************************************************************************/
    return (
        <Paper sx={{ p: 2, borderRadius: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button variant="outlined" startIcon={<Add />} onClick={handleCreate}>
                    Добавить АВР
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
                    {pagination && (
                        <TablePagination
                            pagination={pagination}
                            onPageChange={(newPage) => setPage(newPage)}
                            onSizeChange={(newSize) => {
                                setPage(1);
                                setSize(newSize);
                            }}
                            sizeOptions={[10, 25, 50, 100]}
                            showFirstButton
                            showLastButton
                        />
                    )}
                </>
            )}
            <Modal
                size={step === 'estimate' || step === 'form' ? 'full' : 'xl'}
                isOpen={modal === 'create'}
                onClose={() => setModal(null)}
                title="Создать АВР"
            >
                <WorkPerformedFlow
                    step={step}
                    setStep={setStep}
                    blocks={projectBlocks}
                    projectId={Number(projectId)}
                    refs={refs}
                    calcRowTotal={calcRowTotal}
                    onClose={() => setModal(null)}
                />
            </Modal>

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
