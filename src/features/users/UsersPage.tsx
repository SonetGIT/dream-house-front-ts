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
import { ConfirmDialogNew } from '@/components/ui/ConfirmDialogNew';
import UsersForm from './UsersForm';
import Modal from '@/components/ui/Modal';

export default function UsersPage() {
    const dispatch = useAppDispatch();
    const { items, pagination, loading } = useAppSelector((state) => state.users);

    const [filters, setFilters] = useState({
        search: '',
        role_id: null as number | null,
    });
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
    const users = useReference('users');
    const userRoles = useReference('userRoles');
    const suppliers = useReference('suppliers');
    const contractors = useReference('contractors');

    const refs = {
        users,
        userRoles,
        suppliers,
        contractors,
    };

    //Поиск
    const handleSearch = (newFilters: typeof filters) => {
        setFilters(newFilters);
        const params: any = {
            page: 1,
            size: pagination?.size ?? 10,
        };

        if (newFilters.search) {
            params.search = newFilters.search;
        }

        if (newFilters.role_id) {
            params.role_id = newFilters.role_id;
        }

        dispatch(fetchUsers(params));
    };

    const handleReset = () => {
        const resetFilters = {
            search: '',
            role_id: null,
        };

        setFilters(resetFilters);
        dispatch(
            fetchUsers({
                page: 1,
                size: pagination?.size ?? 10,
            }),
        );
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
    const refetchUsers = (page = pagination?.page ?? 1, size = pagination?.size ?? 10) => {
        const params: any = {
            page,
            size,
        };

        if (filters.search) {
            params.search = filters.search;
        }

        if (filters.role_id) {
            params.role_id = filters.role_id;
        }

        dispatch(fetchUsers(params));
    };

    const handleCreateUser = async (data: UserFormData) => {
        try {
            setFormLoading(true);

            await dispatch(createUser(data)).unwrap();

            toast.success(`Пользователь создан: ${data.username}`);

            refetchUsers(1); //всегда на первую страницу

            setModal(null);
        } catch (err: any) {
            toast.error(err || 'Ошибка создания пользователя');
        } finally {
            setFormLoading(false);
        }
    };

    const handleUpdateUser = async (data: UserFormData) => {
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

            refetchUsers(); // 👈 остаёмся на текущей странице

            setModal(null);
            setSelectedUser(null);
        } catch (err: any) {
            toast.error(err || 'Ошибка обновления пользователя');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDeleteUser = async () => {
        if (!selectedUser) return;

        try {
            setDeleteLoading(true);

            await dispatch(deleteUser(selectedUser.id)).unwrap();

            toast.success(`Пользователь удалён: ${selectedUser.username}`);

            const isLastItem = items.length === 1 && (pagination?.page ?? 1) > 1;

            refetchUsers(isLastItem ? pagination!.page - 1 : pagination?.page);

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
                                dispatch(
                                    fetchUsers({
                                        page: newPage,
                                        size: pagination.size,
                                        ...filters,
                                    }),
                                );
                            }}
                            onSizeChange={(newSize) => {
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
            <Modal
                isOpen={modal === 'create'}
                onClose={() => setModal(null)}
                title="Создать нового пользователя"
            >
                <UsersForm
                    refs={refs}
                    onSubmit={handleCreateUser}
                    onCancel={() => setModal(null)}
                    loading={formLoading}
                />
            </Modal>

            {/* EDIT */}
            <Modal
                isOpen={modal === 'edit'}
                onClose={() => setModal(null)}
                title="Редактировать данные пользователя"
            >
                <UsersForm
                    user={selectedUser}
                    refs={refs}
                    onSubmit={handleUpdateUser}
                    onCancel={() => setModal(null)}
                    loading={formLoading}
                />
            </Modal>

            {/* DELETE */}
            <ConfirmDialogNew
                isOpen={modal === 'delete'}
                onClose={() => setModal(null)}
                onConfirm={handleDeleteUser}
                title="Удалить пользователя?"
                message={`Вы уверены, что хотите удалить пользователя "${selectedUser?.username}"?`}
                confirmText="Удалить"
                cancelText="Отмена"
                variant="danger"
                loading={deleteLoading}
            />
        </div>
    );
}
