const Groq = require('groq-sdk');
const User = require('../models/User');
const Submission = require('../models/Submission');
const Goal = require('../models/Goal');
const stats = require('./statsService');

let groqClient = null;
function getClient() {
  if (!process.env.GROQ_API_KEY) return null;
  if (!groqClient) groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return groqClient;
}

async function buildContext(userId) {
  const user = await User.findById(userId).lean();
  const overview = await stats.computeOverview(userId);
  const mastery = await stats.computeTagMastery(userId);
  const weak = await stats.getWeakTags(userId, 3, 5);
  const goals = await Goal.find({ userId }).lean();

  const topStrong = mastery.slice(0, 5);
  const recent = await Submission.find({ userId, verdict: 'OK' })
    .sort({ submittedAt: -1 })
    .limit(8)
    .lean();
  const seenIds = new Set();
  const uniqueRecent = [];
  for (const s of recent) {
    if (seenIds.has(s.problemId)) continue;
    seenIds.add(s.problemId);
    uniqueRecent.push(s);
    if (uniqueRecent.length >= 5) break;
  }

  return { user, overview, topStrong, weak, recent: uniqueRecent, goals };
}

function buildSystemPrompt(ctx) {
  const { user, overview, topStrong, weak, recent, goals } = ctx;
  const cf = user.cfData || {};

  const lines = [
    'You are an expert competitive programming mentor for CodeProgressX.',
    'Be concise, specific, and encouraging. Use short paragraphs and bullet points.',
    'When recommending problems, give concrete Codeforces problem suggestions with rating ranges and tags.',
    "Don't lecture. Treat the user as a peer who wants honest, actionable feedback.",
    'Use markdown for formatting. Keep responses under 300 words unless the question demands more.',
    '',
    '=== USER PROFILE ===',
    `Handle: ${user.cfHandle || '(not linked)'}`,
    `Current rating: ${cf.rating || 'Unrated'} (${cf.rank || '—'})`,
    `Max rating: ${cf.maxRating || '—'} (${cf.maxRank || '—'})`,
    `Problems solved: ${overview.totalSolved}`,
    `Submission accuracy: ${overview.accuracy}%`,
    `Current streak: ${overview.currentStreak} days`,
    ''
  ];

  if (topStrong.length) {
    lines.push('=== STRONGEST TAGS (most solved) ===');
    topStrong.forEach((t) => lines.push(`- ${t.tag}: ${t.solved} solved, ${t.accuracy}% accuracy`));
    lines.push('');
  }

  if (weak.length) {
    lines.push('=== WEAKEST TAGS (lowest accuracy, 5+ attempts) ===');
    weak.forEach((t) => lines.push(`- ${t.tag}: ${t.solved}/${t.attempted} (${t.accuracy}%)`));
    lines.push('');
  }

  if (recent.length) {
    lines.push('=== RECENTLY SOLVED ===');
    recent.forEach((s) =>
      lines.push(
        `- ${s.problemName || s.problemId} [${s.problemRating || '?'}] — ${(s.problemTags || []).join(', ')}`
      )
    );
    lines.push('');
  }

  if (goals.length) {
    lines.push('=== ACTIVE GOALS ===');
    goals.forEach((g) => lines.push(`- ${g.title}`));
    lines.push('');
  }

  return lines.join('\n');
}

exports.chat = async (userId, message, history = []) => {
  const client = getClient();
  if (!client) {
    throw new Error('AI Coach is not configured — set GROQ_API_KEY in your .env file');
  }

  const ctx = await buildContext(userId);
  const systemPrompt = buildSystemPrompt(ctx);

  const trimmedHistory = history
    .slice(-8)
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && m.content);

  const messages = [
    { role: 'system', content: systemPrompt },
    ...trimmedHistory,
    { role: 'user', content: message }
  ];

  const completion = await client.chat.completions.create({
    model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    messages,
    temperature: 0.6,
    max_tokens: 800
  });

  return completion.choices[0]?.message?.content || '';
};

exports.getSuggestedPrompts = async (userId) => {
  const ctx = await buildContext(userId);
  const prompts = ['What should I practice next?'];
  if (ctx.weak.length) {
    prompts.push(`Why am I weak in ${ctx.weak[0].tag}?`);
  }
  if (ctx.user.cfData?.rating) {
    prompts.push("How do I push past my current rating?");
  } else {
    prompts.push('Give me a beginner roadmap to reach 1200');
  }
  prompts.push('Build me a 1-week study plan');
  return prompts;
};
