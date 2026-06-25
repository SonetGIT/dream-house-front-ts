import { Box, Button, CircularProgress, Paper, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/store';
import toast from 'react-hot-toast';
import {
    clearMaterialRequests,
    deleteMaterialRequest,
    fetchSearchMaterialReq,
} from './materialRequestsSlice';
import MaterialRequestsTable from './MaterialRequestsTable';
import { TablePagination } from '@/components/ui/TablePagination';
import { useReference } from '@/features/reference/useReference';
import { getProjectById } from '../a_project/projectsSlice';
import { Add } from '@mui/icons-material';
import { deleteMaterialRequestItem } from '../material_request_items/materialRequestItemsSlice';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Modal from '@/components/ui/Modal';
import MaterialRequestFlow from './material_request_flow/MaterialRequestFlow';
import { calcRowTotal } from '@/utils/calcRowTotal';

/*************************************************************************************************************************/
export default function MaterialRequestsPage() {
    const dispatch = useAppDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    const { projectId, prjBlockId } = useParams();
    const blockId = prjBlockId ? Number(prjBlockId) : null;
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(10);
    const focusId = useMemo(() => {
        const value = Number(new URLSearchParams(location.search).get('focus'));
        return Number.isInteger(value) && value > 0 ? value : null;
    }, [location.search]);

    const { currentProject: project, loading: projectLoading } = useAppSelector(
        (state) => state.projects,
    );

    const {
        data: materialRequests,
        loading: materialLoading,
        pagination,
    } = useAppSelector((state) => state.materialRequests);

    const [modal, setModal] = useState<'create' | 'edit' | 'delete' | null>(null);
    const [step, setStep] = useState<'select' | 'estimate' | 'form'>('select');

    const [deleteState, setDeleteState] = useState<{
        type: 'matReq' | 'matReqItem';
        id: number;
    } | null>(null);

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

    // hooks всегда вызываются одинаково
    const projectTypes = useReference('projectTypes');
    const projectStatuses = useReference('projectStatuses');
    const materialTypes = useReference('materialTypes');
    const materials = useReference('materials');
    const unitsOfMeasure = useReference('unitsOfMeasure');
    const currencies = useReference('currencies');
    const blockStages = useReference('blockStages');
    const stageSubsections = useReference('stageSubsections');
    const users = useReference('users');
    const materialRequestStatuses = useReference('materialRequestStatuses');
    const materialRequestItemStatuses = useReference('materialRequestItemStatuses');
    const materialRequestItemTypes = useReference('materialRequestItemTypes');
    const materialEstimates = useReference('materialEstimates');
    const prjBlocks = useReference('projectBlocks');

    const refs = {
        projectTypes,
        projectStatuses,
        materialTypes,
        materials,
        unitsOfMeasure,
        currencies,
        blockStages,
        stageSubsections,
        users,
        materialRequestStatuses,
        materialRequestItemStatuses,
        materialRequestItemTypes,
        materialEstimates,
        prjBlocks,
    };

    //загрузка проекта
    useEffect(() => {
        if (Number(projectId) && (!project || project.id !== Number(projectId))) {
            dispatch(getProjectById(Number(projectId)));
        }
    }, [Number(projectId), project, dispatch]);

    //загрузка заявок
    useEffect(() => {
        if (project?.id) {
            dispatch(clearMaterialRequests());

            dispatch(
                fetchSearchMaterialReq({
                    ...(focusId ? { id: focusId, page: 1, size } : { page, size }),
                    project_id: project.id,
                    ...(blockId ? { block_id: blockId } : {}),
                }),
            );
        }
    }, [project?.id, blockId, page, size, focusId, dispatch]);

    //HANDLERS
    const handleCreate = () => {
        setModal('create');
    };

    const confirmDelete = useCallback(async () => {
        if (!deleteState) return;

        try {
            if (deleteState.type === 'matReq') {
                await dispatch(deleteMaterialRequest(deleteState.id)).unwrap();
                toast.success('Заявка удалена');
            } else {
                await dispatch(deleteMaterialRequestItem(deleteState.id)).unwrap();
                toast.success('Позиция удалена');

                if (Number(projectId)) {
                    dispatch(
                        fetchSearchMaterialReq({
                            project_id: Number(projectId),
                            ...(blockId ? { block_id: blockId } : {}),
                            ...(focusId ? { id: focusId, page: 1, size } : { page, size }),
                        }),
                    );
                }
            }
        } catch {
            toast.error('Ошибка удаления, проверьте права доступа на удаления');
        } finally {
            setDeleteState(null);
        }
    }, [deleteState, dispatch, projectId, blockId, focusId, page, size]);

    //SAFE RETURNS
    if (!Number(projectId)) {
        return <div>Нет projectId</div>;
    }

    if (projectLoading) {
        return <div>Загрузка проекта...</div>;
    }

    if (!project) {
        return <div>Проект не найден</div>;
    }

    //RENDER
    return (
        <Paper sx={{ p: 2, borderRadius: 3 }}>
            {/* HEADER */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button variant="outlined" startIcon={<Add />} onClick={handleCreate}>
                    Создать заявку
                </Button>
            </Box>

            {/* CONTENT */}
            {materialLoading ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            ) : materialRequests.length === 0 ? (
                <Typography color="text.secondary">Заявки отсутствуют</Typography>
            ) : (
                <>
                    <MaterialRequestsTable
                        data={materialRequests.filter((req) => req.project_id === project.id)}
                        refs={refs}
                        focusedRequestId={focusId}
                        onDeleteMatReqId={(id) => setDeleteState({ type: 'matReq', id })}
                        onDeleteMatReqItemId={(itemId) =>
                            setDeleteState({ type: 'matReqItem', id: itemId })
                        }
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
                title="Создать новую заявку"
            >
                <MaterialRequestFlow
                    step={step}
                    setStep={setStep}
                    projectId={Number(projectId)}
                    blockId={Number(blockId)}
                    refs={refs}
                    calcRowTotal={calcRowTotal}
                    onClose={() => setModal(null)}
                />
            </Modal>

            {/* DELETE CONFIRM */}
            <ConfirmDialog
                open={deleteState?.type === 'matReq'}
                title="Удалить заявку?"
                message="Это действие нельзя отменить."
                onConfirm={confirmDelete}
                onCancel={() => setDeleteState(null)}
            />

            <ConfirmDialog
                open={deleteState?.type === 'matReqItem'}
                title="Удалить позицию из заявки?"
                message="Это действие нельзя отменить."
                onConfirm={confirmDelete}
                onCancel={() => setDeleteState(null)}
            />
        </Paper>
    );
}
