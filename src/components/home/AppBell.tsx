import { useNotifications } from '@/features/notification/useNotifications';
import { useNotificationsRealtime } from '@/features/notification/useNotificationsRealtime';
import { Bell } from 'lucide-react';

export default function AppBell() {
    const { unreadCount } = useNotifications();
    useNotificationsRealtime();
    return (
        <div className="relative mr-6 text-red-600">
            <Bell />

            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5">
                {unreadCount}
            </span>
        </div>
    );
}
