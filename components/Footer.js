import Link from 'next/link';

export default function Footer() {
  const platforms = [
    { name: 'Facebook & Threads', feature: 'Skill Feeds, Updates & Reactions', href: '/feed' },
    { name: 'LinkedIn', feature: 'Endorsements & Mastered Skills', href: '/skills' },
    { name: 'YouTube & Classroom', feature: 'Interactive Live Peer Workshops', href: '/sessions' },
    { name: 'Instagram & TikTok', feature: '60s Vertical Skill Reels', href: '/reels' },
    { name: 'WhatsApp & Telegram', feature: 'Real-time Study Pod Chat', href: '/chat' },
    { name: 'Reddit', feature: 'Skill Sub-Communities & Q&A', href: '/community' },
    { name: 'Pinterest', feature: 'Architecture & Design Pinboards', href: '/pins' },
    { name: 'X (Twitter)', feature: 'Bite-Sized Code Droplets & Tips', href: '/droplets' },
    { name: 'Snapchat', feature: 'Daily Learning Streak Stories', href: '/feed' },
  ];

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                SS
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">SkillShikhi</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Synthesizing 14 major social media platforms into a cohesive peer-to-peer skill sharing & collaborative learning ecosystem.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Vercel Free-Tier & Serverless Optimized
              </span>
            </div>
          </div>

          {/* Social Platforms Matrix */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              The 14 Social Paradigms of SkillShikhi
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {platforms.map((p, idx) => (
                <Link
                  key={idx}
                  href={p.href}
                  className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-800/80 hover:border-indigo-500/50 transition group"
                >
                  <div className="font-semibold text-slate-200 group-hover:text-indigo-300 transition">
                    {p.name}
                  </div>
                  <div className="text-[11px] text-slate-400">{p.feature}</div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recruiter & Tech Stack Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Recruiter & Tech Spec
            </h4>
            <ul className="text-xs space-y-2 text-slate-400">
              <li>⚡ <strong>Next.js 15:</strong> App Router architecture</li>
              <li>⚛️ <strong>React 19:</strong> Modern hooks & client hydration</li>
              <li>🛡️ <strong>Resilient Fallback:</strong> Zero 500 crashes</li>
              <li>📁 <strong>Ephemeral Safe:</strong> No server file write traps</li>
              <li>🎨 <strong>Tailwind & CSS:</strong> Glassmorphism SaaS UI</li>
            </ul>

            <div className="pt-3">
              <a
                href="https://github.com/mohiuddin-khan-shiam/SkillShikhi"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-xs text-indigo-300 hover:text-white bg-indigo-950/80 border border-indigo-700/60 px-3 py-1.5 rounded-lg transition"
              >
                <span>⭐ GitHub Repository</span>
                <span>↗</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            Built with passion by <strong>S. M. Mohiuddin Khan Shiam</strong> for recruiter showcase.
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="text-indigo-400 hover:underline">
              Admin Hub
            </Link>
            <Link href="/login" className="hover:text-slate-300">
              Member Sign In
            </Link>
            <Link href="/feed" className="hover:text-slate-300">
              Live Feed
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
