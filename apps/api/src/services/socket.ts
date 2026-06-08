import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { Client, Account, Query } from 'node-appwrite';
import { databases } from './appwrite';
const databaseId = process.env.APPWRITE_DATABASE_ID || 'multicompany';
import { ID } from 'node-appwrite';

let io: SocketIOServer | null = null;

// Track online users: Map<userId, Set<socketId>>
const onlineUsers = new Map<string, Set<string>>();

async function canAccessChatRoom(roomId: string, userId: string) {
  try {
    const room = await databases.getDocument(databaseId, 'chat_rooms', roomId);
    return Array.isArray((room as any).participants) && (room as any).participants.includes(userId);
  } catch {
    return false;
  }
}

async function canCallUser(senderId: string, receiverId: string): Promise<boolean> {
  const participants = [senderId, receiverId].sort();
  const roomId = `direct_${participants[0]}_${participants[1]}`;
  try {
    const room = await databases.getDocument(databaseId, 'chat_rooms', roomId);
    const roomParticipants = (room as any).participants;
    return Array.isArray(roomParticipants) && 
           roomParticipants.includes(senderId) && 
           roomParticipants.includes(receiverId);
  } catch {
    return false;
  }
}

export function initSocketServer(server: HttpServer) {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Middleware for Authentication
  io.use(async (socket: Socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }
    try {
      const client = new Client()
        .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1')
        .setProject(process.env.APPWRITE_PROJECT_ID || '')
        .setJWT(token);
      
      const account = new Account(client);
      const user = await account.get();
      socket.data.userId = user.$id;
      socket.data.name = user.name;
      next();
    } catch (err) {
      console.error('[Socket Auth Error]', err);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    console.log(`[Socket] Client connected: ${socket.id} (User: ${userId})`);

    // Track online status
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
      // Broadcast user online status
      socket.broadcast.emit('user_online', { userId });
    }
    onlineUsers.get(userId)?.add(socket.id);

    // Join community feed channel
    socket.on('join_community', () => {
      socket.join('community_feed');
    });

    // Chat: Join Room
    socket.on('join_chat', async (roomId: string) => {
      if (!(await canAccessChatRoom(roomId, userId))) {
        socket.emit('error', { message: 'Access denied for this chat room.' });
        return;
      }
      socket.join(roomId);
      console.log(`[Socket] User ${userId} joined room ${roomId}`);
    });

    // Chat: Leave Room
    socket.on('leave_chat', (roomId: string) => {
      socket.leave(roomId);
    });

    // Chat: Typing Indicators
    socket.on('typing', ({ roomId }) => {
      socket.to(roomId).emit('user_typing', { userId, roomId });
    });
    socket.on('stop_typing', ({ roomId }) => {
      socket.to(roomId).emit('user_stopped_typing', { userId, roomId });
    });

    // Chat: Send Message
    socket.on('send_message', async (data) => {
      // data: { roomId, type, content, fileId? }
      try {
        if (!data?.roomId || !(await canAccessChatRoom(data.roomId, userId))) {
          socket.emit('error', { message: 'Access denied for this chat room.' });
          return;
        }

        const message = await databases.createDocument(
          databaseId,
          'chat_messages',
          ID.unique(),
          {
            roomId: data.roomId,
            senderId: userId,
            type: data.type || 'text',
            content: data.content || '',
            fileId: data.fileId || null,
            readBy: [userId]
          }
        );

        // Update chat room last message
        await databases.updateDocument(
          databaseId,
          'chat_rooms',
          data.roomId,
          {
            lastMessageId: message.$id,
            lastMessageText: data.type === 'audio' ? '🎤 Voice message' : data.content.substring(0, 50),
            lastMessageTime: new Date().toISOString()
          }
        );

        // Broadcast to the room
        io?.to(data.roomId).emit('receive_message', message);
      } catch (err) {
        console.error('[Socket] Error saving message:', err);
      }
    });

    // Chat: Mark Messages as Read
    socket.on('read_messages', async ({ roomId, messageIds }) => {
       socket.to(roomId).emit('messages_read', { roomId, userId, messageIds });
    });

    // WebRTC: Call User
    socket.on('call_user', async (data) => {
      // data: { userToCall, signalData, from, name }
      const callerId = userId;
      if (!data?.userToCall) return;

      // Validate permission
      const authorized = await canCallUser(callerId, data.userToCall);
      if (!authorized) {
        socket.emit('error', { message: 'Unauthorized to call this user.' });
        return;
      }

      const targetSockets = onlineUsers.get(data.userToCall);
      if (targetSockets) {
        targetSockets.forEach(id => {
          io?.to(id).emit('incoming_call', {
            signal: data.signalData,
            from: callerId,
            name: data.name
          });
        });
      }
    });

    // WebRTC: Ringing User
    socket.on('ringing_user', (data) => {
      // data: { to }
      if (!data?.to) return;
      const targetSockets = onlineUsers.get(data.to);
      if (targetSockets) {
        targetSockets.forEach(id => {
          io?.to(id).emit('call_ringing', {
            from: userId
          });
        });
      }
    });

    // WebRTC: Answer Call
    socket.on('answer_call', async (data) => {
      // data: { to, signal }
      if (!data?.to) return;

      // Validate permission
      const authorized = await canCallUser(userId, data.to);
      if (!authorized) return;

      const targetSockets = onlineUsers.get(data.to);
      if (targetSockets) {
        targetSockets.forEach(id => {
          io?.to(id).emit('call_accepted', {
            from: userId,
            signal: data.signal
          });
        });
      }
    });

    // WebRTC: Decline Call
    socket.on('decline_call', (data) => {
      // data: { to }
      if (!data?.to) return;
      const targetSockets = onlineUsers.get(data.to);
      if (targetSockets) {
        targetSockets.forEach(id => {
          io?.to(id).emit('call_declined', {
            from: userId
          });
        });
      }
    });

    // WebRTC: End Call
    socket.on('end_call', (data) => {
      // data: { to }
      if (!data?.to) return;
      const targetSockets = onlineUsers.get(data.to);
      if (targetSockets) {
        targetSockets.forEach(id => {
          io?.to(id).emit('call_ended', {
            from: userId
          });
        });
      }
    });

    // WebRTC: Call Busy
    socket.on('call_busy', (data) => {
      // data: { to }
      if (!data?.to) return;
      const targetSockets = onlineUsers.get(data.to);
      if (targetSockets) {
        targetSockets.forEach(id => {
          io?.to(id).emit('call_busy_response', {
            from: userId
          });
        });
      }
    });

    // WebRTC: Mute State Change
    socket.on('mute_state', (data) => {
      // data: { to, isMuted }
      if (!data?.to) return;
      const targetSockets = onlineUsers.get(data.to);
      if (targetSockets) {
        targetSockets.forEach(id => {
          io?.to(id).emit('peer_mute_state', {
            from: userId,
            isMuted: !!data.isMuted
          });
        });
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id} (User: ${userId})`);
      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
          socket.broadcast.emit('user_offline', { userId });
        }
      }
    });
  });

  return io;
}

export function getIO() {
  return io;
}

export function getOnlineUsers() {
  return Array.from(onlineUsers.keys());
}
