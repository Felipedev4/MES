/**
 * Contexto de WebSocket
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { socketService } from '../services/socketService';
import { useAuth } from './AuthContext';

interface SocketContextData {
  isConnected: boolean;
  emit: (event: string, data?: any) => void;
  on: (event: string, callback: (...args: any[]) => void) => void;
  off: (event: string, callback?: (...args: any[]) => void) => void;
}

const SocketContext = createContext<SocketContextData>({} as SocketContextData);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket deve ser usado dentro de SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const socket = socketService.connect();

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    return () => {
      socketService.disconnect();
      setIsConnected(false);
    };
  }, [isAuthenticated]);

  return (
    <SocketContext.Provider
      value={{
        isConnected,
        emit: socketService.emit.bind(socketService),
        on: socketService.on.bind(socketService),
        off: socketService.off.bind(socketService),
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};


