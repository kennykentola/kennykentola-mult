'use client';

const techs = [
  { name: 'React', cat: 'Frontend' },
  { name: 'Next.js', cat: 'Frontend' },
  { name: 'Vue.js', cat: 'Frontend' },
  { name: 'Node.js', cat: 'Backend' },
  { name: 'Python / Django', cat: 'Backend' },
  { name: 'Go', cat: 'Backend' },
  { name: 'React Native', cat: 'Mobile' },
  { name: 'Flutter', cat: 'Mobile' },
  { name: 'PostgreSQL', cat: 'Database' },
  { name: 'MongoDB', cat: 'Database' },
  { name: 'AWS', cat: 'Cloud' },
  { name: 'Appwrite', cat: 'Cloud' },
];

export function Technologies() {
  return (
    <section className="py-20 bg-[#050505] overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
        <h2 className="text-2xl font-bold text-white">The Tech Stack We Master</h2>
      </div>
      
      {/* Infinite Scroll Marquee */}
      <div className="relative flex overflow-x-hidden group">
        <div className="py-4 animate-marquee whitespace-nowrap flex items-center gap-8">
          {[...techs, ...techs, ...techs].map((tech, i) => (
            <div key={i} className="px-6 py-3 rounded-full border border-white/10 bg-white/5 flex items-center gap-3">
              <span className="text-white font-bold">{tech.name}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              <span className="text-xs text-slate-400 uppercase tracking-widest">{tech.cat}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
