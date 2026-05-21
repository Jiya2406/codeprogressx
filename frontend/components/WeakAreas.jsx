import { AlertCircle } from 'lucide-react';

export default function WeakAreas({ tags }) {
  const weak = tags || [];
  return (
    <div className="glass-card rounded-3xl p-6 md:p-7 shadow-soft h-full">
      <div className="flex items-center gap-2 mb-5">
        <AlertCircle className="w-5 h-5 text-blush-400" />
        <h3 className="font-display font-bold text-lg">Weak Areas</h3>
      </div>
      {weak.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8">
          Solve more problems in varied tags to detect weak areas.
        </p>
      ) : (
        <div className="space-y-3">
          {weak.map((t) => (
            <div
              key={t.tag}
              className="flex items-center justify-between p-3.5 rounded-xl bg-blush-50 border border-blush-100"
            >
              <div>
                <div className="font-medium text-gray-800 capitalize">{t.tag}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {t.solved} solved out of {t.attempted} attempted
                </div>
              </div>
              <div className="font-display text-xl font-bold text-blush-400">{t.accuracy}%</div>
            </div>
          ))}
          <p className="text-xs text-gray-500 pt-2">
            💡 Focus on these topics. Recommended problems below target your weakest areas.
          </p>
        </div>
      )}
    </div>
  );
}
