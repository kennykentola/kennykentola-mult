'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/features/auth/AuthContext';
import { account } from '@/lib/appwrite';
import toast from 'react-hot-toast';

interface SocketContextType {
  socket: Socket | null;
  onlineUsers: Set<string>;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  onlineUsers: new Set(),
  isConnected: false,
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    let currentSocket: Socket | null = null;

    const connectSocket = async () => {
      try {
        const { jwt } = await account.createJWT();
        
        // Extract base URL from API URL
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
        const socketUrl = apiUrl.replace(/\/api\/v1$/, '');

        currentSocket = io(socketUrl, {
          auth: { token: jwt },
          transports: ['websocket', 'polling'],
          reconnection: true,
        });

        currentSocket.on('connect', () => {
          setIsConnected(true);
          console.log('[Socket] Connected');
        });

        currentSocket.on('disconnect', () => {
          setIsConnected(false);
          console.log('[Socket] Disconnected');
        });

        currentSocket.on('connect_error', (err) => {
          console.error('[Socket] Connection Error:', err.message);
          setIsConnected(false);
        });

        // Online status events
        currentSocket.on('user_online', ({ userId }: { userId: string }) => {
          setOnlineUsers(prev => {
            const next = new Set(prev);
            next.add(userId);
            return next;
          });
        });

        currentSocket.on('user_offline', ({ userId }: { userId: string }) => {
          setOnlineUsers(prev => {
            const next = new Set(prev);
            next.delete(userId);
            return next;
          });
        });

        setSocket(currentSocket);
      } catch (err) {
        console.error('[Socket] Failed to create JWT for connection:', err);
      }
    };

    connectSocket();

    return () => {
      if (currentSocket) {
        currentSocket.disconnect();
      }
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
