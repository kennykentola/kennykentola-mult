import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../features/auth/AuthContext';
import { getSessionJwt } from '../lib/sessionJwt';

export interface ChatMessage {
  $id: string;
  roomId: string;
  senderId: string;
  type: 'text' | 'audio' | 'image';
  content: string;
  fileId?: string;
  readBy: string[];
  $createdAt: string;
}

export interface ChatRoom {
  $id: string;
  type: string;
  participants: string[];
  lastMessageId?: string;
  lastMessageText?: string;
  lastMessageTime?: string;
}

export function useSocket() {
  const { profile } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    let cancelled = false;

    const connectSocket = async () => {
      if (!profile) return;

      const token = await getSessionJwt();
      if (cancelled || socketRef.current) return;

      const newSocket = io(process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:5000', {
        auth: { token },
        reconnection: true,
      });

      newSocket.on('connect', () => {
        setConnected(true);
      });

      newSocket.on('disconnect', () => {
        setConnected(false);
      });

      newSocket.on('user_online', ({ userId }) => {
        setOnlineUsers((prev) => Array.from(new Set([...prev, userId])));
      });

      newSocket.on('user_offline', ({ userId }) => {
        setOnlineUsers((prev) => prev.filter(id => id !== userId));
      });

      socketRef.current = newSocket;
      setSocket(newSocket);
    };

    connectSocket();

    return () => {
      cancelled = true;
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
    };
  }, [profile]);

  const joinChat = (roomId: string) => {
    socketRef.current?.emit('join_chat', roomId);
  };

  const leaveChat = (roomId: string) => {
    socketRef.current?.emit('leave_chat', roomId);
  };

  const sendMessage = (roomId: string, content: string, type: string = 'text', fileId?: string) => {
    socketRef.current?.emit('send_message', { roomId, content, type, fileId });
  };

  const sendTyping = (roomId: string) => {
    socketRef.current?.emit('typing', { roomId });
  };

  const sendStopTyping = (roomId: string) => {
    socketRef.current?.emit('stop_typing', { roomId });
  };

  return {
    socket,
    connected,
    onlineUsers,
    joinChat,
    leaveChat,
    sendMessage,
    sendTyping,
    sendStopTyping
  };
}
