const recService = require('../services/recommendationService');

exports.recommend = async (req, res) => {
  try {
    const problems = await recService.recommend(req.userId, 5);
    res.json({ problems });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
