import { useNotifications } from '@/features/notification/useNotifications';
import { useNotificationsRealtime } from '@/features/notification/useNotificationsRealtime';
import { Bell } from 'lucide-react';
import type { MouseEvent } from 'react';
import { StyledTooltip } from '../ui/StyledTooltip';

interface AppBellProps {
    onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
}

export default function AppBell({ onClick }: AppBellProps) {
    const { unreadCount } = useNotifications();

    useNotificationsRealtime();

    return (
        <StyledTooltip title="Уведомления по задачам">
            <button
                type="button"
                onClick={onClick}
                aria-label="Уведомления по задачам"
                className={`group relative inline-flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
                    unreadCount > 0
                        ? 'border-white/45 bg-white/30 text-[#1f4f95] shadow-sm'
                        : 'border-white/35 bg-white/20 text-white shadow-sm'
                } hover:bg-white/40 hover:text-[#1f4f95] hover:border-white/60`}
            >
                <Bell
                    size={18}
                    className="transition-transform duration-200 group-hover:scale-110"
                />

                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] rounded-full bg-red-500 px-1.5 py-[1px] text-center text-[10px] leading-none text-white shadow-sm">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>
        </StyledTooltip>
    );
}
