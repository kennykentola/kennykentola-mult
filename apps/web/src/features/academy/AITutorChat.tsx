'use client';
import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, Loader2, Maximize2, Minimize2 } from 'lucide-react';
import { getSessionJwt } from '@/lib/sessionJwt';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  provider?: string;
}

interface AITutorChatProps {
  courseTitle?: string;
  lessonTitle?: string;
  className?: string;
}

export default function AITutorChat({ courseTitle, lessonTitle, className = '' }: AITutorChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 'initial', role: 'assistant', content: 'Hi there! I am your AI Tutor. Need help with this lesson?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const contextStr = `${courseTitle ? `Course: ${courseTitle}` : ''} ${lessonTitle ? `| Lesson: ${lessonTitle}` : ''}`;

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  async function handleSend(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const token = await getSessionJwt();
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

      const res = await fetch(`${apiBase}/ai/tutor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          messages: [...messages.filter(m => m.id !== 'initial'), userMsg].map(m => ({
            role: m.role,
            content: m.content
          })),
          context: contextStr
        })
      });

      if (!res.ok) throw new Error('Failed to get AI response');
      const data = await res.json();
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content,
        provider: data.provider
      }]);
    } catch (err: any) {
      console.error('AI Tutor error:', err);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I am having trouble connecting to the AI models right now. Please try again later.'
      }]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex flex-col items-end ${className}`}>
      {/* Floating Chat Window */}
      {isOpen && (
        <div 
          className={`bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-4 transition-all duration-300 ${
            isExpanded ? 'w-[90vw] md:w-[600px] h-[80vh]' : 'w-[350px] sm:w-[400px] h-[500px]'
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">AI Tutor</h3>
                <p className="text-indigo-200 text-xs">Triple-Redundancy AI System</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Minimize' : 'Maximize'}
                aria-label={isExpanded ? 'Minimize chat' : 'Maximize chat'}
                className="text-white/70 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors hidden sm:block"
              >
                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                title="Close AI Tutor"
                aria-label="Close AI Tutor"
                className="text-white/70 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-none' 
                    : 'bg-slate-800 text-slate-200 border border-slate-700/50 rounded-bl-none'
                }`}>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-800 border border-slate-700/50 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 text-indigo-400 animate-spin" />
                  <span className="text-xs text-slate-400">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-slate-900 border-t border-slate-800">
            <form onSubmit={handleSend} className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-full pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                title="Send Message"
                aria-label="Send Message"
                className="absolute right-2 p-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 text-white rounded-full transition-colors disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4 ml-0.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          title="Open AI Tutor"
          aria-label="Open AI Tutor"
          className="group flex items-center justify-center w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-lg shadow-indigo-900/20 hover:shadow-indigo-600/40 hover:scale-105 transition-all duration-300"
        >
          <Bot className="h-6 w-6 group-hover:scale-110 transition-transform" />
        </button>
      )}
    </div>
  );
}
