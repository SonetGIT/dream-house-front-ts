import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { io } from 'socket.io-client';
import { useAppSelector } from '@/app/store';
import { SocketContext } from './socketContext';

export default function SocketProvider({ children }: { children: ReactNode }) {
    const { token, user, isAuthChecked } = useAppSelector((state) => state.auth);
    const userId = user?.id;
    const canConnect = Boolean(token && userId && isAuthChecked);
    const [connected, setConnected] = useState(false);
    const [socket] = useState(() => {
        // REST uses /api; Socket.IO uses the server origin, not the /api namespace.
        const serverUrl = import.meta.env.VITE_SOCKET_URL ||
            new URL(import.meta.env.VITE_BASE_URL || '/', window.location.origin).origin;

        return io(serverUrl, {
            path: import.meta.env.VITE_SOCKET_PATH || '/socket.io',
            autoConnect: false,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 10000,
        });
    });

    useEffect(() => {
        if (!canConnect || !token) return;

        socket.auth = { token };
        // Polling handshake also supports backends that read the Bearer header.
        socket.io.opts.extraHeaders = { Authorization: `Bearer ${token}` };

        const handleConnect = () => setConnected(true);
        const handleDisconnect = () => setConnected(false);
        const handleError = (error: Error) => {
            setConnected(false);
            console.warn('[Socket.IO] Ошибка подключения:', error.message);
        };

        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);
        socket.on('connect_error', handleError);
        socket.connect();

        return () => {
            socket.disconnect();
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
            socket.off('connect_error', handleError);
            socket.auth = {};
            socket.io.opts.extraHeaders = {};
        };
    }, [canConnect, token, userId, socket]);

    const value = useMemo(() => ({
        socket: canConnect ? socket : null,
        connected: canConnect && connected,
    }), [canConnect, connected, socket]);

    return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}
