'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../features/auth/AuthContext';
import { 
  Briefcase, 
  Calendar, 
  CheckSquare, 
  Clock, 
  Plus, 
  Upload, 
  FileText, 
  Send, 
  Download, 
  MessageSquare, 
  AlertCircle, 
  User, 
  CheckCircle,
  FileCheck,
  CreditCard,
  TrendingUp,
  Server
} from 'lucide-react';

export default function ProjectsPage() {
  const { profile } = useAuth();
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectCategory, setProjectCategory] = useState('Software Development');
  const [projectBrief, setProjectBrief] = useState('');
  const [budget, setBudget] = useState('');

  // Determine client Type - default to 'academic' for clients who choose it, or based on profile.clientType
  const clientType = profile?.clientType || 'commercial';

  // State for Academic Support Chat
  const [messages, setMessages] = useState<any[]>([
    { sender: 'developer', text: 'Hello! I am your assigned lead engineer Kehinde. I have uploaded the prototype codebase. Let me know if you have any questions about the React compilation or setup.', time: '2:15 PM' }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMsg = { sender: 'client', text: newMessage, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMsg]);
    setNewMessage('');

    // Simulate developer reply
    setTimeout(() => {
      let replyText = 'Thanks for reaching out! I am currently checking the database configurations and will update the package.json to resolve your dependency conflict. I will post a new build within 30 minutes.';
      if (newMessage.toLowerCase().includes('chapter') || newMessage.toLowerCase().includes('proposal') || newMessage.toLowerCase().includes('write')) {
        replyText = 'Understood. I will revise Chapter 3 (Methodology) to clearly detail the Express backend middleware layers and SQLite database schema diagrams. Expect the PDF document draft by tomorrow morning.';
      }
      setMessages(prev => [...prev, {
        sender: 'developer',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1500);
  };

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Project request submitted for "${projectName}". Our project manager will contact you via email within 24 hours.`);
    setProjectName('');
    setProjectBrief('');
    setBudget('');
    setShowRequestForm(false);
  };

  // Academic View Data
  const academicProject = {
    id: 'acad-101',
    name: 'IoT-Enabled Smart Solar Grid Manager',
    category: 'Computer Science Thesis',
    status: 'Prototype Ready',
    defenseDate: 'August 10, 2026',
    progress: 75,
    assignedDeveloper: 'Kehinde Peter (Senior Developer)',
    milestones: [
      { label: 'Thesis Proposal & Review', date: 'May 10', completed: true },
      { label: 'Chapter 1 & 2 Drafts Submitted', date: 'May 28', completed: true },
      { label: 'Database & Frontend Prototype Demo', date: 'June 15', completed: true },
      { label: 'Chapter 3 & 4 System Implementation', date: 'July 5', completed: false },
      { label: 'Final Code Compilation & Chapter 5', date: 'July 25', completed: false }
    ],
    chapters: [
      { name: 'Chapter 1: Introduction.docx', status: 'Approved', date: 'May 20, 2026' },
      { name: 'Chapter 2: Literature Review.docx', status: 'Approved', date: 'May 29, 2026' },
      { name: 'Chapter 3: System Methodology.docx', status: 'In Review', date: 'June 04, 2026' },
      { name: 'Chapter 4: Implementation Logs.docx', status: 'Pending Upload', date: '--' }
    ],
    builds: [
      { name: 'smart-solar-grid-v1.0-prototype.zip', size: '42.5 MB', date: 'June 05, 2026' },
      { name: 'database-schema-seeding.sql', size: '154 KB', date: 'June 03, 2026' },
      { name: 'setup-and-installation-guide.pdf', size: '1.2 MB', date: 'June 03, 2026' }
    ]
  };

  // Commercial View Data
  const commercialProject = {
    id: 'comm-202',
    name: 'Multi-Tenant CRM Web Portal',
    category: 'Software Engineering',
    status: 'In Development',
    deliveryDate: 'July 15, 2026',
    price: '₦1,850,000',
    progress: 45,
    milestones: [
      { label: 'Requirements & Design Signoff', date: 'June 10', completed: true },
      { label: 'Database Schema & Auth Config', date: 'June 25', completed: true },
      { label: 'Core Client Modules & API Hooks', date: 'July 05', completed: false },
      { label: 'Verification & QA Testing', date: 'July 12', completed: false }
    ],
    invoices: [
      { number: 'INV-2026-009', label: 'Milestone 1: DB Schema & Auth Setup', amount: '₦450,000', status: 'Paid', date: 'June 11, 2026' },
      { number: 'INV-2026-012', label: 'Milestone 2: Dashboard & Payments Module', amount: '₦600,050', status: 'Unpaid', date: 'June 30, 2026' }
    ],
    supportSLA: {
      tier: 'Standard Developer SLA (24hr response)',
      uptime: '99.9%',
      supportHours: '8:00 AM - 6:00 PM GMT+1'
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">
            {clientType === 'academic' ? 'Academic Thesis Workspace' : 'Commercial Client Workspace'}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {clientType === 'academic' 
              ? 'Track your final-year research development, thesis chapters, and software builds.'
              : 'Track enterprise engineering milestones, retainer bills, and active developer pipelines.'}
          </p>
        </div>

        <button
          onClick={() => setShowRequestForm(!showRequestForm)}
          className="rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-90 transition-opacity px-5 py-3 text-xs font-bold text-white shadow flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Request Estimation
        </button>
      </div>

      {/* Request Form Section */}
      {showRequestForm && (
        <div className="glass-panel border border-white/10 bg-slate-900/40 rounded-2xl p-6 lg:p-8 animate-in fade-in duration-200">
          <h2 className="text-lg font-bold text-white mb-6">Submit Project Brief</h2>
          <form onSubmit={handleRequestSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Solar Power Grid System, Student Handout App"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="proj-cat" className="text-xs font-semibold text-slate-400 block mb-1.5">Project Category</label>
                <select
                  id="proj-cat"
                  title="Project Category"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                  value={projectCategory}
                  onChange={(e) => setProjectCategory(e.target.value)}
                >
                  <option value="Software Development">Software Development (MVP)</option>
                  <option value="App Maintenance">Legacy App Maintenance</option>
                  <option value="CS Student Project">CS Student Project Setup</option>
                  <option value="Solar & Home Electrical">Solar Installation / Electrical Wiring</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5">Project Brief & Details</label>
              <textarea
                required
                rows={4}
                placeholder="Briefly describe the features, targets, UI references, or solar grid sizes you want to build."
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors resize-none"
                value={projectBrief}
                onChange={(e) => setProjectBrief(e.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Target Budget (₦ / NGN)</label>
                <input
                  type="text"
                  placeholder="e.g. ₦250,000, ₦1,500,000"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Attach Scope Files / Mockups</label>
                <div className="flex items-center gap-3">
                  <button type="button" className="rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 px-4 py-2.5 text-xs text-slate-300 font-semibold flex items-center gap-2 transition-colors">
                    <Upload className="h-4 w-4" /> Upload PDF
                  </button>
                  <span className="text-xs text-slate-500">Max size 20MB</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowRequestForm(false)}
                className="rounded-xl bg-slate-900 hover:bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-400 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-cyan-600 hover:bg-cyan-500 px-5 py-2.5 text-xs font-semibold text-white transition-colors flex items-center gap-1.5"
              >
                <Send className="h-3.5 w-3.5" /> Submit Request
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Dynamic Workspace Rendering */}
      {clientType === 'academic' ? (
        /* ================= ACADEMIC THESIS VIEW ================= */
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="glass-panel border border-white/5 bg-slate-900/20 rounded-3xl p-6 lg:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-900 pb-6 mb-6 gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    {academicProject.status}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">{academicProject.category}</span>
                </div>
                <h3 className="text-xl font-bold text-white mt-3">{academicProject.name}</h3>
                <span className="text-xs text-slate-400 font-semibold block mt-1.5">Developer: {academicProject.assignedDeveloper}</span>
              </div>

              <div className="text-left md:text-right">
                <span className="text-xs text-slate-500 block">Defense Deadline</span>
                <span className="text-lg font-extrabold text-cyan-400 mt-1 block">{academicProject.defenseDate}</span>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              {/* Milestones */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Milestone Roadmap</h4>
                <div className="relative border-l border-slate-850 pl-5 ml-2.5 space-y-5">
                  {academicProject.milestones.map((milestone, mIdx) => (
                    <div key={mIdx} className="relative">
                      <div className={`absolute left-[-26px] top-1.5 h-3.5 w-3.5 rounded-full border-2 ${
                        milestone.completed 
                          ? 'bg-cyan-500 border-cyan-500' 
                          : 'bg-slate-950 border-slate-700'
                      }`} />
                      <div className="flex justify-between items-start text-xs">
                        <span className={`font-semibold ${milestone.completed ? 'text-white' : 'text-slate-500'}`}>
                          {milestone.label}
                        </span>
                        <span className="text-slate-500">{milestone.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress Summary */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Status Overview</h4>
                <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-5 space-y-4">
                  <div>
                    <div className="flex justify-between items-center text-xs text-slate-400 mb-1.5">
                      <span>Development & Write-up Progress</span>
                      <span className="font-bold text-cyan-400">{academicProject.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-850 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full w-[75%]" 
                      />
                    </div>
                  </div>

                  <div className="pt-2 text-xs flex justify-between">
                    <div>
                      <span className="text-slate-550 block">Compilation status</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1.5 mt-1">
                        <CheckCircle className="h-3.5 w-3.5" /> Stable Build
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-550 block">Assigned Advisor</span>
                      <span className="text-slate-350 font-bold block mt-1">Kehinde Peter</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chapters and Code Downloads */}
          <div className="grid gap-8 md:grid-cols-2">
            
            {/* Thesis Chapters Progress */}
            <div className="glass-panel border border-white/5 bg-slate-900/20 rounded-3xl p-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                <FileText className="h-4.5 w-4.5 text-indigo-400" />
                Thesis Chapters Drafts
              </h3>
              <div className="space-y-3">
                {academicProject.chapters.map((chap, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-slate-950/40 text-xs">
                    <div>
                      <div className="font-semibold text-white">{chap.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Uploaded: {chap.date}</div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      chap.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      chap.status === 'In Review' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-slate-900 text-slate-500 border border-slate-800'
                    }`}>
                      {chap.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Code / Installation Builds */}
            <div className="glass-panel border border-white/5 bg-slate-900/20 rounded-3xl p-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                <Download className="h-4.5 w-4.5 text-cyan-400" />
                Prototype Build Downloads
              </h3>
              <div className="space-y-3">
                {academicProject.builds.map((build, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-slate-950/40 text-xs">
                    <div>
                      <div className="font-semibold text-white">{build.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Size: {build.size} • Uploaded: {build.date}</div>
                    </div>
                    <button 
                      onClick={() => alert(`Downloading ${build.name}...`)}
                      className="rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 p-2 transition-all duration-200"
                      title="Download Build"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Lead Developer Chat Panel */}
          <div className="glass-panel border border-white/5 bg-slate-900/20 rounded-3xl p-6 max-w-3xl mx-auto">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <MessageSquare className="h-4.5 w-4.5 text-indigo-400" />
              Direct Support Chat with Assigned Developer
            </h3>
            
            <div className="border border-white/5 bg-slate-950/60 rounded-2xl p-4 flex flex-col h-72">
              {/* Message History */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-3 text-xs ${msg.sender === 'client' ? 'justify-end' : 'justify-start'}`}>
                    {msg.sender === 'developer' && (
                      <div className="h-8 w-8 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold shrink-0">
                        K
                      </div>
                    )}
                    <div className="max-w-md">
                      <div className={`p-3 rounded-2xl ${
                        msg.sender === 'client' 
                          ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-tr-none'
                          : 'bg-slate-900 border border-white/5 text-slate-350 rounded-tl-none'
                      }`}>
                        {msg.text}
                      </div>
                      <span className={`text-[9px] text-slate-500 mt-1 block ${msg.sender === 'client' ? 'text-right' : 'text-left'}`}>
                        {msg.time}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="border-t border-white/5 pt-3 mt-3 flex gap-2">
                <input
                  type="text"
                  placeholder="Ask Kehinde a question about compilation or methodology drafts..."
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button type="submit" title="Send Message" aria-label="Send Message" className="rounded-xl bg-indigo-500 hover:bg-indigo-650 p-2.5 text-white transition-colors">
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        /* ================= COMMERCIAL SOFTWARE VIEW ================= */
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="glass-panel border border-white/5 bg-slate-900/20 rounded-2xl p-6 lg:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-900 pb-6 mb-6 gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {commercialProject.status}
                  </span>
                  <span className="text-xs text-slate-550 font-semibold">{commercialProject.category}</span>
                </div>
                <h3 className="text-xl font-bold text-white mt-3">{commercialProject.name}</h3>
              </div>

              <div className="text-left md:text-right">
                <span className="text-xs text-slate-500 block">Total Budget</span>
                <span className="text-xl font-extrabold text-cyan-400 mt-1 block">{commercialProject.price}</span>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              {/* Milestone Roadmap */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Milestone Roadmap</h4>
                <div className="relative border-l border-slate-850 pl-5 ml-2.5 space-y-5">
                  {commercialProject.milestones.map((milestone, mIdx) => (
                    <div key={mIdx} className="relative">
                      <div className={`absolute left-[-26px] top-1.5 h-3.5 w-3.5 rounded-full border-2 ${
                        milestone.completed 
                          ? 'bg-cyan-500 border-cyan-500' 
                          : 'bg-slate-950 border-slate-700'
                      }`} />
                      <div className="flex justify-between items-start text-xs">
                        <span className={`font-semibold ${milestone.completed ? 'text-white' : 'text-slate-500'}`}>
                          {milestone.label}
                        </span>
                        <span className="text-slate-500">{milestone.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Overview */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Status Overview</h4>
                <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-5 space-y-4">
                  <div>
                    <div className="flex justify-between items-center text-xs text-slate-400 mb-1.5">
                      <span>Overall Progress</span>
                      <span className="font-bold text-cyan-400">{commercialProject.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-850 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full w-[45%]" 
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-2 text-xs">
                    <div className="flex-1">
                      <span className="text-slate-550 block">Est. Delivery</span>
                      <span className="text-white font-semibold flex items-center gap-1.5 mt-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-450" /> {commercialProject.deliveryDate}
                      </span>
                    </div>
                    <div className="flex-1">
                      <span className="text-slate-550 block">Contract Agreement</span>
                      <a href="#" className="text-indigo-400 font-semibold flex items-center gap-1.5 mt-1 hover:underline">
                        <FileText className="h-3.5 w-3.5 text-slate-450" /> View Agreement.pdf
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Invoices & Retainer Ledger */}
          <div className="grid gap-8 md:grid-cols-3">
            
            {/* Invoices */}
            <div className="md:col-span-2 glass-panel border border-white/5 bg-slate-900/20 rounded-3xl p-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                <CreditCard className="h-4.5 w-4.5 text-indigo-400" />
                Billing Ledger & Invoices
              </h3>
              <div className="space-y-3">
                {commercialProject.invoices.map((inv, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-white/5 bg-slate-950/40 gap-3 text-xs">
                    <div>
                      <div className="font-semibold text-white">{inv.label}</div>
                      <div className="text-[10px] text-slate-500 mt-1">{inv.number} • Issued: {inv.date}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-extrabold text-white">{inv.amount}</span>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                        inv.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {inv.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SLA support and details */}
            <div className="glass-panel border border-white/5 bg-slate-900/20 rounded-3xl p-6 space-y-4 text-xs">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Server className="h-4.5 w-4.5 text-cyan-400" />
                Service Level Agreement
              </h3>
              
              <div className="space-y-3">
                <div>
                  <span className="text-slate-550 block">Tier Level</span>
                  <span className="text-white font-semibold block mt-0.5">{commercialProject.supportSLA.tier}</span>
                </div>
                <div>
                  <span className="text-slate-550 block">Target Server Uptime</span>
                  <span className="text-cyan-400 font-bold block mt-0.5">{commercialProject.supportSLA.uptime}</span>
                </div>
                <div>
                  <span className="text-slate-550 block">Engineering Support Hours</span>
                  <span className="text-slate-350 font-semibold block mt-0.5">{commercialProject.supportSLA.supportHours}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
