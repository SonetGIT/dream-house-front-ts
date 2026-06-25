import { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Paper, Typography, Button, CircularProgress } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/app/store';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import toast from 'react-hot-toast';
import { deleteWorkPerformed, fetchWorkPerformed } from './workPerformedSlice';
import { deleteWorkPerformedItem } from './workPerformedItems/workPerformedItemsSlice';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import WorkPerformedTable from './WorkPerformedTable';
import { useReference } from '@/features/reference/useReference';
import { TablePagination } from '@/components/ui/TablePagination';
import Modal from '@/components/ui/Modal';
import { calcRowTotal } from '@/utils/calcRowTotal';
import WorkPerformedFlow from './creatAVR/WorkPerformedFlow';

/**********************************************************************************************************/
export default function WorkPerformedPage() {
    const dispatch = useAppDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    const { projectId, prjBlockId } = useParams();
    const blockId = prjBlockId ? Number(prjBlockId) : null;
    const { data, pagination, loading } = useAppSelector((state) => state.workPerformed);

    const [page, setPage] = useState(1);
    const [size, setSize] = useState(10);
    const [modal, setModal] = useState<'create' | 'edit' | 'delete' | null>(null);
    const [step, setStep] = useState<'select' | 'estimate' | 'form'>('select');
    const [deleteState, setDeleteState] = useState<{
        type: 'avr' | 'avrItem';
        id: number;
    } | null>(null);
    const focusId = useMemo(() => {
        const value = Number(new URLSearchParams(location.search).get('focus'));
        return Number.isInteger(value) && value > 0 ? value : null;
    }, [location.search]);

    const clearFocusFromUrl = useCallback(() => {
        const searchParams = new URLSearchParams(location.search);

        if (!searchParams.has('focus')) return;

        searchParams.delete('focus');
        navigate(
            {
                pathname: location.pathname,
                search: searchParams.toString() ? `?${searchParams.toString()}` : '',
            },
            { replace: true },
        );
    }, [location.pathname, location.search, navigate]);

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
            fetchWorkPerformed(
                focusId
                    ? {
                          id: focusId,
                          block_id: blockId,
                          page: 1,
                          size,
                      }
                    : {
                          block_id: blockId,
                          page,
                          size,
                      },
            ),
        );
    }, [blockId, page, size, focusId, dispatch]);

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

                if (blockId) {
                    dispatch(
                        fetchWorkPerformed(
                            focusId
                                ? {
                                      id: focusId,
                                      block_id: blockId,
                                      page: 1,
                                      size,
                                  }
                                : {
                                      block_id: blockId,
                                      page,
                                      size,
                                  },
                        ),
                    );
                }
            }
        } catch {
            toast.error(`Ошибка удаления или у вас недостаточно прав на удаление`);
        } finally {
            setDeleteState(null);
        }
    }, [deleteState, dispatch, blockId, focusId, page, size]);

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
                        blockId={Number(blockId)}
                        data={data}
                        refs={refs}
                        focusedWorkPerformedId={focusId}
                        onDeleteWorkPerformedId={(id) => setDeleteState({ type: 'avr', id })} // удалить АВР
                        onDeleteWorkPerformedItemId={(itemId: number) =>
                            setDeleteState({ type: 'avrItem', id: itemId })
                        } // удалить позицию
                    />
                    {pagination && (
                        <TablePagination
                            pagination={pagination}
                            onPageChange={(newPage) => {
                                clearFocusFromUrl();
                                setPage(newPage);
                            }}
                            onSizeChange={(newSize) => {
                                clearFocusFromUrl();
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
                    blockId={Number(blockId)}
                    projectId={Number(projectId)}
                    refs={refs}
                    calcRowTotal={calcRowTotal}
                    onClose={() => setModal(null)}
                />
            </Modal>

            {/* DELETE CONFIRM */}
            <ConfirmDialog
                /*!!существует ли deleteState*/
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
