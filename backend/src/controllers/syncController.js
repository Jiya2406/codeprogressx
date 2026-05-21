const User = require('../models/User');
const Submission = require('../models/Submission');
const cf = require('../services/codeforcesService');

exports.syncSubmissions = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user?.cfHandle) {
      return res.status(400).json({ error: 'Link your Codeforces handle first' });
    }

    const cfSubs = await cf.fetchUserSubmissions(user.cfHandle, 2000);

    if (!cfSubs.length) {
      return res.json({ synced: 0, inserted: 0, total: 0 });
    }

    const bulkOps = cfSubs
      .filter((s) => s.problem && s.problem.contestId)
      .map((s) => ({
        updateOne: {
          filter: { userId: user._id, cfSubmissionId: s.id },
          update: {
            $set: {
              userId: user._id,
              cfSubmissionId: s.id,
              problemId: `${s.problem.contestId}${s.problem.index}`,
              problemName: s.problem.name,
              problemRating: s.problem.rating,
              problemTags: s.problem.tags || [],
              verdict: s.verdict,
              programmingLanguage: s.programmingLanguage,
              passedTestCount: s.passedTestCount,
              contestId: s.problem.contestId,
              submittedAt: new Date(s.creationTimeSeconds * 1000)
            }
          },
          upsert: true
        }
      }));

    const result = await Submission.bulkWrite(bulkOps, { ordered: false });
    const total = await Submission.countDocuments({ userId: user._id });

    res.json({
      synced: (result.upsertedCount || 0) + (result.modifiedCount || 0),
      inserted: result.upsertedCount || 0,
      total
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
