import { useAppDispatch, useAppSelector } from '@/app/store';
import { useEffect } from 'react';
import { fetchUnreadCount } from './notificationSlice';

export const useNotifications = () => {
    const dispatch = useAppDispatch();
    const unreadCount = useAppSelector((s) => s.notifications.unreadCount);
    useEffect(() => {
        dispatch(fetchUnreadCount());
    }, [dispatch]);

    return {
        unreadCount,
    };
};
