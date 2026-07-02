import React, { useEffect, useState } from 'react';
import { getProjectTickets, createTicket, getTicketDetails, sendTicketMessage } from '../../features/tickets/ticketsService';
import { MessageSquare, Plus, ArrowLeft, Send, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export function ProjectTickets({ projectId }: { projectId: string }) {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [activeTicket, setActiveTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  
  const [showNewModal, setShowNewModal] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState('medium');

  const [messageContent, setMessageContent] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  useEffect(() => {
    loadTickets();
  }, [projectId]);

  useEffect(() => {
    if (selectedTicketId) {
      loadTicketDetails(selectedTicketId);
    }
  }, [selectedTicketId]);

  const loadTickets = async () => {
    try {
      const all = await getProjectTickets(projectId);
      setTickets(all);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadTicketDetails = async (id: string) => {
    try {
      const data = await getTicketDetails(id);
      setActiveTicket(data.ticket);
      setMessages(data.messages || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject || !newDesc) return;
    try {
      await createTicket({
        subject: newSubject,
        description: newDesc,
        priority: newPriority,
        projectOrContractId: projectId
      });
      toast.success('Ticket created successfully');
      setShowNewModal(false);
      setNewSubject('');
      setNewDesc('');
      loadTickets();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create ticket');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim() || !selectedTicketId) return;
    setSendingMsg(true);
    try {
      await sendTicketMessage(selectedTicketId, messageContent);
      setMessageContent('');
      loadTicketDetails(selectedTicketId);
    } catch (err) {
      console.error(err);
    } finally {
      setSendingMsg(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-400">Loading support tickets...</div>;

  if (selectedTicketId && activeTicket) {
    return (
      <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
        <button 
          onClick={() => setSelectedTicketId(null)}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Tickets
        </button>

        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">{activeTicket.subject}</h3>
              <p className="text-sm text-slate-400 whitespace-pre-wrap">{activeTicket.description}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              activeTicket.status === 'open' ? 'bg-amber-500/20 text-amber-500' :
              activeTicket.status === 'in-progress' ? 'bg-indigo-500/20 text-indigo-400' :
              'bg-emerald-500/20 text-emerald-400'
            }`}>
              {activeTicket.status}
            </span>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-2xl flex flex-col h-[500px]">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.length === 0 ? (
              <div className="text-center text-slate-500 mt-10">No messages yet. We will reply shortly!</div>
            ) : (
              messages.map(msg => {
                const isMine = msg.senderId === activeTicket.userId;
                return (
                  <div key={msg.$id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                    <div className="text-xs text-slate-500 mb-1 px-1">
                      {isMine ? 'You' : 'Support Team'} • {new Date(msg.$createdAt).toLocaleTimeString()}
                    </div>
                    <div className={`max-w-[80%] rounded-2xl p-4 text-sm ${
                      isMine 
                        ? 'bg-indigo-600 text-white rounded-tr-sm' 
                        : 'bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div className="p-4 border-t border-slate-800 bg-slate-900/50">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input 
                title="Message" type="text" placeholder="Type your reply..."
                value={messageContent} onChange={e => setMessageContent(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-colors"
                disabled={sendingMsg}
              />
              <button 
                title="Send Message" type="submit" disabled={sendingMsg}
                className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-xl transition-colors disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-white">Support Tickets</h2>
          <p className="text-sm text-slate-400">Ask questions, report issues, or request changes.</p>
        </div>
        <button 
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors text-sm"
        >
          <Plus className="w-4 h-4" /> New Ticket
        </button>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/30 rounded-2xl border border-slate-800">
          <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No active tickets</h3>
          <p className="text-slate-400">Need help? Open a support ticket and our team will assist you.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {tickets.map(ticket => (
            <div 
              key={ticket.$id} onClick={() => setSelectedTicketId(ticket.$id)}
              className="bg-slate-900/50 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl p-5 cursor-pointer transition-all flex items-center justify-between group"
            >
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-bold text-white group-hover:text-indigo-400 transition-colors">{ticket.subject}</h4>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    ticket.priority === 'urgent' ? 'bg-rose-500/20 text-rose-400' :
                    ticket.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {ticket.priority}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(ticket.$createdAt).toLocaleDateString()}</span>
                  <span>ID: #{ticket.$id.slice(-6).toUpperCase()}</span>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                ticket.status === 'open' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/20' :
                ticket.status === 'in-progress' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/20' :
                'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
              }`}>
                {ticket.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Open Support Ticket</h3>
              <button onClick={() => setShowNewModal(false)} className="text-slate-500 hover:text-white">&times;</button>
            </div>
            <form onSubmit={handleCreateTicket} className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-2">Subject</label>
                <input 
                  title="Subject" required autoFocus type="text"
                  value={newSubject} onChange={e => setNewSubject(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:border-indigo-500 outline-none"
                  placeholder="What do you need help with?"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-2">Description</label>
                <textarea 
                  title="Description" required rows={4}
                  value={newDesc} onChange={e => setNewDesc(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:border-indigo-500 outline-none resize-none"
                  placeholder="Provide as much detail as possible..."
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-2">Priority</label>
                <select 
                  title="Priority" value={newPriority} onChange={e => setNewPriority(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:border-indigo-500 outline-none"
                >
                  <option value="low">Low (General Inquiry)</option>
                  <option value="medium">Medium (Standard Request)</option>
                  <option value="high">High (Urgent Bug / Blocker)</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowNewModal(false)} className="flex-1 py-3 text-slate-400 hover:text-white bg-slate-900 rounded-xl font-medium">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-colors">Submit Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
