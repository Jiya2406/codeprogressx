const cron = require('node-cron');
const Reminder = require('../models/Reminder');
const User = require('../models/User');
const email = require('./emailService');

const WINDOW_MIN = 55;
const WINDOW_MAX = 65;

async function processDueReminders() {
  const now = Date.now();
  const lowerBound = new Date(now + WINDOW_MIN * 60 * 1000);
  const upperBound = new Date(now + WINDOW_MAX * 60 * 1000);

  const due = await Reminder.find({
    emailSent: false,
    contestStartTime: { $gte: lowerBound, $lte: upperBound }
  }).lean();

  if (due.length === 0) return;

  console.log(`[reminders] processing ${due.length} due reminder(s)`);

  for (const r of due) {
    const user = await User.findById(r.userId).lean();
    if (!user) continue;

    const minutesUntil = Math.round((r.contestStartTime.getTime() - now) / 60000);
    const result = await email.sendContestReminder({
      to: user.email,
      contestName: r.contestName,
      startTime: r.contestStartTime,
      contestUrl: `https://codeforces.com/contests/${r.contestId}`,
      minutesUntil
    });

    if (result.sent || result.skipped) {
      await Reminder.updateOne({ _id: r._id }, { $set: { emailSent: true } });
    }
  }
}

exports.start = () => {
  cron.schedule('*/5 * * * *', () => {
    processDueReminders().catch((e) => console.error('[reminders] error:', e.message));
  });
  console.log('[reminders] scheduler started (runs every 5 minutes)');
};

exports.processDueReminders = processDueReminders;
