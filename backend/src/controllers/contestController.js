const contests = require('../services/contestService');
const Reminder = require('../models/Reminder');
const User = require('../models/User');
const email = require('../services/emailService');

exports.listUpcoming = async (req, res) => {
  try {
    const list = await contests.fetchUpcomingContests();
    const reminders = await Reminder.find({ userId: req.userId }).select('contestId').lean();
    const reminded = new Set(reminders.map((r) => r.contestId));
    res.json({
      contests: list.map((c) => ({ ...c, reminderSet: reminded.has(c.id) }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addReminder = async (req, res) => {
  try {
    const contestId = parseInt(req.params.contestId, 10);
    const list = await contests.fetchUpcomingContests();
    const contest = list.find((c) => c.id === contestId);
    if (!contest) return res.status(404).json({ error: 'Contest not found or already started' });

    await Reminder.findOneAndUpdate(
      { userId: req.userId, contestId },
      {
        userId: req.userId,
        contestId,
        contestName: contest.name,
        contestStartTime: new Date(contest.startTimeSeconds * 1000),
        durationSeconds: contest.durationSeconds,
        emailSent: false
      },
      { upsert: true, new: true }
    );

    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.removeReminder = async (req, res) => {
  try {
    await Reminder.deleteOne({
      userId: req.userId,
      contestId: parseInt(req.params.contestId, 10)
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.sendTestEmail = async (req, res) => {
  try {
    const user = await User.findById(req.userId).lean();
    if (!user) return res.status(404).json({ error: 'User not found' });

    const list = await contests.fetchUpcomingContests();
    const sample = list[0] || {
      id: 0,
      name: 'Codeforces Round #1000 (Test)',
      startTime: new Date(Date.now() + 60 * 60 * 1000).toISOString()
    };

    const result = await email.sendContestReminder({
      to: user.email,
      contestName: `[TEST] ${sample.name}`,
      startTime: sample.startTime,
      contestUrl: `https://codeforces.com/contests/${sample.id}`,
      minutesUntil: 60
    });

    if (result.error) return res.status(400).json({ error: result.error });
    if (result.skipped) {
      return res.status(400).json({
        error: 'RESEND_API_KEY is not set — add it to your .env to enable emails'
      });
    }
    res.json({ ok: true, sentTo: user.email });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
