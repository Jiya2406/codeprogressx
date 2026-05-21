const coach = require('../services/coachService');
const ChatSession = require('../models/ChatSession');

function generateTitle(message) {
  const trimmed = message.trim().replace(/\s+/g, ' ');
  if (trimmed.length <= 60) return trimmed;
  return trimmed.slice(0, 57) + '…';
}

exports.chat = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }
    const userMessage = message.trim();

    let session;
    if (sessionId) {
      session = await ChatSession.findOne({ _id: sessionId, userId: req.userId });
      if (!session) return res.status(404).json({ error: 'Session not found' });
    } else {
      session = await ChatSession.create({
        userId: req.userId,
        title: generateTitle(userMessage),
        messages: []
      });
    }

    const history = session.messages.map((m) => ({ role: m.role, content: m.content }));
    const reply = await coach.chat(req.userId, userMessage, history);

    session.messages.push({ role: 'user', content: userMessage });
    session.messages.push({ role: 'assistant', content: reply });
    await session.save();

    res.json({
      reply,
      sessionId: session._id,
      title: session.title
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.suggestions = async (req, res) => {
  try {
    const prompts = await coach.getSuggestedPrompts(req.userId);
    res.json({ prompts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.listSessions = async (req, res) => {
  try {
    const sessions = await ChatSession.find({ userId: req.userId })
      .select('title createdAt updatedAt')
      .sort({ updatedAt: -1 })
      .limit(50)
      .lean();
    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSession = async (req, res) => {
  try {
    const session = await ChatSession.findOne({
      _id: req.params.id,
      userId: req.userId
    }).lean();
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json({ session });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteSession = async (req, res) => {
  try {
    await ChatSession.deleteOne({ _id: req.params.id, userId: req.userId });
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
