import { Box, Button, CircularProgress, Paper, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
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
import { fetchProjectBlocks } from '../pto/projectBlocks/projectBlocksSlice';

/*************************************************************************************************************************/
export default function MaterialRequestsPage() {
    const dispatch = useAppDispatch();
    const { projectId } = useParams();
    const projectIdNum = projectId ? Number(projectId) : null;
    const { data: blocks } = useAppSelector((state) => state.projectBlocks);
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(10);

    const { currentProject: project, loading: projectLoading } = useAppSelector(
        (state) => state.projects,
    );

    const {
        data: materialRequests,
        loading: materialLoading,
        pagination,
    } = useAppSelector((state) => state.materialRequests);

    const projectBlocks = useMemo(
        () => blocks.filter((b) => b.project_id === projectIdNum),
        [blocks, projectIdNum],
    );

    const [modal, setModal] = useState<'create' | 'edit' | 'delete' | null>(null);
    const [step, setStep] = useState<'select' | 'estimate' | 'form'>('select');

    const [deleteState, setDeleteState] = useState<{
        type: 'matReq' | 'matReqItem';
        id: number;
    } | null>(null);

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
        if (projectIdNum && (!project || project.id !== projectIdNum)) {
            dispatch(getProjectById(projectIdNum));
        }
    }, [projectIdNum, project, dispatch]);

    //загрузка блоков
    useEffect(() => {
        if (projectIdNum && blocks.length === 0) {
            dispatch(fetchProjectBlocks({ project_id: projectIdNum, page: 1, size: 10 }));
        }
    }, [projectIdNum, blocks.length, dispatch]);

    //загрузка заявок
    useEffect(() => {
        if (project?.id) {
            dispatch(clearMaterialRequests());

            dispatch(
                fetchSearchMaterialReq({
                    page,
                    size,
                    project_id: project.id,
                }),
            );
        }
    }, [project?.id, dispatch]);

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

                if (projectIdNum) {
                    dispatch(fetchSearchMaterialReq({ project_id: projectIdNum }));
                }
            }
        } catch {
            toast.error('Ошибка удаления, проверьте права доступа на удаления');
        } finally {
            setDeleteState(null);
        }
    }, [deleteState, dispatch, projectIdNum]);

    //SAFE RETURNS
    if (!projectIdNum) {
        return <div>Нет projectIdNum</div>;
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
                        onDeleteMatReqId={(id) => setDeleteState({ type: 'matReq', id })}
                        onDeleteMatReqItemId={(itemId) =>
                            setDeleteState({ type: 'matReqItem', id: itemId })
                        }
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
                title="Создать новую заявку"
            >
                <MaterialRequestFlow
                    step={step}
                    setStep={setStep}
                    blocks={projectBlocks}
                    projectId={projectIdNum}
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
