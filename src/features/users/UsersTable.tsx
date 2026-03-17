import type { ReferenceResult } from '@/features/reference/referenceSlice';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatData';
import { Pencil, Trash2, Loader2, FolderOpen, Mail, Phone, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RowActions } from '@/components/ui/RowActions';
import type { User } from './userSlice';
import { formatPhone } from '@/utils/formatPhone';

interface UsersTableProps {
    users: User[];
    refs: Record<string, ReferenceResult>;
    onEdit: (user: User) => void;
    onDelete: (user: User) => void;
    loading?: boolean;
}

const STATUS_CONFIG: Record<number, { label: string; className: string }> = {
    1: {
        label: 'Планирование',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    },
    2: {
        label: 'В работе',
        className: 'bg-green-100 text-green-800 border-green-200',
    },
    3: {
        label: 'Завершён',
        className: 'bg-orange-100 text-orange-800 border-orange-200',
    },
    4: {
        label: 'Приостановлен',
        className: 'bg-blue-100 text-blue-800 border-blue-200',
    },
};

/************************************************************************************************************/
export default function UsersTable({ users, refs, onEdit, onDelete, loading }: UsersTableProps) {
    const navigate = useNavigate();
    const handleRowClick = (user: User) => {
        navigate(`/users/${user.id}`, { state: { user } });
    };
    const getStatusConfig = (statusId: number) => {
        return (
            STATUS_CONFIG[statusId] || {
                label: 'Неизвестно',
                className: 'bg-gray-100 text-gray-800 border-gray-200',
            }
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
                    <p className="text-sm text-gray-500">Загрузка проектов...</p>
                </div>
            </div>
        );
    }

    if (users.length === 0) {
        return (
            <div className="py-20 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gray-100 rounded-full">
                    <FolderOpen className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="mb-1 text-base font-medium text-gray-900">Нет проектов</h3>
                <p className="text-sm text-gray-500">
                    Создайте первый проект, нажав на кнопку "Создать проект"
                </p>
            </div>
        );
    }

    /*************************************************************************************************************************/
    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[1400px]">
                <thead>
                    <tr className="text-white bg-gradient-to-r from-sky-600 to-sky-600">
                        <th className="w-12 px-3 py-3 text-xs font-semibold text-left">№</th>
                        <th className="w-24 px-3 py-3 text-xs font-semibold text-left">Логин</th>
                        <th className="px-3 py-3 text-left text-xs font-semibold w-[120px]">ФИО</th>
                        <th className="w-32 px-3 py-3 text-xs font-semibold text-left">Контакты</th>
                        <th className="w-32 px-3 py-3 text-xs font-semibold text-left">Роль</th>
                        <th className="w-32 px-3 py-3 text-xs font-semibold text-left">
                            Поставщик
                        </th>
                        <th className="w-32 px-3 py-3 text-xs font-semibold text-left">
                            Подрядчик
                        </th>
                        <th className="w-20 px-3 py-3 text-xs font-semibold text-center">
                            Действия
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user, index) => {
                        // const statusInfo = getStatusConfig(user.status);

                        return (
                            <tr
                                key={user.id}
                                className="transition-colors hover:bg-sky-50/50 group"
                                onClick={() => handleRowClick(user)}
                            >
                                {/* Номер */}
                                <td className="px-3 py-2.5 text-xs text-gray-700 font-medium">
                                    {index + 1}
                                </td>

                                {/* Название */}
                                <td className="px-3 py-2.5">
                                    <div className="text-xs font-medium text-gray-900 truncate max-w-[120px]">
                                        {user.username}
                                    </div>
                                </td>
                                {/* ФИО */}
                                <td className="px-3 py-2.5">
                                    <div className="space-y-1 text-sm">
                                        {user.first_name && (
                                            <div className="flex items-center gap-1.5 text-gray-700">
                                                {/* <Person /> */}
                                                <UserIcon className="w-3.5 h-3.5 text-gray-400" />
                                                <span className="truncate max-w-[200px]">
                                                    {[
                                                        user.last_name,
                                                        user.first_name,
                                                        user.middle_name,
                                                    ]
                                                        .filter(Boolean)
                                                        .join(' ')}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </td>

                                {/* Контакты */}
                                <td className="px-3 py-2.5">
                                    <div className="space-y-1 text-sm">
                                        <div className="flex items-center gap-1.5 text-gray-700">
                                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                                            <span className="truncate max-w-[200px]">
                                                {user.email ? (
                                                    <a
                                                        href={`mailto:${user.email}`}
                                                        className="text-sm font-medium text-sky-600 hover:underline truncate max-w-[160px] block"
                                                    >
                                                        {user.email}
                                                    </a>
                                                ) : (
                                                    <span className="text-xs text-gray-400">—</span>
                                                )}
                                            </span>
                                        </div>
                                        {user.phone && (
                                            <div className="flex items-center gap-1.5 text-gray-700 text-sm">
                                                <Phone className="w-3.5 h-3.5 text-gray-400" />
                                                {formatPhone(user.phone)}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                {/* Тип */}
                                {/* <td className="px-3 py-2.5 text-xs text-gray-700">
                                    {user.type ? refs.projectTypes.lookup(user.type) : '_'}
                                </td> */}

                                {/* Адрес */}
                                {/* <td className="px-3 py-2.5">
                                    <div className="text-xs font-medium text-gray-900 truncate max-w-[120px]">
                                        {user.address}
                                    </div>
                                </td> */}
                                {/* Даты с-по*/}

                                {/* Действия */}
                                <td className="px-3 py-2">
                                    <div className="flex items-center justify-center gap-1.5">
                                        <RowActions
                                            row={user}
                                            actions={[
                                                {
                                                    label: 'Редактировать',
                                                    icon: Pencil,
                                                    onClick: onEdit,
                                                    className: 'text-blue-500 hover:bg-blue-50',
                                                },
                                                {
                                                    label: 'Удалить',
                                                    icon: Trash2,
                                                    onClick: onDelete,
                                                    className: 'text-red-600 hover:bg-red-50',
                                                },
                                            ]}
                                        />
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
