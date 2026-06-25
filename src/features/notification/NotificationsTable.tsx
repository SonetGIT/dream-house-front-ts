import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/store';
import {
    Bell,
    BellOff,
    ChevronDown,
    Clock,
    ExternalLink,
    Eye,
    Loader2,
} from 'lucide-react';
import { StyledTooltip } from '@/components/ui/StyledTooltip';
import { formatDate } from '@/utils/formatData';
import { resolveNotificationRoute } from './notificationRouting';
import { fetchNotifications, markAsRead, type Notification } from './notificationSlice';

type FilterType = 'all' | 'unread' | 'read';

interface NotificationsTableProps {
    onNavigate?: () => void;
}

export default function NotificationsTable({ onNavigate }: NotificationsTableProps) {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { items, loading } = useAppSelector((state) => state.notifications);

    const [filter, setFilter] = useState<FilterType>('all');
    const [search, setSearch] = useState('');
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [markingId, setMarkingId] = useState<number | null>(null);
    const [openingId, setOpeningId] = useState<number | null>(null);

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

    const handleOpen = async (notification: Notification) => {
        const path = resolveNotificationRoute(notification);
        if (!path) return;

        try {
            setOpeningId(notification.id);

            if (!notification.is_read) {
                await dispatch(markAsRead(notification.id)).unwrap();
            }

            onNavigate?.();
            navigate(path);
        } finally {
            setOpeningId(null);
        }
    };

    const filtered = useMemo(() => {
        return items.filter((notification) => {
            if (filter === 'unread' && notification.is_read) return false;
            if (filter === 'read' && !notification.is_read) return false;

            if (search.trim()) {
                const q = search.toLowerCase();
                return (
                    notification.title.toLowerCase().includes(q) ||
                    (notification.message || '').toLowerCase().includes(q)
                );
            }

            return true;
        });
    }, [items, filter, search]);

    return (
        <div className="bg-gray-50 p-1">
            <div className="space-y-3">
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-semibold text-gray-800">Уведомления</span>
                            <span className="rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                                {filtered.length}
                            </span>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <div className="flex items-left gap-1 rounded-lg bg-gray-100 p-1">
                                <button
                                    onClick={() => setFilter('all')}
                                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                                        filter === 'all'
                                            ? 'bg-white text-blue-700 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    Все
                                </button>
                                <button
                                    onClick={() => setFilter('unread')}
                                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                                        filter === 'unread'
                                            ? 'bg-white text-blue-700 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    Непрочитанные
                                </button>
                                <button
                                    onClick={() => setFilter('read')}
                                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
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
                        <table className="w-full min-w-[720px]">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="w-8 px-4 py-2 text-left text-[10px] font-bold uppercase tracking-widest text-blue-700"></th>
                                    <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-widest text-blue-700">
                                        Заголовок
                                    </th>
                                    <th className="w-36 px-3 py-2 text-center text-[10px] font-bold uppercase tracking-widest text-blue-700">
                                        Время
                                    </th>
                                    <th className="w-28 px-3 py-2 text-center text-[10px] font-bold uppercase tracking-widest text-blue-700">
                                        Статус
                                    </th>
                                    <th className="w-24 px-3 py-2 text-center text-[10px] font-bold uppercase tracking-widest text-blue-700"></th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center">
                                            <div className="flex flex-col items-center gap-2 text-gray-400">
                                                <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
                                                <span className="text-xs">Загрузка уведомлений...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center">
                                            <div className="flex flex-col items-center gap-2 text-gray-400">
                                                <BellOff className="h-8 w-8 text-gray-300" />
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
                                    filtered.map((notification, index) => {
                                        const isUnread = !notification.is_read;
                                        const isExpanded = expandedId === notification.id;
                                        const isMarking = markingId === notification.id;
                                        const isOpening = openingId === notification.id;
                                        const canOpen = Boolean(
                                            resolveNotificationRoute(notification),
                                        );

                                        return (
                                            <FragmentRow
                                                key={notification.id}
                                                notification={notification}
                                                index={index}
                                                isUnread={isUnread}
                                                isExpanded={isExpanded}
                                                isMarking={isMarking}
                                                isOpening={isOpening}
                                                canOpen={canOpen}
                                                onToggle={() =>
                                                    setExpandedId(
                                                        isExpanded ? null : notification.id,
                                                    )
                                                }
                                                onRead={() => handleRead(notification.id)}
                                                onOpen={() => handleOpen(notification)}
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
    notification,
    index,
    isUnread,
    isExpanded,
    isMarking,
    isOpening,
    canOpen,
    onToggle,
    onRead,
    onOpen,
}: {
    notification: Notification;
    index: number;
    isUnread: boolean;
    isExpanded: boolean;
    isMarking: boolean;
    isOpening: boolean;
    canOpen: boolean;
    onToggle: () => void;
    onRead: () => void;
    onOpen: () => void;
}) {
    const handleRowClick = () => {
        if (canOpen) {
            onOpen();
            return;
        }

        onToggle();
    };

    return (
        <>
            <tr
                onClick={handleRowClick}
                className={`group cursor-pointer border-b border-gray-50 transition-colors ${
                    isUnread
                        ? 'bg-blue-50/30 hover:bg-blue-50/60'
                        : index % 2 === 0
                          ? 'bg-white hover:bg-gray-50'
                          : 'bg-gray-50/40 hover:bg-gray-100/60'
                }`}
            >
                <td className="py-2.5 pl-4 pr-1">
                    <div
                        className={`mx-auto h-1.5 w-1.5 rounded-full transition-opacity ${
                            isUnread ? 'bg-blue-500 opacity-100' : 'opacity-0'
                        }`}
                    />
                </td>

                <td className="px-3 py-2.5">
                    <span
                        className={`block max-w-[220px] truncate text-xs leading-snug ${
                            isUnread ? 'font-semibold text-gray-900' : 'font-medium text-gray-600'
                        }`}
                    >
                        {notification.title}
                    </span>
                </td>

                <td className="px-3 py-2.5 text-center">
                    <div className="flex items-center justify-center gap-1 whitespace-nowrap text-[11px] text-gray-600">
                        <Clock className="h-3 w-3 flex-shrink-0" />
                        {formatDate(notification.created_at)}
                    </div>
                </td>

                <td className="px-3 py-2.5 text-center">
                    <span
                        className={`inline-block rounded border px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap ${
                            isUnread
                                ? 'border-blue-600 bg-blue-600 text-white'
                                : 'border-gray-200 bg-gray-100 text-gray-500'
                        }`}
                    >
                        {isUnread ? '● Новое' : '✓ Прочитано'}
                    </span>
                </td>

                <td className="px-3 py-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1">
                        {canOpen && (
                            <button
                                onClick={onOpen}
                                disabled={isOpening}
                                className="flex h-6 w-6 items-center justify-center rounded text-emerald-600 transition hover:bg-emerald-100 disabled:opacity-50"
                            >
                                <StyledTooltip title="Открыть">
                                    {isOpening ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                        <ExternalLink className="h-3.5 w-3.5" />
                                    )}
                                </StyledTooltip>
                            </button>
                        )}

                        {isUnread && (
                            <button
                                onClick={onRead}
                                disabled={isMarking}
                                className="flex h-6 w-6 items-center justify-center rounded text-blue-600 transition hover:bg-blue-100 disabled:opacity-50"
                            >
                                <StyledTooltip title="Отметить как прочитанное">
                                    {isMarking ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                        <Eye className="h-3.5 w-3.5" />
                                    )}
                                </StyledTooltip>
                            </button>
                        )}

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggle();
                            }}
                            title="Подробнее"
                            className={`flex h-6 w-6 items-center justify-center rounded text-gray-400 transition hover:bg-gray-100 ${
                                isExpanded ? 'rotate-180' : ''
                            }`}
                        >
                            <ChevronDown className="h-3.5 w-3.5" />
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
                                className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border ${
                                    isUnread
                                        ? 'border-blue-200 bg-blue-100 text-blue-600'
                                        : 'border-gray-200 bg-gray-100 text-gray-500'
                                }`}
                            >
                                <Bell className="h-3.5 w-3.5" />
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="text-[11px] leading-relaxed text-gray-600">
                                    {notification.message || 'Сообщение отсутствует'}
                                </p>
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}
