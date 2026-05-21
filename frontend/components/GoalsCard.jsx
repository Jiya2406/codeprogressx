'use client';

import { useState } from 'react';
import { Target, Plus, X } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { getToken } from '@/lib/auth';

export default function GoalsCard({ goals, onChange }) {
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState('rating');
  const [target, setTarget] = useState('');
  const [tag, setTag] = useState('dp');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const createGoal = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await apiFetch('/goals', {
        method: 'POST',
        token: getToken(),
        body: { type, target: Number(target), tag: type === 'tag' ? tag : undefined }
      });
      setShowForm(false);
      setTarget('');
      onChange?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteGoal = async (id) => {
    await apiFetch(`/goals/${id}`, { method: 'DELETE', token: getToken() });
    onChange?.();
  };

  return (
    <div className="glass-card rounded-3xl p-6 md:p-7 shadow-soft">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-mint-400" />
          <h3 className="font-display font-bold text-lg">Your Goals</h3>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full bg-mint-100 text-mint-400 hover:bg-mint-200 transition"
        >
          {showForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {showForm ? 'Cancel' : 'New goal'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={createGoal} className="bg-white/60 rounded-2xl p-4 mb-5 space-y-3 border border-mint-100">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-white border border-mint-100 text-sm focus:outline-none focus:ring-2 focus:ring-mint-200"
          >
            <option value="rating">Reach a rating</option>
            <option value="solved">Solve N problems total</option>
            <option value="tag">Solve N problems in a tag</option>
          </select>
          {type === 'tag' && (
            <input
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value.toLowerCase())}
              placeholder="e.g. dp, greedy, graphs"
              className="w-full px-3 py-2.5 rounded-xl bg-white border border-mint-100 text-sm focus:outline-none focus:ring-2 focus:ring-mint-200"
            />
          )}
          <input
            type="number"
            required
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder={type === 'rating' ? 'Target rating (e.g. 1400)' : 'Target count'}
            className="w-full px-3 py-2.5 rounded-xl bg-white border border-mint-100 text-sm focus:outline-none focus:ring-2 focus:ring-mint-200"
          />
          {error && <div className="text-xs text-blush-400">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-mint-300 to-mint-400 text-white text-sm font-semibold shadow-soft hover:shadow-glow transition disabled:opacity-60"
          >
            {loading ? 'Creating…' : 'Create goal'}
          </button>
        </form>
      )}

      {(goals || []).length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-6">
          No goals yet. Click "New goal" to set your first one.
        </p>
      ) : (
        <div className="space-y-4">
          {goals.map((g) => {
            const pct = Math.min(100, Math.round((g.current / g.target) * 100));
            const done = pct >= 100;
            return (
              <div key={g._id} className="group">
                <div className="flex justify-between items-baseline text-sm mb-1.5">
                  <span className="text-gray-700 font-medium">
                    {g.title} {done && <span className="text-mint-400">✓</span>}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-xs">
                      {g.current}/{g.target}
                    </span>
                    <button
                      onClick={() => deleteGoal(g._id)}
                      className="text-gray-300 hover:text-blush-400 transition opacity-0 group-hover:opacity-100"
                      aria-label="Delete goal"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-mint-50 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      done
                        ? 'bg-gradient-to-r from-mint-400 to-mint-300'
                        : 'bg-gradient-to-r from-lavender-300 to-mint-300'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
