import { Trophy } from 'lucide-react';

export default function MasteryMeter({ tags }) {
  const top = (tags || []).slice(0, 8);
  return (
    <div className="glass-card rounded-3xl p-6 md:p-7 shadow-soft h-full">
      <div className="flex items-center gap-2 mb-5">
        <Trophy className="w-5 h-5 text-lavender-400" />
        <h3 className="font-display font-bold text-lg">Tag Mastery</h3>
      </div>
      {top.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8">
          Sync submissions to see your tag mastery.
        </p>
      ) : (
        <div className="space-y-3.5">
          {top.map((t) => (
            <div key={t.tag}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700 capitalize">{t.tag}</span>
                <span className="text-gray-500">
                  {t.solved}/{t.attempted} · {t.accuracy}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-lavender-50 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-lavender-300 to-blush-300 transition-all"
                  style={{ width: `${Math.min(100, t.accuracy)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
