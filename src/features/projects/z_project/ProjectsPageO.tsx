import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import {
    fetchProjects,
    setSearch,
    setFilters,
    type Project,
    deleteProject,
} from './projectsSliceo';
import ProjectsTable from './ProjectsTableO';
import InputSearch from '@/components/ui/InputSearch';
import { ReferenceSelect } from '@/components/ui/ReferenceSelect';
import { StyledTooltip } from '@/components/ui/StyledTooltip';
import { MdDomainAdd } from 'react-icons/md';
import { useReference } from '../../reference/useReference';
import { Button } from '@mui/material';
import { ProjectCreateEditDialog } from './ProjectCreateEditDialog';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import toast from 'react-hot-toast';
import { RotateCcw } from 'lucide-react';

interface ProjectFilters {
    type?: string | number;
    status?: string | number;
}
/*******************************************************************************************************************************************************************/
export default function ProjectsPage() {
    const dispatch = useAppDispatch();
    const { items, pagination, loading, error, search } = useAppSelector((state) => state.projects);
    // Справочники
    const refs = {
        projectTypes: useReference('projectTypes'),
        projectStatuses: useReference('projectStatuses'),
    };
    const [openForm, setOpenForm] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);

    // Локальные состояния
    const [searchText, setSearchText] = useState('');
    const [projectTypeId, setProjectTypeId] = useState<string | number | null>(null);
    const [projectStatusId, setProjectStatusId] = useState<string | number | null>(null);

    // ===== 1. Первичная загрузка =====
    useEffect(() => {
        dispatch(fetchProjects({ page: 1, size: 10 }));
    }, [dispatch]);

    // ===== 2. Формирование фильтров =====
    const getCurrentFilters = (): ProjectFilters => {
        const currentFilters: ProjectFilters = {};
        if (projectTypeId) currentFilters.type = projectTypeId;
        if (projectStatusId) currentFilters.status = projectStatusId;
        return currentFilters;
    };

    // ===== 3. Поиск =====
    const handleSearch = () => {
        dispatch(setSearch(searchText));
        const currentFilters = getCurrentFilters();
        dispatch(setFilters(currentFilters));
        dispatch(fetchProjects({ page: 1, size: 10, search: searchText, filters: currentFilters }));
    };

    useEffect(() => {
        if (searchText.trim() === '') {
            dispatch(fetchProjects({ page: 1 }));
        } else {
            dispatch(fetchProjects({ page: 1, search }));
        }
    }, [searchText]);

    // ===== 4. Авто-обновление фильтров при выборе =====
    useEffect(() => {
        const newFilters = getCurrentFilters();
        dispatch(setFilters(newFilters));
        dispatch(fetchProjects({ page: 1, size: 10, search, filters: newFilters }));
    }, [projectTypeId, projectStatusId]);

    // ===== 5. Сброс данные поиска и филтра =====
    const handleReset = () => {
        setSearchText('');
        setProjectTypeId(null);
        setProjectStatusId(null);

        dispatch(setSearch(''));
        dispatch(setFilters({}));
        dispatch(fetchProjects({ page: 1, size: 10 }));
    };
    // ===== 6. Открытие формы создания/редактирования =====//
    const handleCreate = () => {
        setEditingProject(null);
        setOpenForm(true);
    };

    const handleEdit = (project: Project) => {
        setEditingProject(project);
        setOpenForm(true);
    };

    const handleClose = () => {
        setOpenForm(false);
    };

    const handleDelete = (id: number) => {
        setDeleteId(id);
        setConfirmOpen(true);
    };

    const handleConfirm = () => {
        if (!deleteId) return;

        dispatch(deleteProject(deleteId))
            .unwrap()
            .then(() => {
                dispatch(fetchProjects({ page: 1, size: 10 }));
                toast.success('Проект успешно удален');
            });

        setConfirmOpen(false);
        setDeleteId(null);
    };

    // ===== 7. Пагинация =====
    const handleNextPage = () => {
        if (!pagination?.hasNext) return;
        dispatch(
            fetchProjects({
                page: pagination.page + 1,
                size: pagination.size,
                search,
                filters: getCurrentFilters(),
            }),
        );
    };

    const handlePrevPage = () => {
        if (!pagination?.hasPrev) return;
        dispatch(
            fetchProjects({
                page: pagination.page - 1,
                size: pagination.size,
                search,
                filters: getCurrentFilters(),
            }),
        );
    };

    /***********************************************************************************************************************************************************/
    return (
        <div className="mx-auto w-[1600px] mt-4">
            {/* ======= ПОИСК И ФИЛЬТРЫ ======= */}
            <div className="px-5 py-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm  w-[1445px]">
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <p className="text-gray-600 uppercase text-medium">
                            Панель управление объектом
                        </p>
                    </div>
                </div>
                <div className="flex justify-between gap-4 mb-0 items-left">
                    {/* Фильтры и поиск — слева */}
                    <div className="flex flex-1 gap-3 items-left">
                        <InputSearch
                            value={searchText}
                            onChange={setSearchText}
                            onEnter={handleSearch}
                        />

                        <ReferenceSelect
                            label="Тип проекта"
                            value={projectTypeId || ''}
                            onChange={setProjectTypeId}
                            options={refs.projectTypes.data || []}
                            loading={refs.projectTypes.loading}
                        />

                        <ReferenceSelect
                            label="Статус проекта"
                            value={projectStatusId || ''}
                            onChange={setProjectStatusId}
                            options={refs.projectStatuses.data || []}
                            loading={refs.projectStatuses.loading}
                        />
                        {/* Иконка сброса */}
                        <StyledTooltip title="Сбросить фильтры и поиск">
                            <button
                                onClick={handleReset}
                                className="p-2 text-gray-400 transition-colors rounded-lg hover:text-blue-600 hover:bg-blue-50 group"
                                title="Сбросить фильтры и поиск"
                            >
                                <RotateCcw className="w-5 h-5 transition-transform duration-300 group-hover:rotate-180" />
                            </button>
                        </StyledTooltip>
                    </div>
                    {/* Кнопка "Создать" — справа */}
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outlined"
                            startIcon={<MdDomainAdd />}
                            onClick={handleCreate}
                        >
                            Создать
                        </Button>
                    </div>
                </div>
            </div>
            {/* ======= ТАБЛИЦА ======= */}
            <ProjectsTable
                items={items}
                loading={loading}
                error={error}
                pagination={pagination}
                onPrevPage={handlePrevPage}
                onNextPage={handleNextPage}
                onEdit={handleEdit}
                onDelete={handleDelete}
                refs={refs}
            />
            <ProjectCreateEditDialog
                open={openForm}
                project={editingProject}
                onClose={handleClose}
            />
            {/* Диалог подтверждения */}
            <ConfirmDialog
                open={confirmOpen}
                title="Удаление проекта"
                message="Вы уверены, что хотите удалить проект?"
                onConfirm={handleConfirm}
                onCancel={() => setConfirmOpen(false)}
            />
        </div>
    );
}
