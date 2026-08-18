import type { ReferenceResult } from '@/features/reference/referenceSlice';
import { Pencil, Trash2, Loader2, FolderOpen, Mail, Phone, KeyRound } from 'lucide-react';
import type { User } from '@/features/users/userSlice';
import { StyledTooltip } from '@/components/ui/StyledTooltip';
import { formatPhoneDisplay } from '@/utils/formatPhoneNumber';

interface UsersTableMobileResetProps {
    users: User[];
    refs: Record<string, ReferenceResult>;
    onEdit: (user: User) => void;
    onResetPassword: (user: User) => void;
    onDelete: (user: User) => void;
    loading?: boolean;
}

const ROLE_CONFIG: Record<number, { className: string }> = {
    1: { className: 'bg-red-100 text-red-800 border-red-200' },
    2: { className: 'bg-purple-100 text-purple-800 border-purple-200' },
    3: { className: 'bg-blue-100 text-blue-800 border-blue-200' },
    4: { className: 'bg-orange-100 text-orange-800 border-orange-200' },
    5: { className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    6: { className: 'bg-green-100 text-green-800 border-green-200' },
    7: { className: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    8: { className: 'bg-gray-100 text-gray-800 border-gray-200' },
    9: { className: 'bg-teal-100 text-teal-800 border-teal-200' },
    10: { className: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
    11: { className: 'bg-slate-100 text-slate-800 border-slate-200' },
    13: { className: 'bg-lime-100 text-lime-800 border-lime-200' },
    14: { className: 'bg-pink-100 text-pink-800 border-pink-200' },
    15: { className: 'bg-amber-100 text-amber-800 border-amber-200' },
};

export default function UsersTableMobileReset({
    users,
    refs,
    onEdit,
    onResetPassword,
    onDelete,
    loading,
}: UsersTableMobileResetProps) {
    const getStatusConfig = (statusId: number) => {
        return (
            ROLE_CONFIG[statusId] || {
                className: 'bg-gray-100 text-gray-800 border-gray-200',
            }
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
                    <p className="text-sm text-gray-500">
                        {'\u0417\u0430\u0433\u0440\u0443\u0437\u043a\u0430 \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u0435\u0439...'}
                    </p>
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
                <h3 className="mb-1 text-base font-medium text-gray-900">
                    {'\u041d\u0435\u0442 \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u0435\u0439'}
                </h3>
                <p className="text-sm text-gray-500">
                    {'\u0421\u043e\u0437\u0434\u0430\u0439\u0442\u0435 \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044f, \u043d\u0430\u0436\u0430\u0432 \u043d\u0430 \u043a\u043d\u043e\u043f\u043a\u0443 "\u0421\u041e\u0417\u0414\u0410\u0422\u042c"'}
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[1400px]">
                <thead>
                    <tr className="text-white bg-gradient-to-r from-sky-600 to-sky-600">
                        <th className="w-12 px-3 py-3 text-xs font-semibold text-left">#</th>
                        <th className="w-24 px-3 py-3 text-xs font-semibold text-left">
                            {'\u041b\u043e\u0433\u0438\u043d'}
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-semibold w-[120px]">
                            {'\u0424\u0418\u041e'}
                        </th>
                        <th className="w-32 px-3 py-3 text-xs font-semibold text-left">
                            {'\u041a\u043e\u043d\u0442\u0430\u043a\u0442\u044b'}
                        </th>
                        <th className="w-32 px-3 py-3 text-xs font-semibold text-left">
                            {'\u0420\u043e\u043b\u044c'}
                        </th>
                        <th className="w-32 px-3 py-3 text-xs font-semibold text-left">
                            {'\u041f\u043e\u0441\u0442\u0430\u0432\u0449\u0438\u043a'}
                        </th>
                        <th className="w-32 px-3 py-3 text-xs font-semibold text-left">
                            {'\u041f\u043e\u0434\u0440\u044f\u0434\u0447\u0438\u043a'}
                        </th>
                        <th className="w-20 px-3 py-3 text-xs font-semibold text-center">
                            {'\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044f'}
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user, index) => {
                        const statusInfo = getStatusConfig(user.role_id);

                        return (
                            <tr key={user.id} className="transition-colors hover:bg-sky-50/50 group">
                                <td className="px-3 py-2.5 text-xs text-left text-gray-700 font-medium">
                                    {index + 1}
                                </td>
                                <td className="px-3 py-2.5 text-left">
                                    <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold text-sky-700 bg-sky-100 border border-sky-200 rounded">
                                        {user.username}
                                    </span>
                                </td>
                                <td className="px-3 py-2.5 text-left">
                                    <div className="space-y-1 text-sm">
                                        {user.first_name && (
                                            <div className="flex items-center gap-1.5 text-gray-700">
                                                <span className="truncate max-w-[200px]">
                                                    {[user.first_name, user.last_name, user.middle_name]
                                                        .filter(Boolean)
                                                        .join(' ')}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-3 py-2.5 text-left">
                                    <div className="space-y-1 text-sm">
                                        {user.phone && (
                                            <div className="flex items-center gap-1.5 text-gray-700 text-sm">
                                                <Phone className="w-3.5 h-3.5 text-gray-400" />
                                                {formatPhoneDisplay(user.phone)}
                                            </div>
                                        )}
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
                                                    <span className="text-xs text-gray-400">-</span>
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-3 py-2.5 text-left">
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
                                <td className="px-3 py-2.5 text-left">
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
                                <td className="px-3 py-2.5 text-left">
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
                                <td className="px-3 py-2">
                                    <div className="flex items-center justify-center gap-1.5">
                                        <StyledTooltip
                                            title={'\u0420\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c'}
                                        >
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
                                        <StyledTooltip
                                            title={
                                                '\u0421\u0431\u0440\u043e\u0441\u0438\u0442\u044c \u043f\u0430\u0440\u043e\u043b\u044c'
                                            }
                                        >
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onResetPassword(user);
                                                }}
                                                className="
                                                    p-1.5
                                                    text-gray-400
                                                    hover:text-amber-600
                                                    hover:bg-amber-50
                                                    rounded
                                                    transition-colors
                                                "
                                            >
                                                <KeyRound className="w-3.5 h-3.5" />
                                            </button>
                                        </StyledTooltip>
                                        <StyledTooltip
                                            title={'\u0423\u0434\u0430\u043b\u0438\u0442\u044c'}
                                        >
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
