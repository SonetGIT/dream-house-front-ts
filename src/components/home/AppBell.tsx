import { useNotifications } from '@/features/notification/useNotifications';
import { useNotificationsRealtime } from '@/features/notification/useNotificationsRealtime';
import { Bell } from 'lucide-react';
import type { MouseEvent } from 'react';

interface AppBellProps {
    onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
}

export default function AppBell({ onClick }: AppBellProps) {
    const { unreadCount } = useNotifications();

    useNotificationsRealtime();

    return (
        <button
            onClick={onClick}
            className="relative mr-6 text-gray-700 transition cursor-pointer hover:text-red-600"
        >
            <Bell size={20} />

            {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] leading-none rounded-full px-1.5 py-[1px] min-w-[16px] text-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                </span>
            )}
        </button>
    );
}
