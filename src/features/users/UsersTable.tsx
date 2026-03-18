import type { ReferenceResult } from '@/features/reference/referenceSlice';
import { Pencil, Trash2, Loader2, FolderOpen, Mail, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { User } from './userSlice';
import { StyledTooltip } from '@/components/ui/StyledTooltip';
import { formatPhoneDisplay } from '@/utils/formatPhoneNumber';

interface UsersTableProps {
    users: User[];
    refs: Record<string, ReferenceResult>;
    onEdit: (user: User) => void;
    onDelete: (user: User) => void;
    loading?: boolean;
}

const ROLE_CONFIG: Record<number, { label: string; className: string }> = {
    1: {
        label: 'Администратор',
        className: 'bg-red-100 text-red-800 border-red-200',
    },
    2: {
        label: 'Руководитель',
        className: 'bg-purple-100 text-purple-800 border-purple-200',
    },
    3: {
        label: 'Инженер-проектант',
        className: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    4: {
        label: 'Прораб',
        className: 'bg-orange-100 text-orange-800 border-orange-200',
    },
    5: {
        label: 'Кладовщик',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    },
    6: {
        label: 'Бухгалтер',
        className: 'bg-green-100 text-green-800 border-green-200',
    },
    7: {
        label: 'Снабженец',
        className: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    },
    8: {
        label: 'Подрядчик',
        className: 'bg-gray-100 text-gray-800 border-gray-200',
    },
    9: {
        label: 'Начальник участка',
        className: 'bg-teal-100 text-teal-800 border-teal-200',
    },
    10: {
        label: 'Инженер ПТО',
        className: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    },
    11: {
        label: 'Главный инженер',
        className: 'bg-slate-100 text-slate-800 border-slate-200',
    },
    13: {
        label: 'Поставщик',
        className: 'bg-lime-100 text-lime-800 border-lime-200',
    },
    14: {
        label: 'Юрист',
        className: 'bg-pink-100 text-pink-800 border-pink-200',
    },
    15: {
        label: 'Мастер',
        className: 'bg-amber-100 text-amber-800 border-amber-200',
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
            ROLE_CONFIG[statusId] || {
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
                    <p className="text-sm text-gray-500">Загрузка пользователей...</p>
                </div>
            </div>
        );
    }

    if (!loading && users.length === 0) {
        return (
            <div className="py-20 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gray-100 rounded-full">
                    <FolderOpen className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="mb-1 text-base font-medium text-gray-900">Нет пользователей</h3>
                <p className="text-sm text-gray-500">
                    Создайте пользователя, нажав на кнопку "Создать"
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
                        const statusInfo = getStatusConfig(user.role_id);

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

                                {/* Логин */}
                                <td className="px-3 py-2.5">
                                    <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold text-sky-700 bg-sky-100 border border-sky-200 rounded">
                                        {user.username}
                                    </span>
                                </td>

                                {/* ФИО */}
                                <td className="px-3 py-2.5">
                                    <div className="space-y-1 text-sm">
                                        {user.first_name && (
                                            <div className="flex items-center gap-1.5 text-gray-700">
                                                {/* <Person /> */}
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
                                                {formatPhoneDisplay(user.phone)}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                {/* userRole */}
                                <td className="px-3 py-2.5">
                                    <span
                                        className={`
                                            inline-flex items-center px-2 py-0.5
                                            text-xs font-semibold border rounded-full
                                             ${statusInfo.className}
                                        `}
                                    >
                                        {user.role_id ? refs.userRoles.lookup(user.role_id) : '_'}
                                    </span>
                                </td>
                                {/* Поставщик */}
                                <td className="px-3 py-2.5">
                                    {user.supplier_id ? (
                                        <span
                                            className={`
                                                inline-flex items-center px-2 py-0.5 border-l-amber-500
                                                text-xs border-l-2
                                            `}
                                        >
                                            {refs.suppliers.lookup(user.supplier_id)}
                                        </span>
                                    ) : (
                                        '_'
                                    )}
                                </td>

                                {/* Подрядчик */}
                                <td className="px-3 py-2.5">
                                    {user.contractor_id ? (
                                        <span
                                            className={`
                                                inline-flex items-center px-2 py-0.5 border-l-red-700
                                                text-xs border-l-2
                                            `}
                                        >
                                            {refs.contractors.lookup(user.contractor_id)}
                                        </span>
                                    ) : (
                                        '_'
                                    )}
                                </td>
                                {/* Действия */}
                                <td className="px-3 py-2">
                                    <div className="flex items-center justify-center gap-1.5">
                                        <StyledTooltip title="Редактировать">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEdit(user);
                                                }}
                                                className="
                                                    p-1.5
                                                    text-gray-400
                                                    hover:text-blue-600
                                                    hover:bg-blue-50
                                                    rounded
                                                    transition-colors
                                                "
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                            </button>
                                        </StyledTooltip>
                                        <StyledTooltip title="Удалить">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDelete(user);
                                                }}
                                                className="
                                                    p-1.5
                                                    text-gray-400
                                                    hover:text-red-600
                                                    hover:bg-red-50
                                                    rounded
                                                    transition-colors
                                                "
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </StyledTooltip>
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
