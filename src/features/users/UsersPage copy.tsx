import { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { deleteUser, fetchUsers, type User } from './userSlice';
import toast from 'react-hot-toast';
import UsersTable from './UsersTable';

export default function UsersPagecc() {
    const dispatch = useAppDispatch();
    const { items, loading } = useAppSelector((state) => state.users);
    const [search, setSearch] = useState('');

    useEffect(() => {
        dispatch(fetchUsers({ search, page: 1, size: 10 }));
    }, [dispatch, search]);

    const handleEdit = (user: User) => {
        toast.success(`Редактирование пользователя: ${user.username}`);
        // TODO: Открыть модальное окно редактирования
    };

    const handleDelete = async (user: User) => {
        if (!confirm(`Вы уверены, что хотите удалить пользователя "${user.username}"?`)) {
            return;
        }

        try {
            await dispatch(deleteUser(user.id)).unwrap();
            toast.success('Пользователь успешно удален');
            dispatch(fetchUsers({ search, page: 1, size: 10 }));
        } catch (error) {
            toast.error('Ошибка при удалении пользователя');
        }
    };

    const handleCreate = () => {
        toast.success('Создание нового пользователя');
        // TODO: Открыть модальное окно создания
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
            <div className="mx-auto max-w-[1800px] px-6 py-8">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="mb-2 text-3xl font-bold text-sky-800">Пользователи</h1>
                    <p className="text-sm text-sky-700">Панель управления пользователями системы</p>
                </div>
                {/* Header */}

                {/* Search */}
                <div className="p-4 bg-white border border-gray-200 rounded-lg">
                    <div className="relative">
                        <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                        <input
                            type="text"
                            placeholder="Поиск по имени, логину, email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden bg-white border border-gray-200 rounded-lg">
                    <UsersTable
                        users={items}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        loading={loading}
                    />
                </div>
            </div>
        </div>
    );
}
