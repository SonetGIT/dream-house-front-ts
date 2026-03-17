import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { useReference } from '@/features/reference/useReference';
import { TablePagination } from '@/components/ui/TablePagination';
import {
    createUser,
    deleteUser,
    fetchUsers,
    updateUser,
    type User,
    type UserFormData,
} from './userSlice';
import UsersFiltersPanel from './UsersFiltersPanel';
import UsersTable from './UsersTable';
import UserModal from './UsersModal';
import { ConfirmDialogNew } from '@/components/ui/ConfirmDialogNew';
import UsersForm from './UsersForm';

export default function UsersPage() {
    const dispatch = useAppDispatch();
    const { items, pagination, loading } = useAppSelector((state) => state.users);

    const [filters, setFilters] = useState({
        search: '',
        typeId: null as number | null,
        statusId: null as number | null,
        customerId: null as number | null,
    });

    const [currentPage, setCurrentPage] = useState(1);

    const [modal, setModal] = useState<'create' | 'edit' | 'delete' | null>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const [formLoading, setFormLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    //Первичная загрузка
    useEffect(() => {
        dispatch(
            fetchUsers({
                page: 1,
                size: 10,
            }),
        );
    }, [dispatch]);

    // Справочники
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
        setCurrentPage(1);

        dispatch(
            fetchUsers({
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
        setCurrentPage(1);

        dispatch(
            fetchUsers({
                page: 1,
                size: pagination?.size ?? 10,
            }),
        );

        toast.success('Фильтры сброшены');
    };

    //CRUD
    const handleCreate = () => {
        setSelectedUser(null);
        setModal('create');
    };

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setModal('edit');
    };

    const handleDelete = (user: User) => {
        setSelectedUser(user);
        setModal('delete');
    };

    const handleCreateProject = async (data: UserFormData) => {
        try {
            setFormLoading(true);

            await dispatch(createUser(data)).unwrap();

            toast.success(`Объект создан: ${data.username}`);

            dispatch(
                fetchUsers({
                    page: pagination?.page ?? 1,
                    size: pagination?.size ?? 10,
                    ...filters,
                }),
            );

            setModal(null);
        } catch (err: any) {
            toast.error(err || 'Ошибка создания пользователя');
        } finally {
            setFormLoading(false);
        }
    };

    const handleUpdateProject = async (data: UserFormData) => {
        if (!selectedUser) return;

        try {
            setFormLoading(true);

            await dispatch(
                updateUser({
                    id: selectedUser.id,
                    data,
                }),
            ).unwrap();

            toast.success(`Пользователь обновлён: ${data.username}`);

            dispatch(
                fetchUsers({
                    page: pagination?.page ?? 1,
                    size: pagination?.size ?? 10,
                    ...filters,
                }),
            );

            setModal(null);
            setSelectedUser(null);
        } catch (err: any) {
            toast.error(err || 'Ошибка обновления пользователя');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDeleteProject = async () => {
        if (!selectedUser) return;

        try {
            setDeleteLoading(true);

            await dispatch(deleteUser(selectedUser.id)).unwrap();

            toast.success(`Пользователь удалён: ${selectedUser.username}`);

            dispatch(
                fetchUsers({
                    page: pagination?.page ?? 1,
                    size: pagination?.size ?? 10,
                    ...filters,
                }),
            );

            setModal(null);
            setSelectedUser(null);
        } catch (err: any) {
            toast.error(err || 'Ошибка удаления пользователя');
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
                    <h1 className="mb-2 text-3xl font-bold text-sky-800">Пользователи</h1>
                    <p className="text-sm text-sky-700">Панель управления пользователями</p>
                </div>

                {/* Фильтры */}
                <UsersFiltersPanel
                    refs={refs}
                    onSearch={handleSearch}
                    onReset={handleReset}
                    onCreate={handleCreate}
                />

                {/* Таблица */}
                <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
                    <UsersTable
                        users={items}
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
                                setCurrentPage(newPage);

                                dispatch(
                                    fetchUsers({
                                        page: newPage,
                                        size: pagination.size,
                                        ...filters,
                                    }),
                                );
                            }}
                            onSizeChange={(newSize) => {
                                setCurrentPage(1);

                                dispatch(
                                    fetchUsers({
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
            <UserModal
                isOpen={modal === 'create'}
                onClose={() => setModal(null)}
                title="Создать нового пользователя"
            >
                <UsersForm
                    refs={refs}
                    onSubmit={handleCreateProject}
                    onCancel={() => setModal(null)}
                    loading={formLoading}
                />
            </UserModal>

            {/* EDIT */}
            <UserModal
                isOpen={modal === 'edit'}
                onClose={() => setModal(null)}
                title="Редактировать данные пользователя"
            >
                <UsersForm
                    user={selectedUser}
                    refs={refs}
                    onSubmit={handleUpdateProject}
                    onCancel={() => setModal(null)}
                    loading={formLoading}
                />
            </UserModal>

            {/* DELETE */}
            <ConfirmDialogNew
                isOpen={modal === 'delete'}
                onClose={() => setModal(null)}
                onConfirm={handleDeleteProject}
                title="Удалить проект?"
                message={`Вы уверены, что хотите удалить проект "${selectedUser?.username}" (${selectedUser?.first_name && selectedUser?.last_name})? Это действие нельзя отменить.`}
                confirmText="Удалить"
                cancelText="Отмена"
                variant="danger"
                loading={deleteLoading}
            />
        </div>
    );
}
