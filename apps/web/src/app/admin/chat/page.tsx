'use client';

import { ChatView } from '@/features/chat/ChatView';
import { MessageSquare } from 'lucide-react';

export default function AdminChatPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <MessageSquare className="h-8 w-8 text-indigo-400" />
          Internal & Client Communications
        </h1>
        <p className="text-slate-400 text-sm mt-1">Manage all direct messages with clients and team members.</p>
      </div>

      <ChatView />
    </div>
  );
}
