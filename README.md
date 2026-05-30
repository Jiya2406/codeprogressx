# CodeProgressX

Track your Codeforces journey with beautiful analytics, contest reminders, and an AI mentor.

CodeProgressX links your Codeforces handle, syncs your full submission history, and turns it into a dashboard you'll actually look at — rating, streaks, tag mastery, weak areas, recommended problems, contest email reminders, and a Groq-powered AI coach that knows your stats.

## Features

- **Auth** — email + password with JWT (passwords hashed via bcrypt).
- **Codeforces sync** — link your handle, pull profile + every submission via the public CF API.
- **Analytics dashboard** — solved totals, accuracy, current streak, rating-bucket distribution, per-tag mastery, weakest tags.
- **Goals** — set rating / solved-count / tag goals with deadlines.
- **Problem recommendations** — picks based on your rating and weak tags.
- **Contest reminders** — toggle an upcoming contest and get an email ~1 hour before start (powered by Resend + node-cron).
- **AI Mentor** — a chat coach grounded in *your* profile, recent solves, and active goals (Groq LLM).

## Stack

```
CodeProgressX/
├── backend/   # Node + Express + MongoDB (Mongoose), JWT, Resend, Groq
└── frontend/  # Next.js 14 (App Router, JSX) + Tailwind CSS + Recharts
```

## Quick start

You'll need: Node 18+, a MongoDB Atlas connection string, and (optionally) [Resend](https://resend.com) + [Groq](https://console.groq.com) API keys for reminders and the AI coach.

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env — paste your MongoDB URI, set a JWT_SECRET (32+ chars),
# and optionally add RESEND_API_KEY and GROQ_API_KEY
npm run dev
```

Backend runs at <http://localhost:5000>. The server starts even without Resend/Groq keys — reminders just get skipped and the AI coach returns an error until they're set.

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Frontend runs at <http://localhost:3000>.

### 3. Try it

1. Open <http://localhost:3000> and click **Get started**.
2. Sign up with any email/password (6+ chars).
3. On the dashboard, paste a Codeforces handle (e.g. `tourist`).
4. Hit sync to pull submissions, then explore the dashboard, contests page, and mentor.

## Environment

**backend/.env**

| Var | Notes |
|---|---|
| `PORT` | API port (default `5000`) |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | 32+ random chars |
| `JWT_EXPIRES_IN` | default `7d` |
| `FRONTEND_URL` | CORS origin (default `http://localhost:3000`) |
| `RESEND_API_KEY` | optional — enables contest reminder emails |
| `EMAIL_FROM` | sender used by Resend |
| `GROQ_API_KEY` | optional — enables the AI mentor |
| `GROQ_MODEL` | default `llama-3.3-70b-versatile` |

**frontend/.env.local**

| Var | Notes |
|---|---|
| `NEXT_PUBLIC_API_URL` | default `http://localhost:5000/api` |

## API overview

All `/api/*` routes except `/api/auth/*` require `Authorization: Bearer <token>`.

| Area | Endpoints |
|---|---|
| Auth | `POST /api/auth/signup`, `POST /api/auth/login` |
| User | `GET /api/user/me`, `POST /api/user/codeforces`, `POST /api/user/codeforces/refresh` |
| Sync | `POST /api/sync` |
| Stats | `GET /api/stats/{overview,tags,weak,rating-buckets,timeline}` |
| Goals | `GET/POST /api/goals`, `DELETE /api/goals/:id` |
| Recs | `GET /api/recommendations` |
| Contests | `GET /api/contests`, `POST/DELETE /api/contests/:contestId/remind`, `POST /api/contests/test-email` |
| Chat | `POST /api/chat`, `GET /api/chat/suggestions`, `GET/DELETE /api/chat/sessions[/:id]` |

## Deployment

The app is designed to deploy with the frontend on Vercel and the backend on Railway (or any Node host). Set the same env vars in your host's dashboard and point `NEXT_PUBLIC_API_URL` at the deployed backend URL.
