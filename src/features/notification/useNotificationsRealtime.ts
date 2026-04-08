import { useEffect, useContext } from 'react';
import { SocketContext } from './socketContext';
import { useAppDispatch } from '@/app/store';
import { addNotification, fetchUnreadCount } from './notificationSlice';

type NotificationEvent = {
    notification: {
        id: number;
        title: string;
        message?: string;
        is_read: boolean;
        created_at: string;
    };
};

export const useNotificationsRealtime = () => {
    const ctx = useContext(SocketContext);
    const dispatch = useAppDispatch();

    const socket = ctx?.socket;

    useEffect(() => {
        if (!socket) return;

        const handleNew = (data: NotificationEvent) => {
            if (data?.notification) {
                dispatch(addNotification(data.notification));
            }

            setTimeout(() => {
                dispatch(fetchUnreadCount());
            }, 300);
        };

        socket.on('notifications:new', handleNew);

        return () => {
            socket.off('notifications:new', handleNew);
        };
    }, [socket, dispatch]);
};
