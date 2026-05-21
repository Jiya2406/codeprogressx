# CodeProgressX — Backend

Node.js + Express + MongoDB API.

## Routes

| Method | Path | Auth | Body | Returns |
|---|---|---|---|---|
| POST | `/api/auth/signup` | — | `{ email, password, name }` | `{ token, user }` |
| POST | `/api/auth/login` | — | `{ email, password }` | `{ token, user }` |
| GET | `/api/user/me` | Bearer | — | `{ user }` |
| POST | `/api/user/codeforces` | Bearer | `{ handle }` | `{ user }` (with CF data) |
| POST | `/api/user/codeforces/refresh` | Bearer | — | `{ user }` |

## Setup

```bash
npm install
cp .env.example .env
# fill in MONGODB_URI and JWT_SECRET
npm run dev
```

## Notes
- Passwords are hashed with bcrypt (10 rounds)
- JWTs are signed with `JWT_SECRET`, default expiry 7 days
- Codeforces data is fetched from the public CF API (no key needed)
