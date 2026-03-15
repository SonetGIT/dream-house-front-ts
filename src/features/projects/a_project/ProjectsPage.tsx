import { useState, useEffect } from 'react';
import { ConfirmDialogNew } from '../../../components/ui/ConfirmDialogNew';
import toast from 'react-hot-toast';
import { ProjectFiltersPanel } from './ProjectFiltersPanel';
import { ProjectsTable } from './ProjectsTable';
import { ProjectModal } from './ProjectModal';
import { ProjectForm } from './ProjectForm';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { fetchProjects, type Project } from './projectsSlice';
import { useReference } from '@/features/reference/useReference';
import { Pagination2 } from './Pagination2';

export default function ProjectsPage() {
    const dispatch = useAppDispatch();
    const { items, pagination, loading, error } = useAppSelector((state) => state.projects);

    const [projects, setProjects] = useState<Project[]>(items);
    const [filteredProjects, setFilteredProjects] = useState<Project[]>(items);
    const [nextId, setNextId] = useState(11);

    // Пагинация
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Модальные окна
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [formLoading, setFormLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // ===== 1. Первичная загрузка =====
    useEffect(() => {
        dispatch(fetchProjects({ page: 1, size: 10 }));
    }, [dispatch]);

    // Справочники
    const refs = {
        projectTypes: useReference('projectTypes'),
        projectStatuses: useReference('projectStatuses'),
        users: useReference('users'),
    };
    // Фильтрация
    const handleSearch = (filters: {
        search: string;
        typeId: number | null;
        statusId: number | null;
        customerId: number | null;
    }) => {
        let result = [...projects];

        // Поиск по тексту
        if (filters.search.trim()) {
            const search = filters.search.toLowerCase().trim();
            result = result.filter(
                (p) =>
                    p.name.toLowerCase().includes(search) ||
                    p.code.toLowerCase().includes(search) ||
                    p.address.toLowerCase().includes(search),
            );
        }

        // Фильтр по типу
        if (filters.typeId) {
            result = result.filter((p) => p.type === filters.typeId);
        }

        // Фильтр по статусу
        if (filters.statusId) {
            result = result.filter((p) => p.status === filters.statusId);
        }

        // Фильтр по заказчику
        if (filters.customerId) {
            result = result.filter((p) => p.customer_id === filters.customerId);
        }

        setFilteredProjects(result);
        setCurrentPage(1);

        toast.success(
            <div>
                <div className="font-semibold">Найдено проектов: {result.length}</div>
            </div>,
        );
    };

    const handleReset = () => {
        setFilteredProjects(projects);
        setCurrentPage(1);
        toast.success('Фильтры сброшены');
    };

    const handleCreate = () => {
        setSelectedProject(null);
        setIsCreateModalOpen(true);
    };

    const handleEdit = (project: Project) => {
        setSelectedProject(project);
        setIsEditModalOpen(true);
    };

    const handleDelete = (project: Project) => {
        setSelectedProject(project);
        setIsDeleteDialogOpen(true);
    };

    // CRUD операции
    const handleCreateProject = async (
        data: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'deleted'>,
    ) => {
        setFormLoading(true);

        // Имитация API запроса
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const newProject: Project = {
            ...data,
            id: nextId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            deleted: false,
        };

        const updatedProjects = [newProject, ...projects];
        setProjects(updatedProjects);
        setFilteredProjects(updatedProjects);
        setNextId(nextId + 1);
        setFormLoading(false);
        setIsCreateModalOpen(false);

        toast.success(
            <div>
                <div className="font-semibold">Проект создан!</div>
                <div className="text-xs text-gray-600 mt-0.5">{data.name}</div>
            </div>,
        );
    };

    const handleUpdateProject = async (
        data: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'deleted'>,
    ) => {
        if (!selectedProject) return;

        setFormLoading(true);

        // Имитация API запроса
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const updatedProject: Project = {
            ...data,
            id: selectedProject.id,
            created_at: selectedProject.created_at,
            updated_at: new Date().toISOString(),
            deleted: false,
        };

        const updatedProjects = projects.map((p) =>
            p.id === selectedProject.id ? updatedProject : p,
        );
        setProjects(updatedProjects);
        setFilteredProjects(updatedProjects);

        setFormLoading(false);
        setIsEditModalOpen(false);
        setSelectedProject(null);

        toast.success(
            <div>
                <div className="font-semibold">Проект обновлён!</div>
                <div className="text-xs text-gray-600 mt-0.5">{data.name}</div>
            </div>,
        );
    };

    const handleConfirmDelete = async () => {
        if (!selectedProject) return;

        setDeleteLoading(true);

        // Имитация API запроса
        await new Promise((resolve) => setTimeout(resolve, 800));

        const updatedProjects = projects.filter((p) => p.id !== selectedProject.id);
        setProjects(updatedProjects);
        setFilteredProjects(updatedProjects);

        setDeleteLoading(false);
        setIsDeleteDialogOpen(false);

        toast.success(
            <div>
                <div className="font-semibold">Проект удалён!</div>
                <div className="text-xs text-gray-600 mt-0.5">{selectedProject.name}</div>
            </div>,
        );

        setSelectedProject(null);
    };

    // Пагинация
    const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
    const paginatedProjects = filteredProjects.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
            {/* <Toaster position="top-right" richColors closeButton /> */}

            <div className="mx-auto max-w-[1800px] px-6 py-8">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="mb-2 text-3xl font-bold text-sky-800">Объекты</h1>
                    <p className="text-sm text-sky-700">
                        Панель управления строительными объектами
                    </p>
                </div>

                {/* Панель фильтров */}
                <ProjectFiltersPanel
                    refs={refs}
                    onSearch={handleSearch}
                    onReset={handleReset}
                    onCreate={handleCreate}
                />

                {/* Таблица */}
                <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
                    <ProjectsTable
                        projects={paginatedProjects}
                        loading={loading}
                        refs={refs}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />

                    {/* Пагинация */}
                    {filteredProjects.length > 0 && (
                        // <>ПАГИНАЦИИ</>
                        <Pagination2
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={filteredProjects.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                        />
                    )}
                </div>
            </div>

            {/* Модальное окно создания */}
            <ProjectModal
                isOpen={isCreateModalOpen}
                onClose={() => !formLoading && setIsCreateModalOpen(false)}
                title="Создать новый объект"
            >
                <ProjectForm
                    refs={refs}
                    // onSubmit={handleCreateProject}
                    onCancel={() => setIsCreateModalOpen(false)}
                    loading={formLoading}
                />
            </ProjectModal>

            {/* Модальное окно редактирования */}
            <ProjectModal
                isOpen={isEditModalOpen}
                onClose={() => !formLoading && setIsEditModalOpen(false)}
                title="Редактировать объект"
            >
                <ProjectForm
                    project={selectedProject}
                    refs={refs}
                    // onSubmit={handleUpdateProject}
                    onCancel={() => setIsEditModalOpen(false)}
                    loading={formLoading}
                />
            </ProjectModal>

            {/* Диалог подтверждения удаления */}
            <ConfirmDialogNew
                isOpen={isDeleteDialogOpen}
                onClose={() => !deleteLoading && setIsDeleteDialogOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Удалить проект?"
                message={`Вы уверены, что хотите удалить проект "${selectedProject?.name}" (${selectedProject?.code})? Это действие нельзя отменить.`}
                confirmText="Удалить"
                cancelText="Отмена"
                variant="danger"
                loading={deleteLoading}
            />
        </div>
    );
}
