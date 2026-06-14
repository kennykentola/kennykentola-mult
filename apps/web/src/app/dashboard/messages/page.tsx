'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../features/auth/AuthContext';
import { useSocket, ChatRoom, ChatMessage } from '../../../hooks/useSocket';
import { useWebRTC } from '../../../hooks/useWebRTC';
import { getSessionJwt } from '../../../lib/sessionJwt';
import { 
  Search, Send, Phone, Mic, MicOff, 
  PhoneOff, Video, MoreVertical, Check, CheckCheck,
  User, MessageSquare, ShieldAlert
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export default function MessagesPage() {
  const { profile } = useAuth();
  const { socket, connected, onlineUsers, joinChat, leaveChat, sendMessage, sendTyping, sendStopTyping } = useSocket();
  const { 
    stream, receivingCall, caller, callerName, callAccepted, callEnded, 
    callState, peerMuted, localMuted, callDuration,
    myAudio, userAudio, callUser, answerCall, declineCall, leaveCall, toggleMute 
  } = useWebRTC(socket, profile?.$id || '', `${profile?.firstName} ${profile?.lastName}`);


  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch Rooms
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await fetch(`${API_BASE}/chat/rooms`, {
          headers: { Authorization: `Bearer ${await getSessionJwt()}` }
        });
        const data = await res.json();
        if (data.rooms) setRooms(data.rooms);
      } catch (err) {
        console.error('Failed to fetch rooms', err);
      }
    };
    if (profile) fetchRooms();
  }, [profile]);

  // Handle Socket Events
  useEffect(() => {
    if (!socket) return;

    socket.on('receive_message', (message: ChatMessage) => {
      if (activeRoom && message.roomId === activeRoom.$id) {
        setMessages((prev) => [...prev, message]);
        // Emit read receipt
        socket.emit('read_messages', { roomId: activeRoom.$id, messageIds: [message.$id] });
      }
      
      // Update sidebar latest message
      setRooms((prev) => prev.map(r => 
        r.$id === message.roomId 
          ? { ...r, lastMessageText: message.type === 'audio' ? '🎤 Voice message' : message.content, lastMessageTime: message.$createdAt } 
          : r
      ));
    });

    socket.on('user_typing', ({ userId, roomId }) => {
      if (activeRoom && roomId === activeRoom.$id) {
        setTypingUsers((prev) => new Set(prev).add(userId));
      }
    });

    socket.on('user_stopped_typing', ({ userId, roomId }) => {
      if (activeRoom && roomId === activeRoom.$id) {
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      }
    });

    return () => {
      socket.off('receive_message');
      socket.off('user_typing');
      socket.off('user_stopped_typing');
    };
  }, [socket, activeRoom]);

  // Fetch Messages when room changes
  useEffect(() => {
    if (!activeRoom) return;
    joinChat(activeRoom.$id);

    const fetchHistory = async () => {
      try {
        const res = await fetch(`${API_BASE}/chat/history/${activeRoom.$id}`, {
          headers: { Authorization: `Bearer ${await getSessionJwt()}` }
        });
        const data = await res.json();
        if (data.messages) setMessages(data.messages);
      } catch (err) {
        console.error('Failed to fetch history', err);
      }
    };
    fetchHistory();

    return () => leaveChat(activeRoom.$id);
  }, [activeRoom]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Search Users
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    
    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`${API_BASE}/chat/users/search?q=${encodeURIComponent(searchQuery)}`, {
          headers: { Authorization: `Bearer ${await getSessionJwt()}` }
        });
        const data = await res.json();
        setSearchResults(data.users || []);
      } catch (err) {
        console.error('Failed to search users', err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const startNewChat = async (targetUser: any) => {
    try {
      const res = await fetch(`${API_BASE}/chat/rooms`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await getSessionJwt()}` 
        },
        body: JSON.stringify({ targetUserId: targetUser.userId })
      });
      const data = await res.json();
      if (data.room) {
        setRooms(prev => {
          if (!prev.find(r => r.$id === data.room.$id)) {
            return [data.room, ...prev];
          }
          return prev;
        });
        setActiveRoom(data.room);
        setSearchQuery('');
      }
    } catch (err) {
      console.error('Failed to create/join room', err);
    }
  };

  const getOtherParticipant = (room: ChatRoom) => {
    return room.participants.find(id => id !== profile?.$id) || 'Unknown User';
  };

  const isUserOnline = (userId: string) => onlineUsers.includes(userId);

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeRoom) return;
    sendMessage(activeRoom.$id, newMessage, 'text');
    setNewMessage('');
    sendStopTyping(activeRoom.$id);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunks.current = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.current.push(e.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        // In a real app, upload audioBlob to Appwrite Storage here, then send fileId.
        // For demonstration, we'll send a mock text message indicating an audio file.
        sendMessage(activeRoom!.$id, 'Audio File', 'audio', 'mock-file-id');
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      mediaRecorder.current = recorder;
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone access denied', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (!activeRoom) return;
    if (e.target.value.length > 0) {
      sendTyping(activeRoom.$id);
    } else {
      sendStopTyping(activeRoom.$id);
    }
  };

  const startAudioCall = () => {
    if (!activeRoom) return;
    const otherUser = getOtherParticipant(activeRoom);
    callUser(otherUser);
  };

  // Call UI Overlays (Unified WhatsApp-style Call Overlay)
  if (callState !== 'idle') {
    // Format duration helper (e.g. 01:23)
    const formatDuration = (sec: number) => {
      const minutes = Math.floor(sec / 60);
      const seconds = sec % 60;
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    let statusText = 'Calling...';
    let subText = '';
    let isIncoming = false;

    if (callState === 'calling') {
      statusText = 'Calling...';
    } else if (callState === 'ringing') {
      if (receivingCall) {
        statusText = 'Incoming call';
        isIncoming = true;
      } else {
        statusText = 'Ringing...';
      }
    } else if (callState === 'connecting') {
      statusText = 'Connecting...';
    } else if (callState === 'connected') {
      statusText = formatDuration(callDuration);
      if (peerMuted) {
        subText = 'Muted';
      }
    } else if (callState === 'busy') {
      statusText = 'User is busy';
    } else if (callState === 'declined') {
      statusText = 'Call declined';
    } else if (callState === 'no-answer') {
      statusText = 'No answer';
    } else if (callState === 'call-ended') {
      statusText = 'Call ended';
    }

    const displayName = receivingCall ? callerName : (activeRoom ? getOtherParticipant(activeRoom) : 'Unknown');

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-2xl">
        {/* WhatsApp-style Call Panel Card */}
        <div className="w-[360px] flex flex-col items-center p-8 bg-slate-900/60 rounded-[3rem] shadow-2xl border border-white/10 relative overflow-hidden">
          {/* Subtle Ambient light behind avatar */}
          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/10 rounded-full blur-[60px] pointer-events-none"></div>

          {/* User Icon / Avatar */}
          <div className="relative mb-6">
            {callState === 'connected' && !peerMuted ? (
              <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping"></div>
            ) : (callState === 'calling' || callState === 'ringing') ? (
              <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-pulse"></div>
            ) : null}
            <div className="relative h-28 w-28 bg-slate-800 rounded-full border border-slate-700 flex items-center justify-center text-4xl font-bold text-emerald-400 shadow-inner">
              {displayName.substring(0, 2).toUpperCase()}
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white tracking-wide text-center truncate w-full mb-2">
            {displayName}
          </h2>

          <p className="text-sm font-medium text-slate-400 mb-2 flex items-center gap-1.5">
            {statusText}
          </p>
          
          {subText ? (
            <span className="text-xs px-2.5 py-0.5 bg-slate-800/80 rounded-full text-rose-400 font-medium mb-10 border border-rose-500/10 animate-pulse">
              {subText}
            </span>
          ) : (
            <div className="h-6 mb-10"></div>
          )}

          {/* Call Controls */}
          <div className="flex gap-6 items-center z-10">
            {/* Answer Button (Only for incoming ringing state) */}
            {isIncoming ? (
              <>
                <button
                  aria-label="Decline Call"
                  onClick={declineCall}
                  className="h-16 w-16 bg-rose-500 rounded-full flex items-center justify-center hover:bg-rose-600 transition-all active:scale-95 shadow-lg shadow-rose-500/30 text-white"
                >
                  <PhoneOff className="h-6 w-6" />
                </button>
                <button
                  aria-label="Answer Call"
                  onClick={answerCall}
                  className="h-16 w-16 bg-emerald-500 rounded-full flex items-center justify-center hover:bg-emerald-600 transition-all active:scale-95 shadow-lg shadow-emerald-500/30 text-white"
                >
                  <Phone className="h-6 w-6 fill-current" />
                </button>
              </>
            ) : (
              // Standard Call Buttons
              <>
                {/* Mute Button (Enabled in connecting/connected states) */}
                {(callState === 'connected' || callState === 'connecting') && (
                  <button
                    aria-label={localMuted ? "Unmute Microphone" : "Mute Microphone"}
                    onClick={toggleMute}
                    className={`h-14 w-14 rounded-full flex items-center justify-center transition-all active:scale-95 border ${
                      localMuted 
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/30 hover:bg-rose-500/35' 
                        : 'bg-slate-800 text-white border-white/5 hover:bg-slate-700'
                    }`}
                  >
                    {localMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  </button>
                )}

                {/* Hangup Button */}
                <button
                  aria-label="End Call"
                  onClick={leaveCall}
                  className="h-16 w-16 bg-rose-500 rounded-full flex items-center justify-center hover:bg-rose-600 transition-all active:scale-95 shadow-lg shadow-rose-500/30 text-white"
                >
                  <PhoneOff className="h-6 w-6" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="glass-panel border border-white/5 bg-slate-900/20 rounded-3xl overflow-hidden flex h-[calc(105vh-200px)] max-w-6xl mx-auto shadow-2xl">
      {/* Channels Sidebar List */}
      <aside className="w-[350px] border-r border-slate-900 bg-slate-950/40 flex flex-col">
        <div className="p-4 border-b border-slate-900 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white">Chats</h2>
          <div className={`h-2.5 w-2.5 rounded-full ${connected ? 'bg-emerald-500' : 'bg-rose-500'}`} title={connected ? 'Connected' : 'Disconnected'}></div>
        </div>
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or phone"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {searchQuery.trim().length > 0 ? (
            // Search Results
            isSearching ? (
              <p className="text-sm text-slate-500 p-3 text-center">Searching...</p>
            ) : searchResults.length === 0 ? (
              <p className="text-sm text-slate-500 p-3 text-center">No users found.</p>
            ) : (
              searchResults.map((user) => (
                <button
                  key={user.userId}
                  onClick={() => startNewChat(user)}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all border-l-2 border-transparent hover:bg-slate-900/60"
                >
                  <div className="relative h-12 w-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-lg text-emerald-400 shrink-0">
                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1 border-b border-white/5 pb-2">
                    <h4 className="text-sm font-bold text-white truncate">{user.firstName} {user.lastName}</h4>
                    <p className="text-xs text-slate-400 truncate">{user.role || 'Student'}</p>
                  </div>
                </button>
              ))
            )
          ) : (
            // Existing Rooms
            rooms.map((room) => {
              const otherUserId = getOtherParticipant(room);
              const isOnline = isUserOnline(otherUserId);
              const isActive = activeRoom?.$id === room.$id;

              return (
                <button
                  key={room.$id}
                  onClick={() => setActiveRoom(room)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all ${isActive
                      ? 'bg-indigo-650/10 bg-slate-800 border-l-2 border-indigo-500'
                      : 'border-l-2 border-transparent hover:bg-slate-900/60'
                    }`}
                >
                  <div className="relative h-12 w-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-lg text-indigo-400 shrink-0">
                    {otherUserId.substring(0, 2).toUpperCase()}
                    {isOnline && (
                      <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-slate-900"></span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 border-b border-white/5 pb-2">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="text-sm font-bold text-white truncate">{otherUserId}</h4>
                      {room.lastMessageTime && (
                        <span className="text-[10px] text-slate-500">
                          {new Date(room.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate">{room.lastMessageText || 'No messages yet'}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* Main Messaging Window */}
      {activeRoom ? (
        <section className="flex-1 flex flex-col bg-[#0b141a] relative">
          {/* Chat Background Pattern (WhatsApp style) */}
          <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://web.whatsapp.com/img/bg-chat-tile-dark_a4be512e7195b6b733d9110b408f075d.png')] bg-repeat"></div>
          
          {/* Chat Header */}
          <header className="h-[68px] border-b border-slate-800 px-6 flex items-center justify-between bg-slate-900/90 backdrop-blur-md z-10">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-indigo-400">
                {getOtherParticipant(activeRoom).substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-white leading-tight">{getOtherParticipant(activeRoom)}</h3>
                <span className="text-[11px] text-slate-400">
                  {typingUsers.size > 0 ? (
                    <span className="text-emerald-400 font-medium">typing...</span>
                  ) : isUserOnline(getOtherParticipant(activeRoom)) ? (
                    'online'
                  ) : (
                    'offline'
                  )}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <button className="p-2 hover:bg-slate-800 rounded-full transition-colors" title="Video Call">
                <Video className="h-5 w-5" />
              </button>
              <button onClick={startAudioCall} className="p-2 hover:bg-slate-800 rounded-full transition-colors" title="Audio Call">
                <Phone className="h-5 w-5" />
              </button>
              <button aria-label="More Options" className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>
          </header>

          {/* Message Bubble Container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-2 z-10 custom-scrollbar">
            {messages.map((m) => {
              const isMe = m.senderId === profile?.$id;
              return (
                <div key={m.$id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[65%] rounded-lg p-2 px-3 text-[14px] shadow-sm relative ${isMe
                      ? 'bg-[#005c4b] text-[#e9edef] rounded-tr-none'
                      : 'bg-[#202c33] text-[#e9edef] rounded-tl-none'
                    }`}>
                    {m.type === 'audio' ? (
                      <div className="flex items-center gap-3 w-48">
                        <button aria-label="Play Audio Note" className="h-8 w-8 bg-indigo-500 rounded-full flex flex-shrink-0 items-center justify-center">
                          <Mic className="h-4 w-4 text-white" />
                        </button>
                        <div className="h-1 bg-slate-600 rounded-full flex-1">
                          <div className="h-full bg-indigo-400 rounded-full w-1/3"></div>
                        </div>
                      </div>
                    ) : (
                      <p className="leading-relaxed whitespace-pre-wrap pr-12">{m.content}</p>
                    )}
                    
                    <div className="absolute bottom-1 right-2 flex items-center gap-1">
                      <span className="text-[10px] text-white/60">
                        {new Date(m.$createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {isMe && (
                        m.readBy.length > 1 ? (
                          <CheckCheck className="h-3.5 w-3.5 text-[#53bdeb]" /> // Blue double ticks
                        ) : (
                          <Check className="h-3 w-3 text-white/50" /> // Single tick
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Bar */}
          <form onSubmit={handleSendText} className="p-3 bg-[#202c33] flex items-end gap-3 z-10">
            <div className="flex-1 bg-[#2a3942] rounded-xl flex items-center min-h-[44px]">
              <input
                type="text"
                value={newMessage}
                onChange={handleTyping}
                placeholder="Type a message"
                className="w-full bg-transparent px-4 py-3 text-[15px] text-white focus:outline-none placeholder:text-[#8696a0]"
              />
            </div>
            {newMessage.trim() ? (
              <button 
                aria-label="Send Message"
                type="submit"
                className="h-11 w-11 bg-[#00a884] rounded-full flex items-center justify-center hover:bg-[#00a884]/90 transition-colors shrink-0"
              >
                <Send className="h-5 w-5 text-white ml-1" />
              </button>
            ) : (
              <button 
                type="button"
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onMouseLeave={stopRecording}
                className={`h-11 w-11 rounded-full flex items-center justify-center transition-colors shrink-0 ${isRecording ? 'bg-rose-500 animate-pulse' : 'bg-slate-700 hover:bg-slate-600'}`}
                title="Hold to record voice note"
              >
                <Mic className="h-5 w-5 text-white" />
              </button>
            )}
          </form>
        </section>
      ) : (
        <section className="flex-1 flex flex-col items-center justify-center bg-[#222e35] border-b-[6px] border-[#00a884]">
          <div className="text-center max-w-md">
            <div className="inline-flex h-24 w-24 bg-slate-800 rounded-full items-center justify-center mb-6 border border-slate-700">
              <MessageSquare className="h-10 w-10 text-[#00a884]" />
            </div>
            <h2 className="text-3xl font-light text-slate-200 mb-4">KennyKentola Web</h2>
            <p className="text-[#8696a0] text-sm leading-relaxed mb-8">
              Send and receive messages without keeping your phone online. 
              Use peer-to-peer audio calling and voice notes to connect with mentors and teams.
            </p>
            <p className="text-xs text-[#8696a0] flex items-center justify-center gap-2">
              <ShieldAlert className="h-3 w-3" /> End-to-end encrypted chats
            </p>
          </div>
        </section>
      )}

      {/* Global Audio Reference */}
      <audio ref={myAudio} muted autoPlay className="hidden" />
      <audio ref={userAudio} autoPlay className="hidden" />
    </div>
  );
}
