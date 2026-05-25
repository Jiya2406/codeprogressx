const reminderScheduler = require('../services/reminderScheduler');

exports.runReminders = async (req, res) => {
  const provided = req.headers['x-cron-secret'];
  if (!process.env.CRON_SECRET) {
    return res.status(503).json({ error: 'CRON_SECRET not configured on server' });
  }
  if (!provided || provided !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Invalid cron secret' });
  }

  try {
    const stats = await reminderScheduler.processDueReminders();
    res.json({ ok: true, ...stats });
  } catch (err) {
    console.error('[cron] reminder run failed:', err.message);
    res.status(500).json({ error: err.message });
  }
};
