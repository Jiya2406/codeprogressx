'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, Bell, BellOff, ExternalLink, RefreshCw } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { getToken, logout } from '@/lib/auth';
import NavBar from '@/components/NavBar';

function formatRelative(iso) {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff < 0) return 'started';
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `in ${days}d ${hours % 24}h`;
  if (hours > 0) return `in ${hours}h ${mins % 60}m`;
  return `in ${mins}m`;
}

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}

function formatStartTime(iso) {
  return new Date(iso).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

export default function ContestsPage() {
  const router = useRouter();
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);
  const [error, setError] = useState('');
  const [reminderInfo, setReminderInfo] = useState('');

  const load = async () => {
    try {
      const token = getToken();
      if (!token) {
        router.push('/login');
        return;
      }
      const data = await apiFetch('/contests', { token });
      setContests(data.contests);
    } catch (err) {
      if (err.message.toLowerCase().includes('token')) {
        logout();
        router.push('/login');
        return;
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleReminder = async (contest) => {
    setTogglingId(contest.id);
    setError('');
    setReminderInfo('');
    try {
      const token = getToken();
      if (contest.reminderSet) {
        await apiFetch(`/contests/${contest.id}/remind`, { method: 'DELETE', token });
        setReminderInfo(`Reminder removed for "${contest.name}"`);
      } else {
        await apiFetch(`/contests/${contest.id}/remind`, { method: 'POST', token });
        setReminderInfo(`Reminder set — you'll get an email 1 hour before "${contest.name}"`);
      }
      setContests((cs) =>
        cs.map((c) => (c.id === contest.id ? { ...c, reminderSet: !c.reminderSet } : c))
      );
      setTimeout(() => setReminderInfo(''), 6000);
    } catch (err) {
      setError(err.message);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <main className="min-h-screen max-w-5xl mx-auto px-6 md:px-10 py-6 md:py-10">
      <NavBar />

      <div className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-2">Upcoming Contests</h1>
        <p className="text-gray-600 text-sm md:text-base">
          Click <span className="font-semibold text-lavender-500">"Remind me"</span> on any contest —
          we'll email you exactly <span className="font-semibold">1 hour before</span> it starts.
        </p>
      </div>

      {reminderInfo && (
        <div className="text-sm text-mint-400 bg-mint-50 px-4 py-3 mb-6 rounded-xl border border-mint-100 flex items-center gap-2">
          <Bell className="w-4 h-4" /> {reminderInfo}
        </div>
      )}

      {error && (
        <div className="text-sm text-blush-400 bg-blush-50 px-4 py-2.5 mb-6 rounded-xl border border-blush-100">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-gray-500">
          <RefreshCw className="w-4 h-4 animate-spin" /> Loading contests…
        </div>
      ) : contests.length === 0 ? (
        <div className="glass-card rounded-3xl p-10 shadow-soft text-center">
          <Calendar className="w-12 h-12 text-lavender-400 mx-auto mb-3" />
          <p className="text-gray-600">No upcoming contests right now. Check back later!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {contests.map((c) => (
            <div
              key={c.id}
              className="glass-card rounded-2xl p-5 md:p-6 shadow-soft flex flex-col md:flex-row md:items-center gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-lavender-100 text-lavender-500 text-xs font-semibold">
                    {c.type}
                  </span>
                  <span className="text-xs text-mint-400 font-semibold">
                    {formatRelative(c.startTime)}
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg md:text-xl text-gray-800 mb-1">
                  {c.name}
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> {formatStartTime(c.startTime)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {formatDuration(c.durationSeconds)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={c.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-white/70 border border-lavender-100 text-sm font-medium text-gray-700 hover:bg-lavender-50 transition flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open
                </a>
                <button
                  onClick={() => toggleReminder(c)}
                  disabled={togglingId === c.id}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-1.5 disabled:opacity-50 ${
                    c.reminderSet
                      ? 'bg-mint-100 text-mint-400 hover:bg-mint-200'
                      : 'bg-gradient-to-r from-lavender-400 to-blush-300 text-white shadow-soft hover:shadow-glow'
                  }`}
                >
                  {c.reminderSet ? (
                    <>
                      <Bell className="w-3.5 h-3.5" /> Reminder on
                    </>
                  ) : (
                    <>
                      <BellOff className="w-3.5 h-3.5" /> Remind me
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
