'use client';

import { Activity } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export default function ProgressChart({ data }) {
  const chartData = (data || []).map((d) => ({
    ...d,
    label: new Date(d.week).toLocaleDateString('en', { month: 'short', day: 'numeric' })
  }));
  const hasData = chartData.some((d) => d.count > 0);

  return (
    <div className="glass-card rounded-3xl p-6 md:p-7 shadow-soft h-full">
      <div className="flex items-center gap-2 mb-5">
        <Activity className="w-5 h-5 text-peach-400" />
        <h3 className="font-display font-bold text-lg">Solved per Week</h3>
      </div>
      {!hasData ? (
        <p className="text-sm text-gray-500 text-center py-16">
          Sync submissions to see your weekly progress.
        </p>
      ) : (
        <div style={{ height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#C084FC" />
                  <stop offset="100%" stopColor="#FDA4AF" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3E8FF" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(255,255,255,0.95)',
                  border: '1px solid #E9D5FF',
                  borderRadius: '12px',
                  fontSize: '12px',
                  boxShadow: '0 4px 24px -8px rgba(168, 85, 247, 0.18)'
                }}
                labelStyle={{ color: '#6B7280' }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="url(#lineGrad)"
                strokeWidth={3}
                dot={{ fill: '#C084FC', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
