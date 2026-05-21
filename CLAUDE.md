# CLAUDE.md

Guidance for Claude Code when working in this repo.

## Project

CodeProgressX is a full-stack web app that helps competitive programmers track their Codeforces progress. Features: profile sync, problem-solving analytics, contest email reminders, goal tracking, and a Groq-powered AI coach.

## Stack

- **Backend** ([backend/](backend/)) — Node.js + Express + Mongoose (MongoDB Atlas). JWT auth (bcryptjs + jsonwebtoken). External APIs: Codeforces (public, no key), Resend (email), Groq SDK (LLM).
- **Frontend** ([frontend/](frontend/)) — Next.js 14 (App Router, JSX — no TypeScript), Tailwind CSS with a custom pastel palette (lavender / peach / mint / blush), Recharts for charts, lucide-react for icons.
- **Auth** — JWT bearer tokens. Token + user JSON are persisted in `localStorage` under keys `cpx_token` / `cpx_user` ([frontend/lib/auth.js](frontend/lib/auth.js)).

## Layout

```
backend/src/
├── server.js              # Express bootstrap, route mounting, scheduler kickoff
├── config/db.js           # mongoose.connect(MONGODB_URI)
├── middleware/auth.js     # Bearer JWT verification → req.userId
├── models/                # User, Submission, Goal, Reminder, ChatSession
├── routes/                # auth, user, sync, stats, recommendations, goals, contests, chat
├── controllers/           # request handlers
└── services/              # codeforcesService, statsService, coachService (Groq),
                           # emailService (Resend), reminderScheduler (node-cron),
                           # contestService, recommendationService

frontend/
├── app/                   # App Router pages: /, /login, /signup, /dashboard,
│                          # /contests, /mentor
├── components/            # NavBar, GoalsCard, MasteryMeter, ProgressChart,
│                          # RecommendedProblems, StatTile, WeakAreas
└── lib/                   # api.js (fetch wrapper), auth.js (localStorage helpers)
```

## API surface

All `/api/*` routes except `/api/auth/*` require `Authorization: Bearer <token>`.

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/auth/signup` | Create user, return JWT |
| POST | `/api/auth/login` | Authenticate, return JWT |
| GET  | `/api/user/me` | Current user profile |
| POST | `/api/user/codeforces` | Link CF handle, fetch profile |
| POST | `/api/user/codeforces/refresh` | Re-fetch CF profile |
| POST | `/api/sync` | Pull CF submissions into MongoDB |
| GET  | `/api/stats/overview` | Totals, accuracy, streak |
| GET  | `/api/stats/tags` | Per-tag mastery |
| GET  | `/api/stats/weak` | Weakest tags (low accuracy, 5+ attempts) |
| GET  | `/api/stats/rating-buckets` | Solved distribution by rating |
| GET  | `/api/stats/timeline` | Solved-over-time series |
| GET  | `/api/recommendations` | Suggested problems |
| GET/POST/DELETE | `/api/goals[/:id]` | Goal CRUD |
| GET  | `/api/contests` | Upcoming Codeforces contests |
| POST/DELETE | `/api/contests/:contestId/remind` | Toggle email reminder |
| POST | `/api/contests/test-email` | Send a test reminder |
| POST | `/api/chat` | AI coach message (creates/extends `ChatSession`) |
| GET  | `/api/chat/suggestions` | Suggested prompts based on user stats |
| GET/DELETE | `/api/chat/sessions[/:id]` | Chat session list / fetch / delete |

## Running

Backend (terminal 1):
```bash
cd backend && npm install && npm run dev   # → http://localhost:5000
```

Frontend (terminal 2):
```bash
cd frontend && npm install && npm run dev  # → http://localhost:3000
```

## Environment

**[backend/.env](backend/.env.example)** — `PORT`, `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `FRONTEND_URL`, `RESEND_API_KEY`, `EMAIL_FROM`, `GROQ_API_KEY`, `GROQ_MODEL`. The server boots without `RESEND_API_KEY` (skips emails) or `GROQ_API_KEY` (AI coach returns 400), with warnings on startup.

**[frontend/.env.local](frontend/.env.local.example)** — `NEXT_PUBLIC_API_URL` (default `http://localhost:5000/api`).

There is an untracked `API keys.txt` at the repo root — **never read, log, or commit its contents**. Real secrets live in `.env` / `.env.local` (gitignored).

## Conventions

- Backend uses **CommonJS** (`require` / `module.exports`), not ESM.
- Frontend is **JSX, not TSX** — do not introduce TypeScript files.
- Route files are thin: `router → controller → service → model`. Keep new endpoints in that shape.
- Mongoose models use `{ timestamps: true }`. Add compound indexes alongside the schema definition (see [Submission.js](backend/src/models/Submission.js)).
- All authenticated controllers read the user via `req.userId` (set by [middleware/auth.js](backend/src/middleware/auth.js)).
- Frontend network calls go through `apiFetch` in [frontend/lib/api.js](frontend/lib/api.js) — pass the token from `getToken()`.
- Styling: Tailwind utilities + the custom palette defined in [tailwind.config.js](frontend/tailwind.config.js). Reuse `glass-card`, `gradient-text`, `shadow-soft`, `shadow-glow` rather than inventing new aesthetics.

## Background work

`reminderScheduler.start()` is called in [server.js](backend/src/server.js) and runs a node-cron job every 5 minutes that emails users 55–65 minutes before contests they've subscribed to. Don't add additional schedulers unless asked — keep cron usage centralized in [services/reminderScheduler.js](backend/src/services/reminderScheduler.js).

## Things to avoid

- Don't commit `.env`, `.env.local`, or `API keys.txt`.
- Don't swap MongoDB/Mongoose for another DB, or Groq for another LLM provider, without confirming first.
- Don't convert the frontend to TypeScript or migrate from the App Router.
- Don't bypass the `apiFetch` wrapper or hardcode `http://localhost:5000` in components — always go through `NEXT_PUBLIC_API_URL`.
