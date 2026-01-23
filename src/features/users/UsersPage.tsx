import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { MdGroupAdd, MdOutlineRestartAlt } from 'react-icons/md';
import { ReferenceSelect } from '@/components/ui/ReferenceSelect';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import InputSearch from '@/components/ui/InputSearch';
import { useReference } from '../reference/useReference';
import UserCreateEditFrm from './UserCreateEditFrm';

import {
    fetchUsers,
    setSearch,
    setFilters,
    deleteUser,
    getUserById,
    updateUser,
    type Users,
    createUser,
    resetPassword,
} from './userSlice';
import { StyledTooltip } from '@/components/ui/StyledTooltip';
import UsersTable from './UsersTable';

interface UsersFilters {
    role_id?: string | number;
}
export type ConfirmAction = 'delete' | 'resetPassword' | null;

/*************************************************************************************************************************************************/
export default function UsersPage() {
    const dispatch = useAppDispatch();
    const { items, pagination, loading, error, search } = useAppSelector((state) => state.users);

    //Справочник
    const {
        data: userRoles,
        lookup: userRollName,
        loading: loadingTypes,
    } = useReference('42ff2fe7-d54b-4eef-a13f-29c22bc7c789');

    //Локальные состояния
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [userRolesId, setUserRolesId] = useState<string | number | null>(null);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [editingUser, setEditingUser] = useState<Users | null>(null);
    const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

    //Первичная загрузка Users
    useEffect(() => {
        dispatch(fetchUsers({ page: 1, size: 10 }));
    }, [dispatch]);

    //Формирование фильтров
    const getCurrentFilters = (): UsersFilters => {
        const currentFilters: UsersFilters = {};
        if (userRolesId) currentFilters.role_id = userRolesId;
        return currentFilters;
    };

    //Авто-обновление фильтров при выборе
    useEffect(() => {
        const newFilters = getCurrentFilters();
        dispatch(setFilters(newFilters));
        dispatch(fetchUsers({ page: 1, size: 10, search, filters: newFilters }));
    }, [userRolesId]);

    //Поиск
    const handleSearch = () => {
        dispatch(setSearch(searchText));
        const currentFilters = getCurrentFilters();
        dispatch(setFilters(currentFilters));
        dispatch(fetchUsers({ page: 1, size: 10, search: searchText, filters: currentFilters }));
    };

    useEffect(() => {
        if (searchText.trim() === '') {
            dispatch(fetchUsers({ page: 1 }));
        } else {
            dispatch(fetchUsers({ page: 1, search }));
        }
    }, [searchText]);

    //Сброс данные поиска и филтра
    const handleReset = () => {
        setSearchText('');
        setUserRolesId(null);

        dispatch(setSearch(''));
        dispatch(setFilters({}));
        dispatch(fetchUsers({ page: 1, size: 10 }));
    };

    //Открытие формы создания
    const handleCreate = () => {
        setEditingUser(null); // создаём нового
        setIsFormOpen(true);
    };

    //Открытие формы редактирования
    const handleEdit = async (id: number) => {
        const currentUser = await dispatch(getUserById(id)).unwrap();
        setEditingUser(currentUser); // сразу помещаем пользователя в локальное состояние
        setIsFormOpen(true); // открываем форму после загрузки данных
    };

    //Сохранение формы (создание или редактирование)
    const handleSave = (formData: Partial<Users>) => {
        if (editingUser) {
            dispatch(updateUser({ id: editingUser.id, data: formData }))
                .unwrap()
                .then(() => {
                    dispatch(fetchUsers({ page: 1, size: 10 }));
                    toast.success('Пользователь успешно обновлён');
                })
                .catch((err: string) => {
                    toast.error(err || 'Ошибка при обновлении пользователя');
                });
        } else {
            dispatch(createUser(formData))
                .unwrap()
                .then(() => {
                    dispatch(fetchUsers({ page: 1, size: 10 }));
                    toast.success('Пользователь успешно создан', {
                        duration: 3000,
                    });
                })
                .catch((err: string) => {
                    toast.error(err || 'Ошибка при создании пользователя');
                });
        }
        setIsFormOpen(false);
    };

    //Отмена формы
    const handleCancel = () => {
        setIsFormOpen(false);
        setEditingUser(null);
    };

    const handleDelete = (id: number) => {
        setSelectedUserId(id);
        setConfirmAction('delete');
        setConfirmOpen(true);
    };

    const handleConfirm = () => {
        if (!selectedUserId || !confirmAction) return;

        if (confirmAction === 'delete') {
            dispatch(deleteUser(selectedUserId))
                .unwrap()
                .then(() => {
                    dispatch(
                        fetchUsers({
                            page: 1,
                            size: 10,
                            search,
                            filters: getCurrentFilters(),
                        })
                    );
                    toast.success('Пользователь успешно удалён');
                })
                .catch((err: string) => {
                    toast.error(err || 'Ошибка при удалении пользователя');
                });
        }

        if (confirmAction === 'resetPassword') {
            dispatch(resetPassword({ id: selectedUserId, password: '123456' }))
                .unwrap()
                .then((data) => {
                    toast.success(data.message || 'Пароль сброшен');
                })
                .catch((err: string) => {
                    toast.error(err || 'Ошибка при сбросе пароля');
                });
        }

        setConfirmOpen(false);
        setSelectedUserId(null);
        setConfirmAction(null);
    };

    // обработчик кнопки resetPass
    const handleResetPassword = (userId: number) => {
        setSelectedUserId(userId);
        setConfirmAction('resetPassword');
        setConfirmOpen(true);
    };

    //Пагинация
    const handleNextPage = () => {
        if (!pagination?.hasNext) return;
        dispatch(
            fetchUsers({
                page: pagination.page + 1,
                size: pagination.size,
                search,
                filters: getCurrentFilters(),
            })
        );
    };

    const handlePrevPage = () => {
        if (!pagination?.hasPrev) return;
        dispatch(
            fetchUsers({
                page: pagination.page - 1,
                size: pagination.size,
                search,
                filters: getCurrentFilters(),
            })
        );
    };

    /*UI********************************************************************************************************************************************/
    return (
        <>
            {/* ======= ПОИСК И ФИЛЬТРЫ ======= */}
            {!isFormOpen && (
                <div>
                    <div className="filter-container">
                        <StyledTooltip title="Создать пользователя">
                            <MdGroupAdd className="icon" onClick={handleCreate} />
                        </StyledTooltip>
                        <InputSearch
                            value={searchText}
                            onChange={setSearchText}
                            onEnter={handleSearch}
                        />

                        <ReferenceSelect
                            label="Роли"
                            value={userRolesId || ''}
                            onChange={setUserRolesId}
                            options={userRoles || []}
                            loading={loadingTypes}
                        />

                        <StyledTooltip title="Сбросить фильтры и поиск">
                            <MdOutlineRestartAlt className="icon" onClick={handleReset} />
                        </StyledTooltip>
                    </div>

                    <UsersTable
                        items={items}
                        userRollName={userRollName}
                        loading={loading}
                        error={error}
                        pagination={pagination}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onResetPass={handleResetPassword}
                        onPrevPage={handlePrevPage}
                        onNextPage={handleNextPage}
                    />
                </div>
            )}
            {isFormOpen && (
                <UserCreateEditFrm
                    user={editingUser || undefined} // для редактирования или создания
                    userRoles={userRoles || []}
                    onSubmit={handleSave}
                    onCancel={handleCancel}
                />
            )}
            {/* Диалог подтверждения */}
            <ConfirmDialog
                open={confirmOpen}
                title={confirmAction === 'delete' ? 'Удалить пользователя?' : 'Сбросить пароль?'}
                message={
                    confirmAction === 'delete'
                        ? 'Вы уверены, что хотите удалить этого пользователя?'
                        : 'Пароль пользователя будет сброшен. Продолжить?'
                }
                onConfirm={handleConfirm}
                onCancel={() => {
                    setConfirmOpen(false);
                    setSelectedUserId(null);
                    setConfirmAction(null);
                }}
            />
        </>
    );
}
