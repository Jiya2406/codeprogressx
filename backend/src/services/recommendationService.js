const cf = require('./codeforcesService');
const stats = require('./statsService');
const User = require('../models/User');

exports.recommend = async (userId, limit = 5) => {
  const user = await User.findById(userId).lean();
  if (!user) return [];

  const userRating = user.cfData?.rating || 1200;
  const weakTags = await stats.getWeakTags(userId, 3, 5);
  const weakTagSet = new Set(weakTags.map((t) => t.tag));
  const solved = await stats.getSolvedProblemIds(userId);

  const allProblems = await cf.fetchProblemset();

  const candidates = allProblems.filter((p) => {
    if (!p.rating || !p.contestId) return false;
    const pid = `${p.contestId}${p.index}`;
    if (solved.has(pid)) return false;
    if (p.rating < userRating - 200 || p.rating > userRating + 300) return false;
    if (weakTagSet.size > 0) {
      const matches = (p.tags || []).some((t) => weakTagSet.has(t));
      if (!matches) return false;
    }
    return true;
  });

  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  return candidates.slice(0, limit).map((p) => ({
    problemId: `${p.contestId}${p.index}`,
    name: p.name,
    rating: p.rating,
    tags: p.tags || [],
    url: `https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`
  }));
};
