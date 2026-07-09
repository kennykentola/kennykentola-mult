'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { ConsultationModal } from '../../components/ConsultationModal';
import { requestAcademicProject } from '../../features/academic/academicService';
import { subscribeToNewsletter } from '../../features/newsletter/newsletterService';
import { useAuth } from '../../features/auth/AuthContext';
import toast from 'react-hot-toast';
import { 
  GraduationCap, BookOpen, Code, Terminal, MonitorSmartphone, Target, PlayCircle,
  CheckCircle, Users, Trophy, Layout, Cpu, Database, Blocks, Lightbulb, Map, Sparkles, 
  Server, Laptop, ChevronRight, PenTool, ClipboardList, BookMarked, Search, MessagesSquare, ArrowRight, Loader2, Play, FileText
} from 'lucide-react';

export default function AcademicLandingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    universityName: '',
    department: '',
    degree: 'BSc',
    level: 'Final Year',
    serviceScope: 'Full Package',
    clientName: '',
    clientEmail: '',
    clientPhone: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await requestAcademicProject(formData);
      
      if (!user) {
        toast.success('Project request submitted successfully! Please create an account to track your project.', { duration: 5000 });
        router.push('/register');
      } else {
        toast.success('Thesis project submitted successfully! Track it in your student dashboard.');
        router.push('/dashboard/academic');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit academic project');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      setSubscribing(true);
      const res = await subscribeToNewsletter(email);
      toast.success(res.message);
      setEmail('');
    } catch (error: any) {
      toast.error('Failed to subscribe.');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans selection:bg-amber-500/30">
      <Navbar />

      {/* Global Glow Effects */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-amber-900/10 blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-orange-900/10 blur-[150px] pointer-events-none" />

      <main className="relative pt-32 pb-24 overflow-hidden">
        
        {/* SECTION 1: HERO */}
        <section className="relative px-6 lg:px-12 max-w-7xl mx-auto pt-12 pb-24 grid lg:grid-cols-2 gap-16 items-center">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/10 backdrop-blur-md mb-8">
              <GraduationCap className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold tracking-wider uppercase text-amber-400">CS Thesis & Academic Projects</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter text-white leading-[1.1] mb-6">
              Complete Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-red-400">
                Final Year Project
              </span> <br />
              With Confidence.
            </h1>
            
            <p className="text-lg md:text-xl text-slate-400 leading-relaxed mb-8">
              Professional academic guidance, software development support, and research mentoring for Computer Science and IT students. From topic selection to project implementation, documentation, testing, and viva preparation.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-10">
              <Link href="#request-form" className="w-full sm:w-auto h-14 px-8 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-base font-bold hover:opacity-90 transition-opacity shadow-[0_0_40px_-10px_rgba(245,158,11,0.5)]">
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button 
                onClick={() => setIsConsultationModalOpen(true)}
                className="w-full sm:w-auto h-14 px-8 inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white text-base font-medium hover:bg-white/10 transition-colors backdrop-blur-md"
              >
                Book a Consultation
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-medium text-slate-400">
              <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> Ethical Academic Support</span>
              <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> Software Dev Guidance</span>
              <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> Expert Mentorship</span>
              <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> Learn Anywhere</span>
            </div>
          </div>

          <div className="relative rounded-3xl border border-white/10 bg-[#0A0A0A] p-2 overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 to-orange-500/10" />
            <img 
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80" 
              alt="Students collaborating on academic project" 
              className="w-full h-auto rounded-[1.25rem] object-cover mix-blend-luminosity opacity-80"
            />
            {/* Floating Elements overlay */}
            <div className="absolute top-8 left-8 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 animate-[bounce_4s_infinite]">
              <FileText className="w-6 h-6 text-amber-400" />
            </div>
            <div className="absolute bottom-12 right-8 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 animate-[bounce_5s_infinite_reverse]">
              <GraduationCap className="w-6 h-6 text-orange-400" />
            </div>
          </div>
        </section>

        {/* SECTION 2: ACADEMIC SUPPORT SERVICES */}
        <section className="py-24 border-y border-white/5 bg-[#0A0A0A]">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">Our Services</h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto">Comprehensive support for every stage of your final year project.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: <Target />, title: "Project Topic Selection", desc: "Choose a relevant, research-worthy project topic." },
                { icon: <PenTool />, title: "Proposal Development", desc: "Prepare a clear and structured project proposal." },
                { icon: <BookMarked />, title: "Literature Review", desc: "Learn how to find, analyse, and organise research materials." },
                { icon: <Layout />, title: "System Analysis & Design", desc: "Create UML diagrams, ERDs, flowcharts, and system architecture." },
                { icon: <Code />, title: "Software Development", desc: "Receive guidance while building web, mobile, and desktop applications." },
                { icon: <Search />, title: "Testing & Evaluation", desc: "Learn software testing, debugging, and system evaluation." },
                { icon: <FileText />, title: "Documentation", desc: "Improve project chapters, formatting, and technical writing." },
                { icon: <MessagesSquare />, title: "Viva Preparation", desc: "Prepare confidently for presentations and project defence." }
              ].map((service, idx) => (
                <div key={idx} className="group p-6 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-amber-500/30 transition-all">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    {service.icon}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{service.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{service.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 3: SOFTWARE DEVELOPMENT SUPPORT */}
        <section className="py-24 max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">Software Development Support</h2>
              <p className="text-xl text-slate-400 mb-8">We provide practical guidance for developing robust academic projects.</p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                {['Web Applications', 'Mobile Applications', 'REST APIs', 'Database Systems', 'Authentication Systems', 'Admin Dashboards', 'Student Portals', 'E-Commerce Systems', 'Deployment', 'Testing & Debugging', 'Performance Optimisation'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-slate-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span className="text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-[#0A0A0A] p-8 rounded-3xl border border-white/10">
              <h3 className="text-xl font-bold text-white mb-6">Technologies We Cover</h3>
              <div className="flex flex-wrap gap-3">
                {['HTML', 'CSS', 'JavaScript', 'React', 'Next.js', 'PHP', 'Laravel', 'Node.js', 'Python', 'Django', 'MySQL', 'MongoDB', 'PostgreSQL', 'AppwriteDB'].map((tech, i) => (
                  <span key={i} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-sm font-medium">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: RESEARCH WORKFLOW */}
        <section className="py-24 border-y border-white/5 bg-[#0A0A0A]">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">Your Project Journey</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-16">A proven step-by-step workflow for academic success.</p>
            
            <div className="max-w-3xl mx-auto space-y-4 relative">
              <div className="absolute left-[28px] md:left-1/2 top-4 bottom-4 w-0.5 bg-amber-500/20" />
              
              {[
                { emoji: "💡", title: "Idea Generation" },
                { emoji: "📋", title: "Topic Approval" },
                { emoji: "📝", title: "Proposal Writing" },
                { emoji: "📚", title: "Literature Review" },
                { emoji: "🔬", title: "Research Methodology" },
                { emoji: "📊", title: "System Analysis" },
                { emoji: "🎨", title: "System Design" },
                { emoji: "💻", title: "Software Development" },
                { emoji: "🧪", title: "Testing & Evaluation" },
                { emoji: "📄", title: "Documentation" },
                { emoji: "🎤", title: "Presentation" },
                { emoji: "🏆", title: "Viva Defence" }
              ].map((step, idx) => (
                <div key={idx} className="relative flex items-center md:justify-center">
                  <div className={`hidden md:block w-1/2 pr-12 text-right ${idx % 2 !== 0 ? 'md:hidden' : ''}`}>
                    {idx % 2 === 0 && <span className="text-lg font-bold text-slate-300">{step.title}</span>}
                  </div>
                  
                  <div className="w-14 h-14 shrink-0 rounded-full bg-[#0A0A0A] border-4 border-[#050505] shadow-[0_0_0_2px_rgba(245,158,11,0.2)] flex items-center justify-center text-xl z-10 mx-0 md:mx-auto">
                    {step.emoji}
                  </div>

                  <div className={`pl-6 md:pl-12 w-full md:w-1/2 text-left ${idx % 2 === 0 ? 'md:hidden' : ''}`}>
                    {(idx % 2 !== 0 || true) && <span className="text-lg font-bold text-slate-300 block md:inline">{step.title}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 5: WHY CHOOSE US */}
        <section className="py-24 max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">Why Choose Us</h2>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              'Experienced Academic Mentors', 'Practical Software Development Support', 'Industry-Standard Technologies', 
              'Personalised Consultations', 'Research Guidance', 'Project Management Support', 
              'Chapter Four Implementation Guidance', 'Flexible Online Learning', 'Career Development Advice', 
              'Student-Centred Approach'
            ].map((reason, i) => (
              <div key={i} className="flex items-start gap-3 p-6 bg-white/5 rounded-2xl border border-white/5 hover:border-amber-500/30 transition-colors">
                <CheckCircle className="w-6 h-6 text-amber-500 shrink-0" />
                <span className="font-medium text-slate-200">{reason}</span>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 6 & 7: TECHNOLOGIES AND STUDENT BENEFITS */}
        <section className="py-24 border-y border-white/5 bg-[#0A0A0A]">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-16">
            
            {/* Tech Tools */}
            <div>
              <h2 className="text-3xl font-bold text-white mb-8">Technologies & Tools</h2>
              <div className="space-y-6">
                <div>
                  <h4 className="text-amber-500 font-bold uppercase tracking-wider text-xs mb-3">Frontend</h4>
                  <p className="text-slate-300 text-sm">HTML5 • CSS3 • JavaScript • React • Next.js • Bootstrap • Tailwind CSS</p>
                </div>
                <div>
                  <h4 className="text-amber-500 font-bold uppercase tracking-wider text-xs mb-3">Backend</h4>
                  <p className="text-slate-300 text-sm">PHP • Laravel • Node.js • NestJS • Python • Django • Flask</p>
                </div>
                <div>
                  <h4 className="text-amber-500 font-bold uppercase tracking-wider text-xs mb-3">Database</h4>
                  <p className="text-slate-300 text-sm">MySQL • PostgreSQL • MongoDB • AppwriteDB</p>
                </div>
                <div>
                  <h4 className="text-amber-500 font-bold uppercase tracking-wider text-xs mb-3">Programming</h4>
                  <p className="text-slate-300 text-sm">Python • Java • JavaScript • PHP</p>
                </div>
                <div>
                  <h4 className="text-amber-500 font-bold uppercase tracking-wider text-xs mb-3">Tools</h4>
                  <p className="text-slate-300 text-sm">Git • GitHub • Docker • REST API • GraphQL</p>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-10 rounded-3xl border border-amber-500/20">
              <h2 className="text-3xl font-bold text-white mb-8">Student Benefits</h2>
              <ul className="space-y-4">
                {[
                  'Understand your project better', 'Improve software development skills', 'Build practical applications',
                  'Strengthen research knowledge', 'Complete projects on time', 'Prepare for presentations and viva',
                  'Build a professional portfolio', 'Get career-ready after graduation'
                ].map((benefit, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
            
          </div>
        </section>

        {/* SECTION 8: SUCCESS METRICS */}
        <section className="py-24 max-w-7xl mx-auto px-6 lg:px-12 text-center">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 border-b border-white/5 pb-24">
            {[
              { count: "1,000+", label: "Students Supported" },
              { count: "500+", label: "Projects Guided" },
              { count: "200+", label: "Software Solutions" },
              { count: "300+", label: "Mentorship Sessions" },
              { count: "20+", label: "Universities Supported" }
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-4xl lg:text-5xl font-black text-white mb-2">{stat.count}</div>
                <div className="text-sm font-medium text-amber-500 uppercase tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 9: TESTIMONIALS */}
        <section className="pb-24 max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">Student Testimonials</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "John D.", uni: "University of Ibadan", quote: "Excellent mentoring and practical guidance throughout my final-year project." },
              { name: "Sarah A.", uni: "Polytechnic Ibadan", quote: "The software implementation sessions helped me understand every stage of my project." },
              { name: "Michael O.", uni: "University of Lagos", quote: "The mentors explained difficult concepts clearly and professionally." }
            ].map((review, i) => (
              <div key={i} className="bg-white/5 p-8 rounded-3xl border border-white/10">
                <div className="flex gap-1 text-amber-500 mb-4">
                  {[1,2,3,4,5].map(star => <span key={star}>⭐</span>)}
                </div>
                <p className="text-slate-300 italic mb-6">"{review.quote}"</p>
                <div>
                  <div className="font-bold text-white">{review.name}</div>
                  <div className="text-xs text-slate-500">{review.uni}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 10 & 11: EXPERTS AND FAQS */}
        <section className="py-24 border-y border-white/5 bg-[#0A0A0A]">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-16">
            <div>
              <h2 className="text-4xl font-extrabold text-white mb-6">Meet Our Experts</h2>
              <p className="text-slate-400 mb-8">We focus on helping students understand their work and develop practical technical skills.</p>
              <div className="space-y-4">
                {['Academic Mentors', 'Software Engineers', 'UI/UX Designers', 'Database Specialists', 'Research Consultants'].map((expert, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 bg-white/5 rounded-xl">
                    <Users className="w-5 h-5 text-amber-500" />
                    <span className="text-white font-medium">{expert}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h2 className="text-3xl font-extrabold text-white mb-6">Frequently Asked Questions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm text-slate-400">
                <ul className="space-y-3 list-disc list-inside">
                  <li>How does the platform work?</li>
                  <li>Can you help choose a topic?</li>
                  <li>Support for Chapter Four?</li>
                  <li>Which technologies do you teach?</li>
                  <li>Online consultations available?</li>
                  <li>Do you assist with documentation?</li>
                  <li>Can you review my chapters?</li>
                </ul>
                <ul className="space-y-3 list-disc list-inside">
                  <li>Will I understand my project?</li>
                  <li>Is my information confidential?</li>
                  <li>Do you provide mentorship?</li>
                  <li>Can I access on mobile?</li>
                  <li>How much does it cost?</li>
                  <li>Do you prepare students for viva?</li>
                  <li>How do I get started?</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 12: REQUEST FORM / CALL TO ACTION */}
        <section id="request-form" className="py-32 max-w-5xl mx-auto px-6 lg:px-12">
          <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-10 md:p-16 rounded-[3rem] border border-amber-500/20 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />
            
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 relative z-10">Start Your Project the Right Way</h2>
            <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto relative z-10">
              Build your final-year project with confidence through expert guidance, practical software development support, and responsible academic mentoring.
            </p>

            <form onSubmit={handleSubmit} className="text-left bg-[#050505] p-8 rounded-3xl border border-white/10 relative z-10 max-w-3xl mx-auto space-y-6 shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4">Project Request Form</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">University / Institution</label>
                  <input required type="text" placeholder="e.g. University of Lagos" value={formData.universityName} onChange={e => setFormData({...formData, universityName: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Department</label>
                  <input required type="text" placeholder="Computer Science" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Degree Level</label>
                  <select aria-label="Degree" value={formData.degree} onChange={e => setFormData({...formData, degree: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 appearance-none">
                    <option value="BSc">BSc / BEng</option>
                    <option value="MSc">MSc / MEng</option>
                    <option value="PhD">PhD</option>
                    <option value="ND/HND">ND / HND</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Service Scope</label>
                  <select aria-label="Service Scope" value={formData.serviceScope} onChange={e => setFormData({...formData, serviceScope: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 appearance-none">
                    <option value="Full Package">Full Package (Code + Thesis)</option>
                    <option value="Code Only">Source Code & Deployment Only</option>
                    <option value="Documentation Only">Thesis Documentation Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Project Title</label>
                <input required type="text" placeholder="Enter your approved project topic" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Project Description / Abstract</label>
                <textarea required rows={4} placeholder="Briefly describe what the system is supposed to do..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"></textarea>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                  <input type="text" placeholder="John Doe" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                  <input type="email" placeholder="john@example.com" value={formData.clientEmail} onChange={e => setFormData({...formData, clientEmail: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Phone Number</label>
                  <input type="tel" placeholder="+234..." value={formData.clientPhone} onChange={e => setFormData({...formData, clientPhone: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-[0_0_30px_-10px_rgba(245,158,11,0.5)] disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ClipboardList className="w-5 h-5" />}
                  Submit Project Request
                </button>
                <button 
                  type="button"
                  onClick={() => setIsConsultationModalOpen(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-4 px-8 rounded-xl transition-all"
                >
                  Book Free Consultation
                </button>
              </div>
            </form>
          </div>
        </section>

      </main>

      {/* Consultation Modal */}
      <ConsultationModal 
        isOpen={isConsultationModalOpen} 
        onClose={() => setIsConsultationModalOpen(false)} 
      />

      {/* SECTION 13: FOOTER */}
      <Footer />
    </div>
  );
}
