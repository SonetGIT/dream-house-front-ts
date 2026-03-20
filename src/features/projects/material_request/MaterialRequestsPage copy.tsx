import { Box, Button, CircularProgress, Paper, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { MdOutlinePlaylistAdd } from 'react-icons/md';
import toast from 'react-hot-toast';
import { StyledTooltip } from '@/components/ui/StyledTooltip';
import {
    clearMaterialRequests,
    createMaterialReq,
    deleteMaterialRequest,
    fetchSearchMaterialReq,
    updateMaterialRequest,
    type MaterialRequest,
} from './materialRequestsSlice';
import type { MaterialRequestCreatePayload } from './MaterialReqCreateEditForm';
import MaterialReqCreateEditForm from './MaterialReqCreateEditForm';
import MaterialRequestsTable from './MaterialRequestsTable';
import { TablePagination } from '@/components/ui/TablePagination';
import { useReference } from '@/features/reference/useReference';
import { getProjectById } from '../a_project/projectsSlice';
import { Add } from '@mui/icons-material';
import {
    deleteMaterialRequestItem,
    fetchMaterialRequestItems,
} from '../material_request_items/materialRequestItemsSlice';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export interface ProjectOutletContext {
    projectId: number;
}

/*************************************************************************************************************************/
export default function MaterialRequestsPageыыы() {
    const dispatch = useAppDispatch();
    const { projectId } = useOutletContext<ProjectOutletContext>();
    const { currentProject: project, loading: projectLoading } = useAppSelector(
        (state) => state.projects,
    );

    const {
        data: materialRequests,
        loading: materialLoading,
        pagination,
    } = useAppSelector((state) => state.materialRequests);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingMatReq, setEditingMatReq] = useState<MaterialRequest | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [deleteState, setDeleteState] = useState<{
        type: 'matReq' | 'matReqItem';
        id: number;
    } | null>(null);

    const projectTypes = useReference('projectTypes');
    const projectStatuses = useReference('projectStatuses');
    const materialTypes = useReference('materialTypes');
    const materials = useReference('materials');
    const unitsOfMeasure = useReference('unitsOfMeasure');
    const currencies = useReference('currencies');
    const users = useReference('users');
    const materialRequestStatuses = useReference('materialRequestStatuses');
    const materialRequestItemStatuses = useReference('materialRequestItemStatuses');

    const refs = {
        projectTypes,
        projectStatuses,
        materialTypes,
        materials,
        unitsOfMeasure,
        currencies,
        users,
        materialRequestStatuses,
        materialRequestItemStatuses,
    };

    // Загрузка проекта
    useEffect(() => {
        if (projectId && (!project || project.id !== projectId)) {
            dispatch(getProjectById(projectId));
        }
    }, [projectId, project, dispatch]);

    // Загрузка заявок на материалы
    useEffect(() => {
        if (project?.id) {
            dispatch(clearMaterialRequests());
            dispatch(
                fetchSearchMaterialReq({
                    page: 1,
                    size: 10,
                    project_id: project.id,
                }),
            );
        }
    }, [project?.id, dispatch]);

    if (projectLoading || materialLoading) return <div>Загрузка...</div>;
    if (!project) return <div>Проект не найден</div>;

    const handleCreateMatReq = () => {
        setEditingMatReq(null);
        setIsFormOpen(true);
    };

    const handleSave = (formData: MaterialRequestCreatePayload) => {
        if (editingMatReq) {
            dispatch(
                updateMaterialRequest({
                    id: editingMatReq.id,
                    data: formData,
                }),
            )
                .unwrap()
                .then(() => {
                    dispatch(
                        fetchSearchMaterialReq({
                            page: 1,
                            size: 10,
                            project_id: editingMatReq.project_id,
                        }),
                    );
                    toast.success('Заявка успешно обновлена');
                })
                .catch((err: string) => {
                    toast.error(err || 'Ошибка при обновлении заявки');
                });
        } else {
            dispatch(createMaterialReq(formData))
                .unwrap()
                .then(() => {
                    dispatch(
                        fetchSearchMaterialReq({
                            page: 1,
                            size: 10,
                            project_id: formData.project_id,
                        }),
                    );
                    toast.success('Заявка успешно создана', { duration: 3000 });
                })
                .catch((err: string) => {
                    toast.error(err || 'Ошибка при создании заявки');
                });
        }
        setIsFormOpen(false);
    };

    const handleCancel = () => {
        setIsFormOpen(false);
    };

    //DELETE
    const confirmDelete = useCallback(async () => {
        if (!deleteState) return;

        try {
            if (deleteState.type === 'matReq') {
                await dispatch(deleteMaterialRequest(deleteState.id)).unwrap();
                toast.success('Заявка удалена');
            } else {
                await dispatch(deleteMaterialRequestItem(deleteState.id)).unwrap();
                toast.success('Позиция из заявки удалена');

                dispatch(
                    fetchSearchMaterialReq({
                        project_id: projectId,
                    }),
                );
            }
        } catch {
            toast.error('Ошибка удаления');
        } finally {
            setDeleteState(null);
        }
    }, [deleteState, dispatch, projectId]);

    return (
        <Paper sx={{ p: 2, borderRadius: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button variant="outlined" startIcon={<Add />} onClick={handleCreateMatReq}>
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
                        onDeleteMatReqItemId={(itemId: number) =>
                            setDeleteState({ type: 'matReqItem', id: itemId })
                        }
                    />
                    {/* Пагинация */}
                    {pagination && (
                        <TablePagination
                            pagination={pagination}
                            onPageChange={(newPage) => {
                                setCurrentPage(newPage);

                                dispatch(
                                    fetchSearchMaterialReq({
                                        project_id: projectId,
                                        page: newPage,
                                        size: pagination.size,
                                        // ...filters,
                                    }),
                                );
                            }}
                            onSizeChange={(newSize) => {
                                setCurrentPage(1);

                                dispatch(
                                    fetchSearchMaterialReq({
                                        project_id: projectId,
                                        page: 1,
                                        size: newSize,
                                    }),
                                );
                            }}
                            sizeOptions={[10, 25, 50, 100]}
                            showFirstButton
                            showLastButton
                        />
                    )}
                </>
            )}

            {/* DELETE CONFIRM */}
            <ConfirmDialog
                open={!!deleteState && deleteState.type === 'matReq'}
                title="Удалить заявку?"
                message="Это действие нельзя отменить."
                onConfirm={confirmDelete}
                onCancel={() => setDeleteState(null)}
            />
            <ConfirmDialog
                open={!!deleteState && deleteState.type === 'matReqItem'}
                title="Удалить позицию из заявки ?"
                message="Это действие нельзя отменить."
                onConfirm={confirmDelete}
                onCancel={() => setDeleteState(null)}
            />
        </Paper>
        // <>
        //     {!isFormOpen && (
        //         <Box>
        //             <StyledTooltip title="Создать заявку">
        //                 <MdOutlinePlaylistAdd className="icon" onClick={handleCreateMatReq} />
        //             </StyledTooltip>

        //             <div>
        //                 <MaterialRequestsTable
        //                     data={materialRequests.filter((req) => req.project_id === project.id)}
        //                     refs={refs}
        //                 />
        //             </div>

        //             {/* <TablePagination
        //                 pagination={pagination}
        //                 onPrev={handlePrevPage}
        //                 onNext={handleNextPage}
        //             /> */}
        //         </Box>
        //     )}

        //     {isFormOpen && (
        //         <MaterialReqCreateEditForm
        //             request={editingMatReq || undefined}
        //             refs={refs}
        //             projectId={project.id}
        //             statusId={project.status}
        //             onSubmit={handleSave}
        //             onCancel={handleCancel}
        //         />
        //     )}
        // </>
    );
}
