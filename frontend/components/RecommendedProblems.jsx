import { Sparkles, ExternalLink, RefreshCw } from 'lucide-react';

export default function RecommendedProblems({ problems, onRefresh, loading }) {
  return (
    <div className="glass-card rounded-3xl p-6 md:p-7 shadow-soft h-full">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-mint-400" />
          <h3 className="font-display font-bold text-lg">Recommended for You</h3>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-1 text-xs font-medium text-lavender-500 hover:text-lavender-600 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>
      {!problems || problems.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8">
          Sync submissions to get personalized problem recommendations.
        </p>
      ) : (
        <div className="space-y-2.5">
          {problems.map((p) => (
            <a
              key={p.problemId}
              href={p.url}
              target="_blank"
              rel="noreferrer"
              className="block p-3.5 rounded-xl bg-white/60 border border-mint-100 hover:bg-mint-50 hover:border-mint-200 transition group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="font-medium text-gray-800 text-sm group-hover:text-mint-400 transition">
                  {p.name}
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-mint-400 transition" />
              </div>
              <div className="flex items-center gap-2 text-xs flex-wrap">
                <span className="px-2 py-0.5 rounded-full bg-lavender-100 text-lavender-500 font-semibold">
                  {p.rating}
                </span>
                {p.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="text-gray-500 capitalize">
                    {tag}
                  </span>
                ))}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
