import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { BellOff, Clock, ChevronDown, Loader2, Eye, Bell } from 'lucide-react';
import { fetchNotifications, markAsRead } from './notificationSlice';
import { formatDate } from '@/utils/formatData';
import { StyledTooltip } from '@/components/ui/StyledTooltip';

type FilterType = 'all' | 'unread' | 'read';

export default function NotificationsTable() {
    const dispatch = useAppDispatch();
    const { items, loading } = useAppSelector((s) => s.notifications);

    const [filter, setFilter] = useState<FilterType>('all');
    const [search, setSearch] = useState('');
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [markingId, setMarkingId] = useState<number | null>(null);

    useEffect(() => {
        dispatch(fetchNotifications({ page: 1, size: 20 }));
    }, [dispatch]);

    const handleRead = async (id: number) => {
        try {
            setMarkingId(id);
            await dispatch(markAsRead(id)).unwrap();
        } finally {
            setMarkingId(null);
        }
    };

    const filtered = useMemo(() => {
        return items.filter((n) => {
            if (filter === 'unread' && n.is_read) return false;
            if (filter === 'read' && !n.is_read) return false;

            if (search.trim()) {
                const q = search.toLowerCase();
                return (
                    n.title.toLowerCase().includes(q) || (n.message || '').toLowerCase().includes(q)
                );
            }

            return true;
        });
    }, [items, filter, search]);

    return (
        <div className="p-1 bg-gray-50">
            <div className="space-y-3">
                <div className="bg-white border border-gray-200 shadow-sm rounded-xl">
                    <div className="flex flex-col gap-3 px-4 py-3 border-b border-gray-100 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2">
                            <Bell className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-semibold text-gray-800">Уведомления</span>
                            <span className="px-2 py-0.5 text-[11px] font-medium text-blue-700 bg-blue-50 border border-blue-100 rounded-full">
                                {filtered.length}
                            </span>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <div className="flex gap-1 p-1 bg-gray-100 rounded-lg items-left">
                                <button
                                    onClick={() => setFilter('all')}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                                        filter === 'all'
                                            ? 'bg-white text-blue-700 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    Все
                                </button>
                                <button
                                    onClick={() => setFilter('unread')}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                                        filter === 'unread'
                                            ? 'bg-white text-blue-700 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    Непрочитанные
                                </button>
                                <button
                                    onClick={() => setFilter('read')}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                                        filter === 'read'
                                            ? 'bg-white text-blue-700 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    Прочитанные
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px]">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="w-8 px-4 py-2 text-left text-[10px] font-bold tracking-widest text-blue-700 uppercase"></th>
                                    <th className="px-3 py-2 text-left text-[10px] font-bold tracking-widest text-blue-700 uppercase">
                                        Заголовок
                                    </th>
                                    <th className="w-36 px-3 py-2 text-center text-[10px] font-bold tracking-widest text-blue-700 uppercase">
                                        Время
                                    </th>
                                    <th className="w-28 px-3 py-2 text-center text-[10px] font-bold tracking-widest text-blue-700 uppercase">
                                        Статус
                                    </th>
                                    <th className="w-20 px-3 py-2 text-center text-[10px] font-bold tracking-widest text-blue-700 uppercase"></th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center">
                                            <div className="flex flex-col items-center gap-2 text-gray-400">
                                                <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                                                <span className="text-xs">
                                                    Загрузка уведомлений...
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center">
                                            <div className="flex flex-col items-center gap-2 text-gray-400">
                                                <BellOff className="w-8 h-8 text-gray-300" />
                                                <span className="text-sm">Нет уведомлений</span>
                                                {(filter !== 'all' || search) && (
                                                    <button
                                                        onClick={() => {
                                                            setFilter('all');
                                                            setSearch('');
                                                        }}
                                                        className="text-xs text-blue-600 hover:underline"
                                                    >
                                                        Сбросить фильтры
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((n, index) => {
                                        const isUnread = !n.is_read;
                                        const isExpanded = expandedId === n.id;
                                        const isMarking = markingId === n.id;

                                        return (
                                            <FragmentRow
                                                key={n.id}
                                                n={n}
                                                index={index}
                                                isUnread={isUnread}
                                                isExpanded={isExpanded}
                                                isMarking={isMarking}
                                                onToggle={() =>
                                                    setExpandedId(isExpanded ? null : n.id)
                                                }
                                                onRead={() => handleRead(n.id)}
                                            />
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

function FragmentRow({
    n,
    index,
    isUnread,
    isExpanded,
    isMarking,
    onToggle,
    onRead,
}: {
    n: {
        id: number;
        title: string;
        message?: string;
        is_read: boolean;
        created_at: string;
    };
    index: number;
    isUnread: boolean;
    isExpanded: boolean;
    isMarking: boolean;
    onToggle: () => void;
    onRead: () => void;
}) {
    return (
        <>
            <tr
                onClick={onToggle}
                className={`border-b border-gray-50 cursor-pointer transition-colors group ${
                    isUnread
                        ? 'bg-blue-50/30 hover:bg-blue-50/60'
                        : index % 2 === 0
                          ? 'bg-white hover:bg-gray-50'
                          : 'bg-gray-50/40 hover:bg-gray-100/60'
                }`}
            >
                <td className="py-2.5 pl-4 pr-1">
                    <div
                        className={`w-1.5 h-1.5 rounded-full mx-auto transition-opacity ${
                            isUnread ? 'bg-blue-500 opacity-100' : 'opacity-0'
                        }`}
                    />
                </td>

                <td className="px-3 py-2.5">
                    <span
                        className={`text-xs leading-snug max-w-[180px] truncate block ${
                            isUnread ? 'font-semibold text-gray-900' : 'font-medium text-gray-600'
                        }`}
                    >
                        {n.title}
                    </span>
                </td>

                <td className="px-3 py-2.5 text-center">
                    <div className="flex items-center justify-center gap-1 text-[11px] text-gray-600 whitespace-nowrap">
                        <Clock className="flex-shrink-0 w-3 h-3" />
                        {formatDate(n.created_at)}
                    </div>
                </td>

                <td className="px-3 py-2.5 text-center">
                    <span
                        className={`inline-block px-2 py-0.5 rounded border text-[10px] font-semibold whitespace-nowrap ${
                            isUnread
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-gray-100 text-gray-500 border-gray-200'
                        }`}
                    >
                        {isUnread ? '● Новое' : '✓ Прочитано'}
                    </span>
                </td>

                <td className="px-3 py-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1">
                        {isUnread && (
                            <button
                                onClick={onRead}
                                disabled={isMarking}
                                className="flex items-center justify-center w-6 h-6 text-blue-600 transition rounded hover:bg-blue-100 disabled:opacity-50"
                            >
                                <StyledTooltip title="Отметить как прочитанное">
                                    {isMarking ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                        <Eye className="w-3.5 h-3.5" />
                                    )}
                                </StyledTooltip>
                            </button>
                        )}

                        <button
                            onClick={onToggle}
                            title="Подробнее"
                            className={`flex items-center justify-center w-6 h-6 rounded hover:bg-gray-100 text-gray-400 transition ${
                                isExpanded ? 'rotate-180' : ''
                            }`}
                        >
                            <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </td>
            </tr>

            {isExpanded && (
                <tr
                    className={`border-b border-gray-100 ${
                        isUnread ? 'bg-blue-50/20' : 'bg-gray-50/60'
                    }`}
                >
                    <td colSpan={6} className="px-8 py-3">
                        <div className="flex items-start gap-3">
                            <div
                                className={`flex items-center justify-center w-7 h-7 rounded-full flex-shrink-0 mt-0.5 border ${
                                    isUnread
                                        ? 'bg-blue-100 text-blue-600 border-blue-200'
                                        : 'bg-gray-100 text-gray-500 border-gray-200'
                                }`}
                            >
                                <Bell className="w-3.5 h-3.5" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-[11px] leading-relaxed text-gray-600">
                                    {n.message || 'Сообщение отсутствует'}
                                </p>
                            </div>

                            {/* {isUnread && (
                                <button
                                    onClick={onRead}
                                    disabled={isMarking}
                                    className="flex items-center gap-1 px-2.5 py-1 rounded border border-blue-200 bg-blue-50 text-blue-700 text-[11px] font-medium hover:bg-blue-100 transition flex-shrink-0 disabled:opacity-50"
                                >
                                    {isMarking ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                        <Eye className="w-3 h-3" />
                                    )}
                                    Прочитано
                                </button>
                            )} */}
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}
