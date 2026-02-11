import { Box } from '@mui/material';
import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { MdOutlinePlaylistAdd } from 'react-icons/md';
import toast from 'react-hot-toast';
import { StyledTooltip } from '@/components/ui/StyledTooltip';
import {
    clearMaterialRequests,
    createMaterialReq,
    fetchSearchMaterialReq,
    updateMaterialRequest,
    type MaterialRequest,
} from './materialRequestsSlice';
import { getProjectById } from '../projectsSlice';
import type { MaterialRequestCreatePayload } from './MaterialReqCreateEditForm';
import MaterialReqCreateEditForm from './MaterialReqCreateEditForm';
import MaterialRequestsTable from './MaterialRequestsTable';
import { TablePagination } from '@/components/ui/TablePagination';
import { useReference } from '@/features/reference/useReference';

export interface ProjectOutletContext {
    projectId: number;
}

/*************************************************************************************************************************/
export default function MaterialRequests() {
    const dispatch = useAppDispatch();
    const { projectId } = useOutletContext<ProjectOutletContext>();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingMatReq, setEditingMatReq] = useState<MaterialRequest | null>(null);

    const { currentProject: project, loading: projectLoading } = useAppSelector(
        (state) => state.projects,
    );

    const {
        data: materialRequests,
        loading: materialLoading,
        pagination,
    } = useAppSelector((state) => state.materialRequests);

    const refs = {
        projectTypes: useReference('projectTypes'),
        projectStatuses: useReference('projectStatuses'),
        materialTypes: useReference('materialTypes'),
        materials: useReference('materials'),
        unitsOfMeasure: useReference('unitsOfMeasure'),
        users: useReference('users'),
        materialRequestStatuses: useReference('materialRequestStatuses'),
        materialRequestItemStatuses: useReference('materialRequestItemStatuses'),
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

    const handleNextPage = () => {
        if (!pagination?.hasNext) return;
        dispatch(
            fetchSearchMaterialReq({
                page: pagination.page + 1,
                size: pagination.size,
                project_id: project.id,
            }),
        );
    };

    const handlePrevPage = () => {
        if (!pagination?.hasPrev) return;
        dispatch(
            fetchSearchMaterialReq({
                page: pagination.page - 1,
                size: pagination.size,
                project_id: project.id,
            }),
        );
    };

    return (
        <>
            {!isFormOpen && (
                <Box>
                    <StyledTooltip title="Создать заявку">
                        <MdOutlinePlaylistAdd className="icon" onClick={handleCreateMatReq} />
                    </StyledTooltip>

                    <div>
                        <MaterialRequestsTable
                            data={materialRequests.filter((req) => req.project_id === project.id)}
                            refs={refs}
                        />
                    </div>

                    <TablePagination
                        pagination={pagination}
                        onPrev={handlePrevPage}
                        onNext={handleNextPage}
                    />
                </Box>
            )}

            {isFormOpen && (
                <MaterialReqCreateEditForm
                    request={editingMatReq || undefined}
                    refs={refs}
                    projectId={project.id}
                    statusId={project.status}
                    onSubmit={handleSave}
                    onCancel={handleCancel}
                />
            )}
        </>
    );
}
