const Submission = require('../models/Submission');

function computeStreak(acceptedSubs) {
  if (!acceptedSubs.length) return 0;
  const days = new Set(acceptedSubs.map((s) => new Date(s.submittedAt).toDateString()));
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (days.has(d.toDateString())) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

exports.computeOverview = async (userId) => {
  const subs = await Submission.find({ userId }).lean();
  const total = subs.length;
  const accepted = subs.filter((s) => s.verdict === 'OK');
  const uniqueSolved = new Set(accepted.map((s) => s.problemId));

  return {
    totalSubmissions: total,
    totalSolved: uniqueSolved.size,
    accuracy: total ? Math.round((accepted.length / total) * 100) : 0,
    currentStreak: computeStreak(accepted)
  };
};

exports.computeTagMastery = async (userId) => {
  const subs = await Submission.find({ userId }).lean();
  const attemptedProblems = {};
  const solvedProblems = new Set();

  for (const sub of subs) {
    if (!attemptedProblems[sub.problemId]) {
      attemptedProblems[sub.problemId] = sub.problemTags || [];
    }
    if (sub.verdict === 'OK') solvedProblems.add(sub.problemId);
  }

  const tagStats = {};
  for (const [pid, tags] of Object.entries(attemptedProblems)) {
    for (const tag of tags) {
      if (!tagStats[tag]) tagStats[tag] = { attempted: 0, solved: 0 };
      tagStats[tag].attempted++;
      if (solvedProblems.has(pid)) tagStats[tag].solved++;
    }
  }

  return Object.entries(tagStats)
    .map(([tag, { attempted, solved }]) => ({
      tag,
      attempted,
      solved,
      accuracy: attempted ? Math.round((solved / attempted) * 100) : 0
    }))
    .sort((a, b) => b.solved - a.solved);
};

exports.computeRatingDistribution = async (userId) => {
  const subs = await Submission.find({ userId, verdict: 'OK' }).lean();
  const seen = new Set();
  const buckets = {};
  for (const sub of subs) {
    if (seen.has(sub.problemId) || !sub.problemRating) continue;
    seen.add(sub.problemId);
    const bucket = Math.floor(sub.problemRating / 100) * 100;
    buckets[bucket] = (buckets[bucket] || 0) + 1;
  }
  return Object.entries(buckets)
    .map(([rating, count]) => ({ rating: parseInt(rating, 10), count }))
    .sort((a, b) => a.rating - b.rating);
};

exports.computeTimeline = async (userId, weeks = 12) => {
  const subs = await Submission.find({ userId, verdict: 'OK' }).lean();
  const weekData = {};

  const now = new Date();
  const startWeek = new Date(now);
  startWeek.setDate(now.getDate() - weeks * 7);

  const seen = new Set();
  for (const sub of subs) {
    if (seen.has(sub.problemId)) continue;
    seen.add(sub.problemId);
    const d = new Date(sub.submittedAt);
    if (d < startWeek) continue;
    const weekStart = getWeekStart(d);
    const key = weekStart.toISOString().slice(0, 10);
    weekData[key] = (weekData[key] || 0) + 1;
  }

  const result = [];
  for (let i = 0; i < weeks; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - (weeks - 1 - i) * 7);
    const weekStart = getWeekStart(d);
    const key = weekStart.toISOString().slice(0, 10);
    result.push({ week: key, count: weekData[key] || 0 });
  }
  return result;
};

exports.getWeakTags = async (userId, minAttempts = 5, limit = 3) => {
  const mastery = await exports.computeTagMastery(userId);
  return mastery
    .filter((m) => m.attempted >= minAttempts)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, limit);
};

exports.getSolvedProblemIds = async (userId) => {
  const subs = await Submission.find({ userId, verdict: 'OK' }).select('problemId').lean();
  return new Set(subs.map((s) => s.problemId));
};
