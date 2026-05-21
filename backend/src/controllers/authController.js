const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{6,}$/;
const PASSWORD_ERROR =
  'Password must be at least 6 characters with 1 lowercase, 1 uppercase, and 1 special symbol';

const signToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });

const safeUser = (u) => ({
  id: u._id,
  email: u.email,
  name: u.name,
  cfHandle: u.cfHandle,
  cfData: u.cfData
});

exports.signup = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    if (!PASSWORD_RE.test(password)) {
      return res.status(400).json({ error: PASSWORD_ERROR });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash, name });

    const token = signToken(user._id);
    res.status(201).json({ token, user: safeUser(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });
    if (!user.passwordHash) {
      return res.status(401).json({ error: 'This account uses Google sign-in — click "Continue with Google"' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid email or password' });

    const token = signToken(user._id);
    res.json({ token, user: safeUser(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
