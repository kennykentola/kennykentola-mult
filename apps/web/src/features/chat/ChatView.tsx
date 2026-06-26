'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from '@/features/auth/AuthContext';
import { getSessionJwt } from '@/lib/sessionJwt';
import { Search, Send, User, Phone, Video, MoreVertical, Loader2, Users } from 'lucide-react';
import toast from 'react-hot-toast';

interface ChatRoom {
  $id: string;
  type: string;
  participants: string[];
  lastMessageText?: string;
  lastMessageTime?: string;
}

interface ChatMessage {
  $id: string;
  roomId: string;
  senderId: string;
  content: string;
  $createdAt: string;
}

interface UserProfile {
  userId: string;
  firstName: string;
  lastName: string;
  role?: string;
  purpose?: string;
  email?: string;
  phoneNumber?: string;
  location?: string;
}

export function ChatView() {
  const { socket, isConnected, onlineUsers } = useSocket();
  const { user } = useAuth();
  
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingRooms, setLoadingRooms] = useState(true);

  // Community State
  const [isCommunityMember, setIsCommunityMember] = useState(false);
  const [communityMembers, setCommunityMembers] = useState<UserProfile[]>([]);
  const [showCommunityInfo, setShowCommunityInfo] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

  // 1. Fetch Rooms & Community Status
  const fetchInitialData = async () => {
    try {
      const token = await getSessionJwt();
      
      // Fetch Rooms
      const res = await fetch(`${apiBase}/chat/rooms`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRooms(data.rooms);
      }

      // Check community status (by fetching community members and seeing if we are in it, or via user prefs)
      // Since user.prefs may not be immediately synced, we fetch the members list.
      const memRes = await fetch(`${apiBase}/chat/community/members`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (memRes.ok) {
        const data = await memRes.json();
        setCommunityMembers(data.members);
        if (data.members.find((m: any) => m.userId === user?.id)) {
          setIsCommunityMember(true);
        }
      }

    } catch (err) {
      console.error('Failed to fetch chat data', err);
    } finally {
      setLoadingRooms(false);
    }
  };

  // 2. Fetch Users (for starting new direct chats)
  const fetchUsers = async (q: string = '') => {
    try {
      const token = await getSessionJwt();
      const res = await fetch(`${apiBase}/chat/users/search?q=${q}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      }
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
  };

  // 3. Fetch History
  const fetchHistory = async (roomId: string) => {
    try {
      const token = await getSessionJwt();
      const res = await fetch(`${apiBase}/chat/history/${roomId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    } catch (err) {
      console.error('Failed to fetch history', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchInitialData();
      fetchUsers();
    }
  }, [user]);

  // Handle Socket Events
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (msg: ChatMessage) => {
      if (msg.roomId === activeRoomId) {
        setMessages(prev => [...prev, msg]);
      }
      
      if (msg.roomId !== 'community_global') {
        // Update direct room last message
        setRooms(prev => prev.map(r => {
          if (r.$id === msg.roomId) {
            return { ...r, lastMessageText: msg.content, lastMessageTime: msg.$createdAt };
          }
          return r;
        }));
      }
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [socket, activeRoomId]);

  // Join room when active room changes
  useEffect(() => {
    if (socket && activeRoomId) {
      socket.emit('join_chat', activeRoomId);
      if (activeRoomId === 'community_global' && !isCommunityMember) {
        // Don't fetch history if not a member yet
      } else {
        fetchHistory(activeRoomId);
      }
    }
    setShowCommunityInfo(false);
  }, [socket, activeRoomId, isCommunityMember]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startChatWithUser = async (targetUserId: string) => {
    if (targetUserId === user?.id) return;
    try {
      const token = await getSessionJwt();
      const res = await fetch(`${apiBase}/chat/rooms`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ targetUserId })
      });
      if (res.ok) {
        const data = await res.json();
        if (!rooms.find(r => r.$id === data.room.$id)) {
          setRooms([data.room, ...rooms]);
        }
        setActiveRoomId(data.room.$id);
        setSearchQuery('');
      }
    } catch (err) {
      toast.error('Failed to start chat');
    }
  };

  const joinCommunity = async () => {
    try {
      const token = await getSessionJwt();
      const res = await fetch(`${apiBase}/chat/community/join`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setIsCommunityMember(true);
        toast.success("Joined Community Group!");
        // Refresh members
        fetchInitialData();
      }
    } catch (err) {
      toast.error("Failed to join community");
    }
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeRoomId || !socket) return;

    socket.emit('send_message', {
      roomId: activeRoomId,
      type: 'text',
      content: inputMessage.trim(),
    });

    setInputMessage('');
  };

  // Helper to find user details for messages
  const getSenderName = (senderId: string) => {
    if (senderId === user?.id) return 'You';
    const cUser = communityMembers.find(m => m.userId === senderId);
    if (cUser) return `${cUser.firstName} ${cUser.lastName}`;
    const dUser = users.find(u => u.userId === senderId);
    if (dUser) return `${dUser.firstName} ${dUser.lastName}`;
    return 'Unknown User';
  };

  const getOtherParticipantId = () => {
    if (!activeRoomId || activeRoomId === 'community_global') return null;
    const room = rooms.find(r => r.$id === activeRoomId);
    if (!room) return null;
    return room.participants.find(p => p !== user?.id) || null;
  };

  const otherParticipantId = getOtherParticipantId();
  const directChatUser = otherParticipantId ? (communityMembers.find(m => m.userId === otherParticipantId) || users.find(u => u.userId === otherParticipantId)) : null;

  return (
    <div className="flex h-[calc(100vh-120px)] border border-white/5 rounded-2xl overflow-hidden bg-slate-900/40 backdrop-blur-md">
      {/* Sidebar */}
      <div className="w-80 border-r border-white/5 flex flex-col bg-slate-950/50">
        <div className="p-4 border-b border-white/5">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            Messages 
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`} title={isConnected ? 'Connected' : 'Disconnected'} />
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search users to chat..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                fetchUsers(e.target.value);
              }}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {searchQuery ? (
            <div className="p-2 space-y-1">
              <p className="text-xs font-bold text-slate-500 uppercase px-3 py-2">Users Found</p>
              {users.map(u => {
                const isOnline = onlineUsers.has(u.userId);
                return (
                  <button 
                    key={u.userId}
                    onClick={() => startChatWithUser(u.userId)}
                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-800/50 flex items-center gap-3 transition-colors"
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                        {u.firstName?.[0]}{u.lastName?.[0]}
                      </div>
                      <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-slate-950 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-slate-500'}`} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{u.firstName} {u.lastName}</p>
                      <p className="text-xs text-slate-400">Click to chat</p>
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {/* Community Group Card */}
              <button 
                onClick={() => setActiveRoomId('community_global')}
                className={`w-full text-left px-3 py-3 rounded-xl transition-colors flex items-center gap-3 mb-2 ${activeRoomId === 'community_global' ? 'bg-indigo-600/10 border border-indigo-500/20' : 'hover:bg-slate-800/50 border border-transparent'}`}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg">
                  <Users className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">Ecosystem Community</p>
                  <p className="text-xs text-slate-400 truncate">
                    {isCommunityMember ? `${communityMembers.length} members` : 'Click to join group'}
                  </p>
                </div>
              </button>

              <div className="px-3 py-2">
                <p className="text-xs font-bold text-slate-500 uppercase">Direct Messages</p>
              </div>

              {loadingRooms ? (
                <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-indigo-500" /></div>
              ) : rooms.length === 0 ? (
                <p className="text-center text-slate-500 text-sm p-4 mb-4">No active conversations</p>
              ) : (
                <div className="mb-4 space-y-1">
                  {rooms.map(room => {
                    const otherParticipantId = room.participants.find(p => p !== user?.id) || 'unknown';
                    const otherUser = users.find(u => u.userId === otherParticipantId) || communityMembers.find(m => m.userId === otherParticipantId);
                    const isActive = activeRoomId === room.$id;
                    const isOnline = onlineUsers.has(otherParticipantId);
                    
                    return (
                      <button 
                        key={room.$id}
                        onClick={() => setActiveRoomId(room.$id)}
                        className={`w-full text-left px-3 py-3 rounded-xl transition-colors flex items-center gap-3 ${isActive ? 'bg-indigo-600/10 border border-indigo-500/20' : 'hover:bg-slate-800/50 border border-transparent'}`}
                      >
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold">
                            {otherUser ? (otherUser.firstName === otherUser.userId ? 'U' : `${otherUser.firstName?.[0] || ''}${otherUser.lastName?.[0] || ''}`) : <User className="h-5 w-5" />}
                          </div>
                          <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-slate-950 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-slate-500'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate">
                            {otherUser 
                              ? (otherUser.firstName === otherUser.userId ? `User ${otherUser.userId.substring(0,6)}` : `${otherUser.firstName || ''} ${otherUser.lastName || ''}`.trim())
                              : `User ${otherParticipantId.substring(0,6)}`}
                          </p>
                          <p className="text-xs text-slate-400 truncate">{room.lastMessageText || 'No messages yet'}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Suggested Contacts */}
              <div className="px-3 py-2 mt-2">
                <p className="text-xs font-bold text-slate-500 uppercase">Suggested Contacts</p>
              </div>
              
              {users
                .filter(u => !rooms.some(r => r.participants.includes(u.userId)))
                .map(u => {
                  const isOnline = onlineUsers.has(u.userId);
                  return (
                    <button 
                      key={`suggested-${u.userId}`}
                      onClick={() => startChatWithUser(u.userId)}
                      className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-800/50 flex items-center gap-3 transition-colors"
                    >
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
                          {u.firstName === u.userId ? 'U' : `${u.firstName?.[0] || ''}${u.lastName?.[0] || ''}`}
                        </div>
                        <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-slate-950 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-slate-500'}`} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">
                          {u.firstName === u.userId ? `User ${u.userId.substring(0,6)}` : `${u.firstName || ''} ${u.lastName || ''}`.trim()}
                        </p>
                        <p className="text-xs text-slate-400 truncate">{u.role || 'Student'}</p>
                      </div>
                    </button>
                  )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      {activeRoomId === 'community_global' && !isCommunityMember ? (
        // Opt-In Screen
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-950/80 text-center p-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mb-6 shadow-xl shadow-indigo-500/20">
            <Users className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-4">Ecosystem Community</h2>
          <p className="text-slate-400 max-w-md mb-8">
            Join the global WhatsApp-style community to chat with other students, clients, and professionals. 
            By joining, your Name and Role will be visible to other members.
          </p>
          <button 
            onClick={joinCommunity}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)]"
          >
            Join Community Group
          </button>
        </div>
      ) : activeRoomId ? (
        <>
          <div className="flex-1 flex flex-col bg-slate-950/80">
            {/* Chat Header */}
            <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-slate-900/50">
              <div className="flex items-center gap-3">
                {activeRoomId === 'community_global' ? (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white">
                    <Users className="h-5 w-5" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                    <User className="h-5 w-5" />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-white">
                    {activeRoomId === 'community_global' ? 'Ecosystem Community' : (directChatUser ? `${directChatUser.firstName} ${directChatUser.lastName}` : 'Direct Chat')}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {activeRoomId === 'community_global' 
                      ? `${communityMembers.length} participants` 
                      : (directChatUser?.role ? directChatUser.role : 'Secure end-to-end connection')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowCommunityInfo(!showCommunityInfo)}
                  className={`p-2 rounded-lg transition-colors ${showCommunityInfo ? 'bg-indigo-500/20 text-indigo-400' : 'hover:bg-slate-800 text-slate-400'}`}
                  title={activeRoomId === 'community_global' ? "Group Info" : "User Profile"}
                >
                  {activeRoomId === 'community_global' ? <Users className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </button>
                <button title="Voice Call" className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"><Phone className="h-4 w-4" /></button>
                <button title="Video Call" className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"><Video className="h-4 w-4" /></button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg, idx) => {
                const isMine = msg.senderId === user?.id;
                const showAvatar = idx === messages.length - 1 || messages[idx + 1].senderId !== msg.senderId;
                const senderName = isMine ? 'You' : getSenderName(msg.senderId);

                return (
                  <div key={msg.$id || idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex max-w-[70%] gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                      {showAvatar ? (
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 flex-shrink-0 mt-auto">
                          {isMine ? 'U' : senderName[0]}
                        </div>
                      ) : (
                        <div className="w-8 flex-shrink-0" />
                      )}
                      <div>
                        {activeRoomId === 'community_global' && showAvatar && !isMine && (
                          <p className="text-xs text-slate-400 ml-1 mb-1">{senderName}</p>
                        )}
                        <div className={`px-4 py-2.5 rounded-2xl ${isMine ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-slate-800 text-slate-200 rounded-bl-sm'}`}>
                          <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                          <p className={`text-[10px] mt-1 text-right ${isMine ? 'text-indigo-200' : 'text-slate-500'}`}>
                            {new Date(msg.$createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/5 bg-slate-900/50">
              <form onSubmit={sendMessage} className="flex items-end gap-2">
                <textarea 
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none max-h-32 min-h-[44px]"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage(e as any);
                    }
                  }}
                />
                <button 
                  type="submit" 
                  title="Send Message"
                  disabled={!inputMessage.trim()}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white h-11 w-11 rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
                >
                  <Send className="h-5 w-5 ml-1" />
                </button>
              </form>
            </div>
          </div>

          {/* Group Info or Direct User Profile Sidebar */}
          {showCommunityInfo && (
            <div className="w-72 border-l border-white/5 bg-slate-950/50 flex flex-col">
              {activeRoomId === 'community_global' ? (
                <>
                  <div className="p-4 border-b border-white/5">
                    <h3 className="font-bold text-white">Group Info</h3>
                    <p className="text-xs text-slate-400">{communityMembers.length} Participants</p>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {communityMembers.map(member => {
                      const isMe = member.userId === user?.id;
                      const isOnline = onlineUsers.has(member.userId);
                      
                      return (
                        <div key={member.userId} className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-800/50 transition-colors group">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="relative flex-shrink-0">
                              <div className="w-10 h-10 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold">
                                {member.firstName?.[0]}{member.lastName?.[0]}
                              </div>
                              <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-slate-950 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-slate-500'}`} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-white truncate">
                                {member.firstName} {member.lastName} {isMe && '(You)'}
                              </p>
                              <p className="text-xs text-indigo-400 font-medium truncate">{member.role}</p>
                            </div>
                          </div>
                          
                          {!isMe && (
                            <button 
                              onClick={() => startChatWithUser(member.userId)}
                              className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full transition-all"
                              title="Message directly"
                            >
                              <Send className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </>
              ) : (
                <div className="flex flex-col h-full overflow-y-auto">
                  <div className="p-4 border-b border-white/5 flex flex-col items-center pt-8 pb-6">
                    <div className="w-24 h-24 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-3xl mb-4">
                      {directChatUser?.firstName?.[0]}{directChatUser?.lastName?.[0]}
                    </div>
                    <h3 className="font-bold text-white text-lg text-center">{directChatUser?.firstName} {directChatUser?.lastName}</h3>
                    <p className="text-sm text-indigo-400 font-medium mt-1 text-center">{directChatUser?.role}</p>
                    {directChatUser?.purpose && <p className="text-xs text-slate-500 mt-2 text-center px-4 leading-relaxed">{directChatUser.purpose}</p>}
                  </div>
                  <div className="p-6 space-y-5">
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Email Address</p>
                      <p className="text-sm text-slate-300 truncate" title={directChatUser?.email}>{directChatUser?.email || 'Private'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Phone Number</p>
                      <p className="text-sm text-slate-300">{directChatUser?.phoneNumber || 'Private'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Location</p>
                      <p className="text-sm text-slate-300">{directChatUser?.location || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-950/80 text-slate-500">
          <div className="w-20 h-20 rounded-full bg-slate-900/50 flex items-center justify-center mb-4">
            <Send className="h-8 w-8 text-slate-700" />
          </div>
          <h3 className="text-xl font-bold text-slate-400 mb-2">Your Messages</h3>
          <p className="text-sm max-w-sm text-center">Select a conversation from the sidebar or join the community to chat instantly.</p>
        </div>
      )}
    </div>
  );
}
