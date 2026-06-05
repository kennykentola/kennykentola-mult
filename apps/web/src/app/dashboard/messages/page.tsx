'use client';

import React, { useState } from 'react';
import { useAuth } from '../../../features/auth/AuthContext';
import { Search, Send, User, MessageSquare, ShieldAlert } from 'lucide-react';

export default function MessagesPage() {
  const { profile } = useAuth();
  const [activeChat, setActiveChat] = useState(0);
  const [newMessage, setNewMessage] = useState('');

  const chatChannels = [
    {
      id: 0,
      name: 'Kenny Kentola (Director)',
      role: 'Project Manager',
      avatar: 'K',
      lastMsg: 'Great, I will review the database specs tonight.',
      messages: [
        { sender: 'them', text: 'Welcome to your KennyKentola agency dashboard! Feel free to ask any question here.', time: '10:04 AM' },
        { sender: 'me', text: 'Thank you! I just uploaded my multi-tenant project brief.', time: '10:15 AM' },
        { sender: 'them', text: 'Great, I will review the database specs tonight.', time: '10:30 AM' }
      ]
    },
    {
      id: 1,
      name: 'Sarah Jenkins (LMS Tutor)',
      role: 'Coding Mentor',
      avatar: 'S',
      lastMsg: 'Remember to complete your Next.js challenge before Friday.',
      messages: [
        { sender: 'them', text: 'Hey there! How is the Next.js routing going?', time: 'Yesterday' },
        { sender: 'me', text: 'Pretty well, understanding parallel routes now.', time: 'Yesterday' },
        { sender: 'them', text: 'Remember to complete your Next.js challenge before Friday.', time: 'Yesterday' }
      ]
    },
    {
      id: 2,
      name: 'Solar Grid Support Team',
      role: 'Technical Crew',
      avatar: 'T',
      lastMsg: 'Your site inspection is scheduled for tomorrow at 2:00 PM.',
      messages: [
        { sender: 'them', text: 'Hello, we verified your payment invoice receipt.', time: 'Wednesday' },
        { sender: 'them', text: 'Your site inspection is scheduled for tomorrow at 2:00 PM.', time: 'Wednesday' }
      ]
    }
  ];

  const [channels, setChannels] = useState(chatChannels);

  const currentChannel = channels[activeChat];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msg = {
      sender: 'me',
      text: newMessage,
      time: 'Just now'
    };

    const updatedChannels = channels.map((ch) => {
      if (ch.id === activeChat) {
        return {
          ...ch,
          lastMsg: newMessage,
          messages: [...ch.messages, msg]
        };
      }
      return ch;
    });

    setChannels(updatedChannels);
    setNewMessage('');
  };

  return (
    <div className="glass-panel border border-white/5 bg-slate-900/20 rounded-3xl overflow-hidden flex h-[calc(105vh-200px)] max-w-6xl mx-auto shadow-2xl">
      {/* Channels Sidebar List */}
      <aside className="w-80 border-r border-slate-900 bg-slate-950/40 flex flex-col">
        <div className="p-4 border-b border-slate-900">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full bg-slate-950/60 border border-slate-850 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {channels.map((ch, idx) => (
            <button
              key={ch.id}
              onClick={() => setActiveChat(idx)}
              className={`w-full flex items-start gap-3 p-3 rounded-2xl text-left transition-all ${
                activeChat === idx 
                  ? 'bg-indigo-650/10 border border-indigo-500/10 text-indigo-400' 
                  : 'border border-transparent text-slate-400 hover:text-white hover:bg-slate-900/40'
              }`}
            >
              <div className="h-10 w-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sm text-indigo-400 uppercase shrink-0">
                {ch.avatar}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex justify-between items-baseline">
                  <h4 className="text-xs font-bold text-white truncate">{ch.name}</h4>
                </div>
                <span className="text-[10px] text-slate-500 block mb-1">{ch.role}</span>
                <p className="text-[11px] text-slate-400 truncate">{ch.lastMsg}</p>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Main Messaging Window */}
      <section className="flex-1 flex flex-col bg-slate-950/10">
        {/* Chat Header */}
        <header className="h-16 border-b border-slate-900 px-6 flex items-center justify-between bg-slate-950/30">
          <div>
            <h3 className="text-sm font-bold text-white">{currentChannel.name}</h3>
            <span className="text-[10px] text-slate-500">{currentChannel.role} • Active Support Channel</span>
          </div>
        </header>

        {/* Message Bubble Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {currentChannel.messages.map((m, mIdx) => {
            const isMe = m.sender === 'me';
            return (
              <div key={mIdx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-md rounded-2xl p-4 text-xs ${
                  isMe 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-slate-900 border border-white/5 text-slate-200 rounded-tl-none'
                }`}>
                  <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                  <span className={`text-[9px] block mt-1.5 text-right ${isMe ? 'text-indigo-200' : 'text-slate-500'}`}>
                    {m.time}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Message Input Bar */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-900 bg-slate-950/40 flex gap-3">
          <input
            type="text"
            placeholder="Type your message here..."
            className="flex-1 bg-slate-950/60 border border-slate-850 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button
            type="submit"
            className="h-10 w-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-colors shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </section>
    </div>
  );
}
