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

  const stats = { found: 0, sent: 0, failed: 0, errors: [] };

  // Atomically claim each due reminder by marking emailSent=true BEFORE sending.
  // This prevents two backends (Render + Railway) racing and sending duplicates.
  // If the email fails, we revert the flag so the next tick can retry.
  while (true) {
    const r = await Reminder.findOneAndUpdate(
      {
        emailSent: false,
        contestStartTime: { $gte: lowerBound, $lte: upperBound }
      },
      { $set: { emailSent: true } },
      { new: true }
    ).lean();
    if (!r) break;

    stats.found++;

    const user = await User.findById(r.userId).lean();
    if (!user) {
      stats.failed++;
      stats.errors.push({ contestId: r.contestId, error: 'user not found' });
      continue;
    }

    const minutesUntil = Math.round((r.contestStartTime.getTime() - now) / 60000);
    const result = await email.sendContestReminder({
      to: user.email,
      contestName: r.contestName,
      startTime: r.contestStartTime,
      contestUrl: `https://codeforces.com/contests/${r.contestId}`,
      minutesUntil
    });

    if (result.sent || result.skipped) {
      stats.sent++;
    } else {
      await Reminder.updateOne({ _id: r._id }, { $set: { emailSent: false } });
      stats.failed++;
      stats.errors.push({ contestId: r.contestId, error: result.error || 'unknown' });
    }
  }

  if (stats.found > 0) {
    console.log(`[reminders] processed ${stats.found} reminder(s): ${stats.sent} sent, ${stats.failed} failed`);
  }

  return stats;
}

exports.start = () => {
  cron.schedule('*/5 * * * *', () => {
    processDueReminders().catch((e) => console.error('[reminders] error:', e.message));
  });
  console.log('[reminders] scheduler started (runs every 5 minutes)');
};

exports.processDueReminders = processDueReminders;
