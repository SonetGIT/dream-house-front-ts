import { createContext } from 'react';
import { Socket } from 'socket.io-client';

type SocketContextType = {
    socket: Socket | null;
    connected: boolean;
};

export const SocketContext = createContext<SocketContextType>({
    socket: null,
    connected: false,
});
