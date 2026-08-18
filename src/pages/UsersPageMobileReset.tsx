import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useReference } from '@/features/reference/useReference';
import { TablePagination } from '@/components/ui/TablePagination';
import { apiRequest } from '@/utils/apiRequest';
import type { Pagination, User, UserSubmitData } from '@/features/users/userSlice';
import UsersFiltersPanelMobileReset from './UsersFiltersPanelMobileReset';
import UsersFormMobileReset from './UsersFormMobileReset';
import UsersTableMobileReset from './UsersTableMobileReset';
import { ConfirmDialogNew } from '@/components/ui/ConfirmDialogNew';
import Modal from '@/components/ui/Modal';

export default function UsersPageMobileReset() {
    const [items, setItems] = useState<User[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        search: '',
        role_id: null as number | null,
    });
    const [modal, setModal] = useState<'create' | 'edit' | 'delete' | null>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [formLoading, setFormLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

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

    const loadUsers = async (page = 1, size = pagination?.size ?? 10, nextFilters = filters) => {
        try {
            setLoading(true);
            const res = await apiRequest<User[]>(
                '/users/search',
                'POST',
                buildFetchParams(page, size, nextFilters),
            );
            setItems(res.data);
            setPagination(res.pagination ?? null);
        } catch (error: unknown) {
            toast.error(
                getErrorMessage(
                    error,
                    '\u041e\u0448\u0438\u0431\u043a\u0430 \u0437\u0430\u0433\u0440\u0443\u0437\u043a\u0438 \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u0435\u0439',
                ),
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers(1, 10);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSearch = (newFilters: typeof filters) => {
        setFilters(newFilters);
        loadUsers(1, pagination?.size ?? 10, newFilters);
    };

    const handleReset = () => {
        const resetFilters = {
            search: '',
            role_id: null,
        };

        setFilters(resetFilters);
        loadUsers(1, pagination?.size ?? 10, resetFilters);
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
        if (
            !window.confirm(
                `\u0421\u0431\u0440\u043e\u0441\u0438\u0442\u044c \u043f\u0430\u0440\u043e\u043b\u044c \u0434\u043b\u044f ${user.username}?`,
            )
        ) {
            return;
        }

        try {
            const res = await apiRequest('/users/resetPassword/' + user.id, 'PUT');
            toast.success(
                res.message ||
                    '\u041f\u0430\u0440\u043e\u043b\u044c \u0441\u0431\u0440\u043e\u0448\u0435\u043d, \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044e \u043d\u0430\u0437\u043d\u0430\u0447\u0435\u043d \u0432\u0440\u0435\u043c\u0435\u043d\u043d\u044b\u0439 \u043f\u0430\u0440\u043e\u043b\u044c',
            );
        } catch (error: unknown) {
            toast.error(
                getErrorMessage(
                    error,
                    '\u041e\u0448\u0438\u0431\u043a\u0430 \u0441\u0431\u0440\u043e\u0441\u0430 \u043f\u0430\u0440\u043e\u043b\u044f',
                ),
            );
        }
    };

    const refetchUsers = (page = pagination?.page ?? 1, size = pagination?.size ?? 10) => {
        loadUsers(page, size);
    };

    const handleCreateUser = async (data: UserSubmitData) => {
        try {
            setFormLoading(true);
            await apiRequest<User>('/users/createUser', 'POST', data);
            toast.success(
                `\u041f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044c \u0441\u043e\u0437\u0434\u0430\u043d: ${data.username}`,
            );
            await loadUsers(1, pagination?.size ?? 10);
            setModal(null);
        } catch (error: unknown) {
            toast.error(
                getErrorMessage(
                    error,
                    '\u041e\u0448\u0438\u0431\u043a\u0430 \u0441\u043e\u0437\u0434\u0430\u043d\u0438\u044f \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044f',
                ),
            );
        } finally {
            setFormLoading(false);
        }
    };

    const handleUpdateUser = async (data: UserSubmitData) => {
        if (!selectedUser) return;

        try {
            setFormLoading(true);
            await apiRequest<User>(`/users/update/${selectedUser.id}`, 'PUT', data);
            toast.success(
                `\u041f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044c \u043e\u0431\u043d\u043e\u0432\u043b\u0451\u043d: ${data.username}`,
            );
            refetchUsers();
            setModal(null);
            setSelectedUser(null);
        } catch (error: unknown) {
            toast.error(
                getErrorMessage(
                    error,
                    '\u041e\u0448\u0438\u0431\u043a\u0430 \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u0438\u044f \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044f',
                ),
            );
        } finally {
            setFormLoading(false);
        }
    };

    const handleDeleteUser = async () => {
        if (!selectedUser) return;

        try {
            setDeleteLoading(true);
            await apiRequest(`/users/delete/${selectedUser.id}`, 'DELETE');
            toast.success(
                `\u041f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044c \u0443\u0434\u0430\u043b\u0451\u043d: ${selectedUser.username}`,
            );

            const isLastItem = items.length === 1 && (pagination?.page ?? 1) > 1;
            await loadUsers(isLastItem ? (pagination?.page ?? 2) - 1 : pagination?.page ?? 1);

            setModal(null);
            setSelectedUser(null);
        } catch (error: unknown) {
            toast.error(
                getErrorMessage(
                    error,
                    '\u041e\u0448\u0438\u0431\u043a\u0430 \u0443\u0434\u0430\u043b\u0435\u043d\u0438\u044f \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044f',
                ),
            );
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
            <div className="mx-auto max-w-[1800px] px-4 py-6">
                <div>
                    <h1 className="mb-2 text-3xl font-bold text-left text-sky-800">
                        {'\u041f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u0438'}
                    </h1>
                </div>

                <UsersFiltersPanelMobileReset
                    refs={refs}
                    onSearch={handleSearch}
                    onReset={handleReset}
                    onCreate={handleCreate}
                />

                <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
                    <UsersTableMobileReset
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
                                loadUsers(newPage, pagination.size);
                            }}
                            onSizeChange={(newSize) => {
                                loadUsers(1, newSize);
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
                title={
                    '\u0421\u043e\u0437\u0434\u0430\u0442\u044c \u043d\u043e\u0432\u043e\u0433\u043e \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044f'
                }
            >
                <UsersFormMobileReset
                    refs={refs}
                    onSubmit={handleCreateUser}
                    onCancel={() => setModal(null)}
                    loading={formLoading}
                />
            </Modal>

            <Modal
                isOpen={modal === 'edit'}
                onClose={() => setModal(null)}
                title={
                    '\u0420\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u0434\u0430\u043d\u043d\u044b\u0435 \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044f'
                }
            >
                <UsersFormMobileReset
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
                title={'\u0423\u0434\u0430\u043b\u0438\u0442\u044c \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044f?'}
                message={`\u0412\u044b \u0443\u0432\u0435\u0440\u0435\u043d\u044b, \u0447\u0442\u043e \u0445\u043e\u0442\u0438\u0442\u0435 \u0443\u0434\u0430\u043b\u0438\u0442\u044c \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044f "${selectedUser?.username}"?`}
                confirmText={'\u0423\u0434\u0430\u043b\u0438\u0442\u044c'}
                cancelText={'\u041e\u0442\u043c\u0435\u043d\u0430'}
                variant="danger"
                loading={deleteLoading}
            />
        </div>
    );
}
