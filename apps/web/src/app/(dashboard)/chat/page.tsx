'use client';

import { ChatView } from '@/features/chat/ChatView';
import { MessageSquare } from 'lucide-react';

export default function ClientChatPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <MessageSquare className="h-8 w-8 text-indigo-400" />
          Direct Messages
        </h1>
        <p className="text-slate-400 text-sm mt-1">Chat securely with our team regarding your projects and requests.</p>
      </div>

      <ChatView />
    </div>
  );
}
