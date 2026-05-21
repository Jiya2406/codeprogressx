const Goal = require('../models/Goal');
const User = require('../models/User');
const stats = require('../services/statsService');

function autoTitle(type, target, tag) {
  if (type === 'rating') return `Reach rating ${target}`;
  if (type === 'solved') return `Solve ${target} problems`;
  if (type === 'tag') return `Solve ${target} ${tag} problems`;
  return 'Goal';
}

exports.listGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.userId }).sort({ createdAt: -1 }).lean();
    const user = await User.findById(req.userId).lean();
    const overview = await stats.computeOverview(req.userId);
    const mastery = await stats.computeTagMastery(req.userId);

    const enriched = goals.map((g) => {
      let current = 0;
      if (g.type === 'rating') current = user?.cfData?.rating || 0;
      else if (g.type === 'solved') current = overview.totalSolved;
      else if (g.type === 'tag') current = mastery.find((m) => m.tag === g.tag)?.solved || 0;
      return { ...g, current };
    });

    res.json({ goals: enriched });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createGoal = async (req, res) => {
  try {
    const { type, target, tag, title, deadline } = req.body;
    if (!type || !target) return res.status(400).json({ error: 'Type and target are required' });
    if (type === 'tag' && !tag) return res.status(400).json({ error: 'Tag is required for tag-type goals' });

    const goal = await Goal.create({
      userId: req.userId,
      type,
      target: Number(target),
      tag: type === 'tag' ? tag.toLowerCase() : undefined,
      title: title || autoTitle(type, target, tag),
      deadline: deadline ? new Date(deadline) : undefined
    });
    res.status(201).json({ goal });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteGoal = async (req, res) => {
  try {
    await Goal.deleteOne({ _id: req.params.id, userId: req.userId });
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
