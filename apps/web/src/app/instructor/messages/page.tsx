'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../../features/auth/AuthContext';
import { Search, Send, Users, MessageSquare, BookOpen, GraduationCap } from 'lucide-react';

type Message = { sender: 'me' | 'them'; text: string; time: string };
type Channel = { id: number; name: string; role: string; avatar: string; color: string; lastMsg: string; messages: Message[] };

function now() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const initialChannels: Channel[] = [
  {
    id: 0,
    name: 'Admin Support',
    role: 'Platform Administration',
    avatar: 'A',
    color: 'from-rose-500 to-rose-400',
    lastMsg: 'Your course has been approved!',
    messages: [
      { sender: 'them', text: 'Welcome to the Instructor Desk! Your account has been activated. You can start creating courses now.', time: '9:00 AM' },
      { sender: 'them', text: 'Your course has been approved and is now live on the platform!', time: '11:30 AM' },
    ],
  },
  {
    id: 1,
    name: 'Student Group — React Class',
    role: 'Class Discussion Channel',
    avatar: 'R',
    color: 'from-indigo-500 to-indigo-400',
    lastMsg: 'When is the next live session?',
    messages: [
      { sender: 'them', text: 'Hi! I have a question about the useEffect hook.', time: '2:10 PM' },
      { sender: 'me', text: 'Great question! useEffect runs after every render by default. The dependency array controls when it re-runs.', time: '2:15 PM' },
      { sender: 'them', text: 'When is the next live session?', time: '2:20 PM' },
    ],
  },
  {
    id: 2,
    name: 'Ademola Peter (Student)',
    role: 'React Masterclass',
    avatar: 'AP',
    color: 'from-cyan-500 to-cyan-400',
    lastMsg: 'I need help with Assignment 2',
    messages: [
      { sender: 'them', text: 'Good afternoon! I need help with Assignment 2 — the GitHub link part.', time: '4:00 PM' },
      { sender: 'me', text: "Sure! Make sure your repo is public. Paste your GitHub link in the submission form under the course page.", time: '4:05 PM' },
      { sender: 'them', text: 'I need help with Assignment 2', time: '4:08 PM' },
    ],
  },
];

export default function InstructorMessagesPage() {
  const { profile } = useAuth();
  const [channels, setChannels] = useState<Channel[]>(initialChannels);
  const [activeId, setActiveId] = useState(0);
  const [newMessage, setNewMessage] = useState('');
  const [search, setSearch] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const activeChannel = channels.find((c) => c.id === activeId)!;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChannel?.messages]);

  function handleSend() {
    const text = newMessage.trim();
    if (!text) return;
    const msg: Message = { sender: 'me', text, time: now() };
    setChannels((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? { ...c, lastMsg: text, messages: [...c.messages, msg] }
          : c
      )
    );
    setNewMessage('');
  }

  const filtered = channels.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-10rem)] max-w-6xl mx-auto rounded-3xl border border-white/5 overflow-hidden shadow-2xl bg-slate-950">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-72 border-r border-slate-900 shrink-0">
        {/* Header */}
        <div className="h-16 flex items-center px-5 border-b border-slate-900 gap-2">
          <MessageSquare className="h-5 w-5 text-indigo-400" />
          <span className="font-bold text-white">Messages</span>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-900">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full rounded-xl border border-white/5 bg-slate-900/40 pl-9 pr-4 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Channel list */}
        <nav className="flex-1 overflow-y-auto py-2">
          {filtered.map((c) => (
            <button
              key={c.id}
              id={`chat-${c.id}`}
              onClick={() => setActiveId(c.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                activeId === c.id ? 'bg-slate-900/60 border-l-2 border-indigo-500' : 'hover:bg-slate-900/30 border-l-2 border-transparent'
              }`}
            >
              <div className={`h-9 w-9 rounded-full bg-gradient-to-br ${c.color} flex items-center justify-center text-xs font-black text-white shrink-0`}>
                {c.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{c.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{c.lastMsg}</p>
              </div>
            </button>
          ))}
        </nav>

        {/* Legend */}
        <div className="p-4 border-t border-slate-900 space-y-1.5">
          <div className="flex items-center gap-2 text-[10px] text-slate-600">
            <Users className="h-3 w-3" /> Student Group Channels
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-600">
            <GraduationCap className="h-3 w-3" /> Individual Students
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-600">
            <BookOpen className="h-3 w-3" /> Admin / Platform Support
          </div>
        </div>
      </aside>

      {/* Chat Area */}
      <main className="flex flex-col flex-1 min-w-0">
        {/* Chat Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-900 gap-3 shrink-0">
          <div className={`h-9 w-9 rounded-full bg-gradient-to-br ${activeChannel.color} flex items-center justify-center text-xs font-black text-white shrink-0`}>
            {activeChannel.avatar}
          </div>
          <div>
            <p className="text-sm font-bold text-white">{activeChannel.name}</p>
            <p className="text-[10px] text-slate-500">{activeChannel.role}</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-slate-500">Online</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {activeChannel.messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
              {msg.sender === 'them' && (
                <div className={`h-7 w-7 rounded-full bg-gradient-to-br ${activeChannel.color} flex items-center justify-center text-[10px] font-black text-white shrink-0 mr-2 mt-1`}>
                  {activeChannel.avatar[0]}
                </div>
              )}
              <div className={`max-w-xs lg:max-w-md rounded-2xl px-4 py-3 ${
                msg.sender === 'me'
                  ? 'bg-indigo-600 text-white rounded-tr-sm'
                  : 'bg-slate-900/60 border border-white/5 text-slate-200 rounded-tl-sm'
              }`}>
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <p className={`text-[10px] mt-1 ${msg.sender === 'me' ? 'text-indigo-200' : 'text-slate-500'} text-right`}>
                  {msg.time}
                </p>
              </div>
              {msg.sender === 'me' && (
                <div className="h-7 w-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-black text-indigo-400 shrink-0 ml-2 mt-1 uppercase">
                  {profile?.firstName?.[0] || 'I'}
                </div>
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-6 py-4 border-t border-slate-900 flex items-center gap-3 shrink-0">
          <input
            id="instructor-message-input"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Type a message..."
            className="flex-1 rounded-xl border border-white/5 bg-slate-900/40 px-4 py-3 text-sm text-white focus:border-indigo-500 focus:outline-none transition-all"
          />
          <button
            id="btn-send-instructor-message"
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="h-11 w-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-white transition-all shadow-lg shadow-indigo-500/20"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </main>
    </div>
  );
}
