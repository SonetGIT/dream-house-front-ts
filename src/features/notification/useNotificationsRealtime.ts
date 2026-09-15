import { useEffect, useContext } from 'react';
import { SocketContext } from './socketContext';
import { useAppDispatch } from '@/app/store';
import {
    addNotification,
    fetchNotifications,
    fetchUnreadCount,
    type Notification,
} from './notificationSlice';

type NotificationEvent = {
    notification: Notification;
};

export const useNotificationsRealtime = () => {
    const ctx = useContext(SocketContext);
    const dispatch = useAppDispatch();

    const socket = ctx?.socket;

    useEffect(() => {
        if (!socket) return;

        let countTimeout: ReturnType<typeof setTimeout> | null = null;

        const syncNotifications = () => {
            // Also restore notifications missed while the connection was offline.
            dispatch(fetchUnreadCount());
            dispatch(fetchNotifications({ page: 1, size: 20 }));
        };

        const handleNew = (data: NotificationEvent) => {
            if (data?.notification) {
                dispatch(addNotification(data.notification));
            }

            if (countTimeout !== null) clearTimeout(countTimeout);
            countTimeout = setTimeout(() => {
                countTimeout = null;
                dispatch(fetchUnreadCount());
            }, 300);
        };

        socket.on('notifications:new', handleNew);
        socket.on('connect', syncNotifications);
        if (socket.connected) syncNotifications();

        return () => {
            socket.off('notifications:new', handleNew);
            socket.off('connect', syncNotifications);
            if (countTimeout !== null) clearTimeout(countTimeout);
        };
    }, [socket, dispatch]);
};
