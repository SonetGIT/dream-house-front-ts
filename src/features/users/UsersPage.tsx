import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { useReference } from '@/features/reference/useReference';
import { TablePagination } from '@/components/ui/TablePagination';
import { apiRequest } from '@/utils/apiRequest';
import {
    createUser,
    deleteUser,
    fetchUsers,
    updateUser,
    type User,
    type UserSubmitData,
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

    const getErrorMessage = (error: unknown, fallback: string) => {
        return typeof error === 'string'
            ? error
            : error instanceof Error
              ? error.message
              : fallback;
    };

    const buildFetchParams = (
        page: number,
        size: number,
        nextFilters: typeof filters = filters,
    ) => {
        const params: {
            page: number;
            size: number;
            search?: string;
            role_id?: number;
        } = {
            page,
            size,
        };

        const trimmedSearch = nextFilters.search.trim();

        if (trimmedSearch) {
            params.search = trimmedSearch;
        }

        if (nextFilters.role_id != null) {
            params.role_id = nextFilters.role_id;
        }

        return params;
    };

    useEffect(() => {
        dispatch(
            fetchUsers({
                page: 1,
                size: 10,
            }),
        );
    }, [dispatch]);

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

    const handleSearch = (newFilters: typeof filters) => {
        setFilters(newFilters);
        dispatch(fetchUsers(buildFetchParams(1, pagination?.size ?? 10, newFilters)));
    };

    const handleReset = () => {
        const resetFilters = {
            search: '',
            role_id: null,
        };

        setFilters(resetFilters);
        dispatch(fetchUsers(buildFetchParams(1, pagination?.size ?? 10, resetFilters)));
    };

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

    const handleResetPassword = async (user: User) => {
        if (!window.confirm(`Сбросить пароль для ${user.username}?`)) {
            return;
        }

        try {
            const res = await apiRequest('/users/resetPassword/' + user.id, 'PUT');
            toast.success(res.message || 'Пароль сброшен, пользователю назначен временный пароль');
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, 'Ошибка сброса пароля'));
        }
    };

    const refetchUsers = (page = pagination?.page ?? 1, size = pagination?.size ?? 10) => {
        dispatch(fetchUsers(buildFetchParams(page, size)));
    };

    const handleCreateUser = async (data: UserSubmitData) => {
        try {
            setFormLoading(true);

            await dispatch(createUser(data)).unwrap();

            toast.success(`Пользователь создан: ${data.username}`);

            refetchUsers(1);
            setModal(null);
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, 'Ошибка создания пользователя'));
        } finally {
            setFormLoading(false);
        }
    };

    const handleUpdateUser = async (data: UserSubmitData) => {
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

            refetchUsers();
            setModal(null);
            setSelectedUser(null);
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, 'Ошибка обновления пользователя'));
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
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, 'Ошибка удаления пользователя'));
        } finally {
            setDeleteLoading(false);
        }
    };

    /***********************************************************************************************************************/
    return (
        <div className="w-full rounded-[10px] bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
            <div className="w-full px-3 py-3 sm:px-6">
                <h1 className="mb-2 text-3xl font-bold text-left text-sky-800">Пользователи</h1>

                <UsersFiltersPanel
                    refs={refs}
                    onSearch={handleSearch}
                    onReset={handleReset}
                    onCreate={handleCreate}
                />

                <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
                    <UsersTable
                        users={items}
                        loading={loading}
                        refs={refs}
                        onEdit={handleEdit}
                        onResetPassword={handleResetPassword}
                        onDelete={handleDelete}
                    />

                    {pagination && (
                        <TablePagination
                            pagination={pagination}
                            onPageChange={(newPage) => {
                                dispatch(fetchUsers(buildFetchParams(newPage, pagination.size)));
                            }}
                            onSizeChange={(newSize) => {
                                dispatch(fetchUsers(buildFetchParams(1, newSize)));
                            }}
                            sizeOptions={[10, 25, 50, 100]}
                            showFirstButton
                            showLastButton
                        />
                    )}
                </div>
            </div>

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
