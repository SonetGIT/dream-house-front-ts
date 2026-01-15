import { Box } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
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
import { useReference } from '@/features/reference/useReference';
import { getProjectById } from '../projectsSlice';
import type { MaterialRequestCreatePayload } from './MaterialReqCreateEditForm';
import MaterialReqCreateEditForm from './MaterialReqCreateEditForm';
import MaterialRequestsTable from './MaterialRequestsTable';
import { TablePagination } from '@/components/ui/TablePagination';

/******************************************************************************************************/
export default function MaterialRequests() {
    const dispatch = useAppDispatch();
    const { id } = useParams<{ id: string }>();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingMatReq, setEditingMatReq] = useState<MaterialRequest | null>(null);

    const { currentProject: project, loading: projectLoading } = useAppSelector(
        (state) => state.projects
    );

    const {
        data: materialRequests,
        loading: materialLoading,
        pagination,
    } = useAppSelector((state) => state.materialRequests);

    const { lookup: getProjectTypeName } = useReference('0e86b36a-aa48-4993-874f-1ce21cd3931d');
    const { lookup: getProjectStatusName } = useReference('231fec20-3f64-4343-8d49-b1d53e71ad4d');

    const { data: materialTypes, lookup: getMaterialTypeName } = useReference(
        '681635e7-3eff-413f-9a07-990bfe7bc68a'
    );
    const { data: materials, lookup: getMaterialName } = useReference(
        '7c52acfc-843a-4242-80ba-08f7439a29a7'
    );
    const { data: unitTypes, lookup: getUnitOfMeasure } = useReference(
        '2198d87a-d834-4c5d-abf8-8925aeed784e'
    );

    const { lookup: getUserName } = useReference('d0336075-e674-41ef-aa38-189de9adaeb4');
    const { lookup: getMatReqStatusName } = useReference('c1aa58c8-2419-4832-ba09-8c54f27b5bf3');

    const getRefName = useMemo(
        () => ({
            projectType: getProjectTypeName,
            projectStatus: getProjectStatusName,
            unitName: getUnitOfMeasure,
            materialType: getMaterialTypeName,
            materialName: getMaterialName,
            userName: getUserName,
            statusName: getMatReqStatusName,
            materialTypes,
            materials,
            unitTypes,
        }),
        [
            getUnitOfMeasure,
            getMaterialTypeName,
            getMaterialName,
            getUserName,
            getMatReqStatusName,
            materialTypes,
            materials,
            unitTypes,
        ]
    );

    // Загрузка проекта
    useEffect(() => {
        if (id && (!project || project.id !== Number(id))) {
            dispatch(getProjectById(Number(id)));
        }
    }, [id, project, dispatch]);

    useEffect(() => {
        if (project?.id) {
            dispatch(clearMaterialRequests());
            dispatch(
                fetchSearchMaterialReq({
                    page: 1,
                    size: 10,
                    project_id: project.id,
                })
            );
        }
    }, [project?.id, dispatch]);

    if (projectLoading || materialLoading) return <div>Загрузка...</div>;
    if (!project) return <div>Проект не найден</div>;

    const handleCreateMatReq = () => {
        setEditingMatReq(null);
        setIsFormOpen(true);
    };

    // Сохранение формы (создание или редактирование)
    const handleSave = (formData: MaterialRequestCreatePayload) => {
        if (editingMatReq) {
            // UPDATE — допускаем Partial
            dispatch(
                updateMaterialRequest({
                    id: editingMatReq.id,
                    data: formData, // backend принимает полный payload — это ок
                })
            )
                .unwrap()
                .then(() => {
                    dispatch(
                        fetchSearchMaterialReq({
                            page: 1,
                            size: 10,
                            project_id: editingMatReq.project_id,
                        })
                    );
                    toast.success('Заявка успешно обновлена');
                })
                .catch((err: string) => {
                    toast.error(err || 'Ошибка при обновлении заявки');
                });
        } else {
            // CREATE — ТОЛЬКО полный payload
            dispatch(createMaterialReq(formData))
                .unwrap()
                .then(() => {
                    dispatch(
                        fetchSearchMaterialReq({
                            page: 1,
                            size: 10,
                            project_id: formData.project_id, //источник истины
                        })
                    );
                    toast.success('Заявка успешно создана', { duration: 3000 });
                })
                .catch((err: string) => {
                    toast.error(err || 'Ошибка при создании заявки');
                });
        }
        setIsFormOpen(false);
    };

    //Отмена формы
    const handleCancel = () => {
        setIsFormOpen(false);
        // setEditingUser(null);
    };

    //Пагинация
    const handleNextPage = () => {
        if (!pagination?.hasNext) return;
        dispatch(
            fetchSearchMaterialReq({
                page: pagination.page + 1,
                size: pagination.size,
                project_id: project.id,

                // search,
                // filters: getCurrentFilters(),
            })
        );
    };

    const handlePrevPage = () => {
        if (!pagination?.hasPrev) return;
        dispatch(
            fetchSearchMaterialReq({
                page: pagination.page + 1,
                size: pagination.size,
                project_id: project.id,
                // search,
                // filters: getCurrentFilters(),
            })
        );
    };

    /***********************************************************************************************************************************************/
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
                            getRefName={getRefName}
                        />
                    </div>

                    {/*Пагинация****************************************************************************************************/}
                    <TablePagination
                        pagination={pagination}
                        onPrev={handlePrevPage}
                        onNext={handleNextPage}
                    />
                </Box>
            )}

            {/* CREATE-EDIT */}
            {isFormOpen && (
                <MaterialReqCreateEditForm
                    request={editingMatReq || undefined}
                    getRefName={getRefName}
                    projectId={project.id}
                    statusId={project.status}
                    onSubmit={handleSave}
                    onCancel={handleCancel}
                />
            )}
        </>
    );
}
