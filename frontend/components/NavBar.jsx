'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Code2, LayoutDashboard, Calendar, Sparkles, LogOut } from 'lucide-react';
import { logout } from '@/lib/auth';

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/contests', label: 'Contests', icon: Calendar },
  { href: '/mentor', label: 'AI Mentor', icon: Sparkles }
];

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav className="flex items-center justify-between mb-10 flex-wrap gap-3">
      <Link href="/dashboard" className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-lavender-400 to-blush-300 flex items-center justify-center shadow-soft">
          <Code2 className="w-5 h-5 text-white" />
        </div>
        <span className="font-display font-bold text-xl">CodeProgressX</span>
      </Link>

      <div className="flex items-center gap-1 bg-white/60 rounded-full p-1 border border-white">
        {links.map((l) => {
          const active = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-full text-sm font-medium transition ${
                active
                  ? 'bg-gradient-to-r from-lavender-400 to-blush-300 text-white shadow-soft'
                  : 'text-gray-600 hover:text-lavender-500'
              }`}
            >
              <l.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{l.label}</span>
            </Link>
          );
        })}
      </div>

      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-white text-sm text-gray-700 hover:text-blush-400 hover:border-blush-200 transition"
      >
        <LogOut className="w-4 h-4" />
        <span className="hidden sm:inline">Log out</span>
      </button>
    </nav>
  );
}
