require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const syncRoutes = require('./routes/sync');
const statsRoutes = require('./routes/stats');
const recommendationRoutes = require('./routes/recommendations');
const goalRoutes = require('./routes/goals');
const contestRoutes = require('./routes/contests');
const chatRoutes = require('./routes/chat');

const reminderScheduler = require('./services/reminderScheduler');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

app.get('/', (_req, res) => res.json({ message: 'CodeProgressX API is running' }));
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/contests', contestRoutes);
app.use('/api/chat', chatRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[warn] RESEND_API_KEY not set — contest reminder emails will be skipped');
  }
  if (!process.env.GROQ_API_KEY) {
    console.warn('[warn] GROQ_API_KEY not set — AI Coach will return errors');
  }
  reminderScheduler.start();
  app.listen(PORT, () => console.log(`API ready → http://localhost:${PORT}`));
});
