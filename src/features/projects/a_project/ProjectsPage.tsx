import { useState, useEffect } from 'react';
import { ConfirmDialogNew } from '../../../components/ui/ConfirmDialogNew';
import toast from 'react-hot-toast';
import { ProjectFiltersPanel } from './ProjectFiltersPanel';
import { ProjectsTable } from './ProjectsTable';
import { ProjectForm } from './ProjectForm';
import { useAppDispatch, useAppSelector } from '@/app/store';
import {
    createProject,
    deleteProject,
    fetchProjects,
    updateProject,
    type Project,
    type ProjectFormData,
} from './projectsSlice';
import { useReference } from '@/features/reference/useReference';
import { TablePagination } from '@/components/ui/TablePagination';
import Modal from '@/components/ui/Modal';

export default function ProjectsPage() {
    const dispatch = useAppDispatch();
    const { items, pagination, loading } = useAppSelector((state) => state.projects);

    const [filters, setFilters] = useState({
        search: '',
        typeId: null as number | null,
        statusId: null as number | null,
        customerId: null as number | null,
    });

    const [modal, setModal] = useState<'create' | 'edit' | 'delete' | null>(null);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    const [formLoading, setFormLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    //Первичная загрузка
    useEffect(() => {
        dispatch(
            fetchProjects({
                page: 1,
                size: 10,
            }),
        );
    }, [dispatch]);

    //Справочники
    const projectTypes = useReference('projectTypes');
    const projectStatuses = useReference('projectStatuses');
    const users = useReference('users');
    const userRoles = useReference('userRoles');

    const refs = {
        projectTypes,
        projectStatuses,
        users,
        userRoles,
    };

    //Поиск
    const handleSearch = (newFilters: typeof filters) => {
        setFilters(newFilters);

        dispatch(
            fetchProjects({
                page: 1,
                size: pagination?.size ?? 10,
                ...newFilters,
            }),
        );
    };

    const handleReset = () => {
        const resetFilters = {
            search: '',
            typeId: null,
            statusId: null,
            customerId: null,
        };

        setFilters(resetFilters);

        dispatch(
            fetchProjects({
                page: 1,
                size: pagination?.size ?? 10,
            }),
        );
    };

    //CRUD
    const handleCreate = () => {
        setSelectedProject(null);
        setModal('create');
    };

    const handleEdit = (project: Project) => {
        setSelectedProject(project);
        setModal('edit');
    };

    const handleDelete = (project: Project) => {
        setSelectedProject(project);
        setModal('delete');
    };
    const refetchProjects = (page = pagination?.page ?? 1, size = pagination?.size ?? 10) => {
        dispatch(
            fetchProjects({
                page,
                size,
                ...filters,
            }),
        );
    };
    const handleCreateProject = async (data: ProjectFormData) => {
        try {
            setFormLoading(true);

            await dispatch(createProject(data)).unwrap();

            toast.success(`Объект создан: ${data.name}`);

            refetchProjects(1); // 👈 всегда на первую страницу

            setModal(null);
        } catch (err: any) {
            toast.error(err || 'Ошибка создания объекта');
        } finally {
            setFormLoading(false);
        }
    };

    const handleUpdateProject = async (data: ProjectFormData) => {
        if (!selectedProject) return;

        try {
            setFormLoading(true);

            await dispatch(
                updateProject({
                    id: selectedProject.id,
                    data,
                }),
            ).unwrap();

            toast.success(`Объект обновлён: ${data.name}`);

            refetchProjects(); // 👈 остаёмся на текущей странице

            setModal(null);
            setSelectedProject(null);
        } catch (err: any) {
            toast.error(err || 'Ошибка обновления объекта');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDeleteProject = async () => {
        if (!selectedProject) return;

        try {
            setDeleteLoading(true);

            await dispatch(deleteProject(selectedProject.id)).unwrap();

            toast.success(`Объект удалён: ${selectedProject.name}`);

            // 👇 если удалили последний элемент на странице — откат на предыдущую
            const isLastItem = items.length === 1 && (pagination?.page ?? 1) > 1;

            refetchProjects(isLastItem ? pagination!.page - 1 : pagination?.page);

            setModal(null);
            setSelectedProject(null);
        } catch (err: any) {
            toast.error(err || 'Ошибка удаления проекта');
        } finally {
            setDeleteLoading(false);
        }
    };

    /*******************************************************************************************************************/
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
            <div className="mx-auto max-w-[1800px] px-6 py-8">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="mb-2 text-3xl font-bold text-sky-800">Объекты</h1>
                    <p className="text-sm text-sky-700">
                        Панель управления строительными объектами
                    </p>
                </div>

                {/* Фильтры */}
                <ProjectFiltersPanel
                    refs={refs}
                    onSearch={handleSearch}
                    onReset={handleReset}
                    onCreate={handleCreate}
                />

                {/* Таблица */}
                <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
                    <ProjectsTable
                        projects={items}
                        loading={loading}
                        refs={refs}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />

                    {/* Пагинация */}
                    {pagination && (
                        <TablePagination
                            pagination={pagination}
                            onPageChange={(newPage) => {
                                dispatch(
                                    fetchProjects({
                                        page: newPage,
                                        size: pagination.size,
                                        ...filters,
                                    }),
                                );
                            }}
                            onSizeChange={(newSize) => {
                                dispatch(
                                    fetchProjects({
                                        page: 1,
                                        size: newSize,
                                        ...filters,
                                    }),
                                );
                            }}
                            sizeOptions={[10, 25, 50, 100]}
                            showFirstButton
                            showLastButton
                        />
                    )}
                </div>
            </div>

            {/* CREATE */}
            <Modal
                isOpen={modal === 'create'}
                onClose={() => setModal(null)}
                title="Создать новый объект"
            >
                <ProjectForm
                    refs={refs}
                    onSubmit={handleCreateProject}
                    onCancel={() => setModal(null)}
                    loading={formLoading}
                />
            </Modal>

            {/* EDIT */}
            <Modal
                isOpen={modal === 'edit'}
                onClose={() => setModal(null)}
                title="Редактировать объект"
            >
                <ProjectForm
                    project={selectedProject}
                    refs={refs}
                    onSubmit={handleUpdateProject}
                    onCancel={() => setModal(null)}
                    loading={formLoading}
                />
            </Modal>

            {/* DELETE */}
            <ConfirmDialogNew
                isOpen={modal === 'delete'}
                onClose={() => setModal(null)}
                onConfirm={handleDeleteProject}
                title="Удалить объект?"
                message={`Вы уверены, что хотите удалить объект "${selectedProject?.name}" (${selectedProject?.code})?`}
                confirmText="Удалить"
                cancelText="Отмена"
                variant="danger"
                loading={deleteLoading}
            />
        </div>
    );
}
