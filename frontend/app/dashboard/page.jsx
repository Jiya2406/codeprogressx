'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Code2,
  RefreshCw,
  Trophy,
  CheckCircle2,
  AlertCircle,
  Flame,
  ExternalLink,
  Pencil,
  Check,
  X
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { getToken, logout } from '@/lib/auth';
import NavBar from '@/components/NavBar';
import StatTile from '@/components/StatTile';
import MasteryMeter from '@/components/MasteryMeter';
import WeakAreas from '@/components/WeakAreas';
import RecommendedProblems from '@/components/RecommendedProblems';
import ProgressChart from '@/components/ProgressChart';
import GoalsCard from '@/components/GoalsCard';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [handle, setHandle] = useState('');
  const [overview, setOverview] = useState(null);
  const [tagMastery, setTagMastery] = useState([]);
  const [weakAreas, setWeakAreas] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState({ link: false, sync: false, rec: false, change: false });
  const [error, setError] = useState('');
  const [syncStatus, setSyncStatus] = useState('');
  const [editingHandle, setEditingHandle] = useState(false);
  const [newHandle, setNewHandle] = useState('');

  const loadAll = useCallback(async (token) => {
    const [u, ov, tags, weak, rec, tl, gs] = await Promise.all([
      apiFetch('/user/me', { token }),
      apiFetch('/stats/overview', { token }).catch(() => null),
      apiFetch('/stats/tags', { token }).catch(() => ({ tags: [] })),
      apiFetch('/stats/weak', { token }).catch(() => ({ tags: [] })),
      apiFetch('/recommendations', { token }).catch(() => ({ problems: [] })),
      apiFetch('/stats/timeline', { token }).catch(() => ({ timeline: [] })),
      apiFetch('/goals', { token }).catch(() => ({ goals: [] }))
    ]);
    setUser(u.user);
    setOverview(ov);
    setTagMastery(tags.tags || []);
    setWeakAreas(weak.tags || []);
    setRecommendations(rec.problems || []);
    setTimeline(tl.timeline || []);
    setGoals(gs.goals || []);
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }
    loadAll(token).catch(() => {
      logout();
      router.push('/login');
    });
  }, [router, loadAll]);

  const linkHandle = async (e) => {
    e.preventDefault();
    setError('');
    setLoading((l) => ({ ...l, link: true }));
    try {
      const data = await apiFetch('/user/codeforces', {
        method: 'POST',
        token: getToken(),
        body: { handle }
      });
      setUser(data.user);
      setHandle('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading((l) => ({ ...l, link: false }));
    }
  };

  const changeHandle = async (e) => {
    e.preventDefault();
    if (!newHandle.trim() || newHandle.trim() === user.cfHandle) {
      setEditingHandle(false);
      return;
    }
    setError('');
    setLoading((l) => ({ ...l, change: true }));
    try {
      const data = await apiFetch('/user/codeforces', {
        method: 'POST',
        token: getToken(),
        body: { handle: newHandle.trim() }
      });
      setUser(data.user);
      setEditingHandle(false);
      setNewHandle('');
      setOverview(null);
      setTagMastery([]);
      setWeakAreas([]);
      setRecommendations([]);
      setTimeline([]);
      setSyncStatus('Handle changed — click Sync to load new data');
      setTimeout(() => setSyncStatus(''), 6000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading((l) => ({ ...l, change: false }));
    }
  };

  const syncSubmissions = async () => {
    setError('');
    setSyncStatus('Fetching from Codeforces…');
    setLoading((l) => ({ ...l, sync: true }));
    try {
      const result = await apiFetch('/sync', { method: 'POST', token: getToken() });
      setSyncStatus(`Synced ${result.total} submissions ✓`);
      await loadAll(getToken());
      setTimeout(() => setSyncStatus(''), 4000);
    } catch (err) {
      setError(err.message);
      setSyncStatus('');
    } finally {
      setLoading((l) => ({ ...l, sync: false }));
    }
  };

  const refreshRecommendations = async () => {
    setLoading((l) => ({ ...l, rec: true }));
    try {
      const data = await apiFetch('/recommendations', { token: getToken() });
      setRecommendations(data.problems);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading((l) => ({ ...l, rec: false }));
    }
  };

  const refreshGoals = async () => {
    const data = await apiFetch('/goals', { token: getToken() });
    setGoals(data.goals);
  };

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500 flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" /> Loading…
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen max-w-7xl mx-auto px-6 md:px-10 py-6 md:py-10">
      <NavBar />

      <div className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-2 break-words">
          Hi, {user.name || user.email.split('@')[0]} 👋
        </h1>
        <p className="text-gray-600 text-sm md:text-base">Here's your Codeforces overview.</p>
      </div>

      {!user.cfHandle ? (
        <div className="glass-card rounded-3xl p-8 md:p-10 shadow-soft text-center max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-lavender-100 flex items-center justify-center mx-auto mb-5">
            <Code2 className="w-8 h-8 text-lavender-400" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">Link your Codeforces handle</h2>
          <p className="text-gray-600 mb-6">
            Connect your account to start tracking your progress.
          </p>
          <form onSubmit={linkHandle} className="flex gap-2">
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="e.g. tourist"
              className="flex-1 px-4 py-3 rounded-xl bg-white/70 border border-lavender-100 focus:border-lavender-300 focus:outline-none focus:ring-2 focus:ring-lavender-200 transition placeholder:text-gray-400"
            />
            <button
              type="submit"
              disabled={loading.link || !handle.trim()}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-lavender-400 to-blush-300 text-white font-semibold shadow-soft hover:shadow-glow transition disabled:opacity-60"
            >
              {loading.link ? 'Linking…' : 'Link'}
            </button>
          </form>
          {error && (
            <div className="text-sm text-blush-400 bg-blush-50 px-4 py-2.5 mt-4 rounded-xl border border-blush-100">
              {error}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="glass-card rounded-3xl p-5 md:p-7 shadow-soft mb-6 md:mb-8 flex flex-col md:flex-row items-center gap-4 md:gap-6">
            {user.cfData?.titlePhoto ? (
              <img
                src={user.cfData.titlePhoto}
                alt={user.cfHandle}
                className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover border-2 border-white shadow-soft"
              />
            ) : (
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-lavender-100 flex items-center justify-center">
                <Code2 className="w-10 h-10 text-lavender-400" />
              </div>
            )}
            <div className="flex-1 text-center md:text-left w-full">
              <div className="text-sm text-gray-500 mb-1">Codeforces handle</div>
              {editingHandle ? (
                <form onSubmit={changeHandle} className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                  <input
                    type="text"
                    autoFocus
                    value={newHandle}
                    onChange={(e) => setNewHandle(e.target.value)}
                    placeholder={user.cfHandle}
                    className="flex-1 px-3 py-2 rounded-xl bg-white border border-lavender-200 focus:border-lavender-400 focus:outline-none focus:ring-2 focus:ring-lavender-200 transition text-lg font-display font-semibold"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={loading.change}
                      className="px-3 py-2 rounded-xl bg-gradient-to-r from-lavender-400 to-blush-300 text-white font-medium shadow-soft disabled:opacity-60 flex items-center gap-1"
                    >
                      <Check className="w-4 h-4" /> {loading.change ? 'Saving…' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingHandle(false);
                        setNewHandle('');
                        setError('');
                      }}
                      className="px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <a
                    href={`https://codeforces.com/profile/${user.cfHandle}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 font-display text-2xl md:text-3xl font-bold text-gray-800 hover:text-lavender-500 transition"
                  >
                    {user.cfHandle}
                    <ExternalLink className="w-4 h-4 opacity-60" />
                  </a>
                  <button
                    onClick={() => {
                      setNewHandle(user.cfHandle);
                      setEditingHandle(true);
                    }}
                    title="Change handle"
                    className="p-1.5 rounded-lg text-gray-400 hover:text-lavender-500 hover:bg-lavender-50 transition"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
              )}
              <div className="text-sm text-gray-500 capitalize mt-1">
                {user.cfData?.rank || 'unrated'}
              </div>
            </div>
            <div className="flex flex-col items-stretch md:items-end gap-2">
              <button
                onClick={syncSubmissions}
                disabled={loading.sync}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-lavender-400 to-blush-300 text-white text-sm font-semibold shadow-soft hover:shadow-glow disabled:opacity-60 transition"
              >
                <RefreshCw className={`w-4 h-4 ${loading.sync ? 'animate-spin' : ''}`} />
                {loading.sync ? 'Syncing…' : 'Sync submissions'}
              </button>
              {syncStatus && (
                <div className="text-xs text-mint-400 text-center md:text-right">{syncStatus}</div>
              )}
            </div>
          </div>

          {error && (
            <div className="text-sm text-blush-400 bg-blush-50 px-4 py-2.5 mb-6 rounded-xl border border-blush-100">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 mb-6">
            <StatTile
              icon={Trophy}
              bgClass="bg-lavender-100"
              iconClass="text-lavender-400"
              label="Current rating"
              value={user.cfData?.rating || 'Unrated'}
              subtle={`Max ${user.cfData?.maxRating || '—'}`}
            />
            <StatTile
              icon={CheckCircle2}
              bgClass="bg-mint-100"
              iconClass="text-mint-400"
              label="Problems solved"
              value={overview?.totalSolved ?? '—'}
              subtle={overview ? `${overview.accuracy}% accuracy` : 'Sync to see'}
            />
            <StatTile
              icon={Flame}
              bgClass="bg-peach-100"
              iconClass="text-peach-400"
              label="Current streak"
              value={overview?.currentStreak ? `${overview.currentStreak}d` : '—'}
              subtle="Days in a row"
            />
            <StatTile
              icon={AlertCircle}
              bgClass="bg-blush-100"
              iconClass="text-blush-400"
              label="Top weak area"
              value={
                overview?.topWeakTag ? (
                  <span className="capitalize">{overview.topWeakTag}</span>
                ) : (
                  '—'
                )
              }
              subtle="Focus here"
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-5 mb-5">
            <ProgressChart data={timeline} />
            <RecommendedProblems
              problems={recommendations}
              onRefresh={refreshRecommendations}
              loading={loading.rec}
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-5 mb-5">
            <MasteryMeter tags={tagMastery} />
            <WeakAreas tags={weakAreas} />
          </div>

          <div className="mb-10">
            <GoalsCard goals={goals} onChange={refreshGoals} />
          </div>
        </>
      )}
    </main>
  );
}
