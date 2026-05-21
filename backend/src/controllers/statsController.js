const stats = require('../services/statsService');

exports.overview = async (req, res) => {
  try {
    const data = await stats.computeOverview(req.userId);
    const weakTags = await stats.getWeakTags(req.userId, 3, 1);
    res.json({ ...data, topWeakTag: weakTags[0]?.tag || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.tagMastery = async (req, res) => {
  try {
    const tags = await stats.computeTagMastery(req.userId);
    res.json({ tags });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.weakAreas = async (req, res) => {
  try {
    const tags = await stats.getWeakTags(req.userId, 3, 3);
    res.json({ tags });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.ratingDistribution = async (req, res) => {
  try {
    const buckets = await stats.computeRatingDistribution(req.userId);
    res.json({ buckets });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.timeline = async (req, res) => {
  try {
    const timeline = await stats.computeTimeline(req.userId, 12);
    res.json({ timeline });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
