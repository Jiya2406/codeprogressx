const { Resend } = require('resend');

let resendClient = null;
function getClient() {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resendClient) resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient;
}

const from = () => process.env.EMAIL_FROM || 'CodeProgressX <onboarding@resend.dev>';

exports.sendContestReminder = async ({ to, contestName, startTime, contestUrl, minutesUntil }) => {
  const client = getClient();
  if (!client) {
    console.warn('[email] RESEND_API_KEY not set — skipping email to', to);
    return { skipped: true };
  }

  const formatted = new Date(startTime).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; background: linear-gradient(135deg, #FAF5FF 0%, #FFF1F2 50%, #FFF7ED 100%); padding: 40px 30px; border-radius: 24px;">
      <div style="background: rgba(255,255,255,0.75); border-radius: 20px; padding: 32px;">
        <div style="display:inline-block; padding: 6px 14px; background: #F3E8FF; color: #A855F7; border-radius: 999px; font-size: 12px; font-weight: 600; margin-bottom: 16px;">🔔 CONTEST REMINDER</div>
        <h1 style="margin: 0 0 8px; font-size: 26px; color: #1F2937; font-weight: 800;">${contestName}</h1>
        <p style="margin: 0 0 24px; color: #6B7280; font-size: 15px;">Starts in <strong style="color: #C084FC;">${minutesUntil} minutes</strong> · ${formatted}</p>
        <a href="${contestUrl}" style="display:inline-block; padding: 14px 28px; background: linear-gradient(135deg, #C084FC, #FDA4AF); color: white; text-decoration: none; border-radius: 12px; font-weight: 600;">Open contest →</a>
        <p style="margin-top: 28px; color: #9CA3AF; font-size: 13px;">Good luck! — CodeProgressX</p>
      </div>
    </div>
  `;

  try {
    const result = await client.emails.send({
      from: from(),
      to,
      subject: `🔔 "${contestName}" starts in ${minutesUntil} minutes`,
      html
    });
    return { sent: true, id: result.data?.id };
  } catch (err) {
    console.error('[email] send failed:', err.message);
    return { error: err.message };
  }
};
