const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let client = null;
function getClient() {
  if (!process.env.GOOGLE_CLIENT_ID) return null;
  if (!client) client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  return client;
}

const signToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });

const safeUser = (u) => ({
  id: u._id,
  email: u.email,
  name: u.name,
  avatar: u.avatar,
  cfHandle: u.cfHandle,
  cfData: u.cfData
});

exports.googleLogin = async (req, res) => {
  try {
    const c = getClient();
    if (!c) {
      return res.status(503).json({ error: 'Google sign-in is not configured — set GOOGLE_CLIENT_ID' });
    }
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ error: 'ID token required' });

    const ticket = await c.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture, email_verified } = payload;

    if (!email_verified) {
      return res.status(401).json({ error: 'Google email is not verified' });
    }

    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      user = await User.create({ email, name, googleId, avatar: picture });
    } else if (!user.googleId) {
      user.googleId = googleId;
      if (!user.avatar) user.avatar = picture;
      if (!user.name) user.name = name;
      await user.save();
    }

    const token = signToken(user._id);
    res.json({ token, user: safeUser(user) });
  } catch (err) {
    res.status(401).json({ error: err.message || 'Google sign-in failed' });
  }
};
