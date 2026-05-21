const User = require('../models/User');
const Submission = require('../models/Submission');
const cf = require('../services/codeforcesService');

const buildCfData = (info) => ({
  rating: info.rating || 0,
  maxRating: info.maxRating || 0,
  rank: info.rank || 'unrated',
  maxRank: info.maxRank || 'unrated',
  avatar: info.avatar,
  titlePhoto: info.titlePhoto,
  contribution: info.contribution || 0,
  lastFetched: new Date()
});

exports.me = async (req, res) => {
  const user = await User.findById(req.userId).select('-passwordHash');
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
};

exports.linkCodeforces = async (req, res) => {
  try {
    const { handle } = req.body;
    if (!handle || !handle.trim()) {
      return res.status(400).json({ error: 'Codeforces handle is required' });
    }
    const info = await cf.fetchUserInfo(handle.trim());

    const existing = await User.findById(req.userId).select('cfHandle');
    const handleChanged = existing?.cfHandle && existing.cfHandle !== info.handle;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { cfHandle: info.handle, cfData: buildCfData(info) },
      { new: true }
    ).select('-passwordHash');

    if (handleChanged) {
      await Submission.deleteMany({ userId: req.userId });
    }

    res.json({ user, handleChanged: !!handleChanged });
  } catch (err) {
    const message = err.response?.data?.comment || err.message;
    res.status(400).json({ error: message });
  }
};

exports.refreshCodeforces = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || !user.cfHandle) {
      return res.status(400).json({ error: 'No Codeforces handle linked yet' });
    }
    const info = await cf.fetchUserInfo(user.cfHandle);
    user.cfData = buildCfData(info);
    await user.save();

    const safe = user.toObject();
    delete safe.passwordHash;
    res.json({ user: safe });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
