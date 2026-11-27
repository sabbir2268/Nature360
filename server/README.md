# Nature360 API

Express + MongoDB backend for Nature360 / EcoTrack. Sign-in is handled by Firebase
Auth; every request carries a Firebase ID token, and MongoDB is the source of
truth for profiles, roles, complaints, alerts, notifications, and settings.
See the [project README](../README.md) and [DEPLOYMENT.md](../DEPLOYMENT.md).

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

Health check: <http://localhost:5000/api/health> →
`{"ok":true,"service":"nature360-api","db":"connected","time":"..."}`

| Script | Purpose |
| --- | --- |
| `npm start` | Start the API (`node index.js`) |
| `npm run dev` | Start with file watching |
| `npm run build` | Syntax-check `index.js` |

## Environment (`.env`)

| Variable | Purpose |
| --- | --- |
| `PORT` | Listen port, default `5000` |
| `MONGODB_URI` | MongoDB connection string |
| `MONGODB_DB` | Database name, e.g. `nature360` |
| `MONGODB_EMBEDDED_FALLBACK` | Local only: start an embedded MongoDB if the URI is unreachable (data in `.data/mongodb`; disabled in production) |
| `FIREBASE_API_KEY` | Firebase web API key used to verify ID tokens (same value as the client's `VITE_FIREBASE_API_KEY`) |
| `CORS_ORIGIN` | Comma-separated allowed origins, e.g. `https://nature360.vercel.app`; trailing slashes are normalised |
| `ADMIN_EMAILS`, `OFFICER_EMAILS`, `VOLUNTEER_EMAILS` | Optional comma-separated role bootstrap lists |

New sign-ins matching those email lists receive that role, and existing accounts
are promoted on their next sign-in. Admins can also change roles from the dashboard.

## Structure

```
index.js              Express app, CORS, routes, startup/shutdown
config/env.js         Loads .env from this folder or the working directory
config/db.js          MongoDB connection + embedded fallback
middleware/auth.js    Firebase token verification, Mongo profile, RBAC
models/               User, Post, Notification, AuditLog, Alert, Setting
services/             settings, evidence, risk, notification, audit, alert
utils/                helpers and response serializers
routes/               users, posts, alerts, analytics, audit, dashboard,
                      intelligence, notifications, reports, settings
```

## Authentication flow

`requireAuth` verifies the Firebase ID token against Google's identity toolkit
(caching successful verifications until expiry), finds or creates the MongoDB user,
checks for suspension, and attaches the user to `req.user`. `requireRole(...roles)`
adds role-based access control for staff/admin/volunteer routes.

## API routes

All routes except `/api/health` require `Authorization: Bearer <token>`.

- `/api/users` — profile, volunteer registration, user management
- `/api/posts` — complaints, workflow, officer actions, volunteer investigations
- `/api/alerts` — hotspot alerts and scanning
- `/api/analytics` — summary and daily trends
- `/api/intelligence` — hotspots, areas, per-complaint risk
- `/api/audit`, `/api/dashboard`, `/api/notifications`, `/api/settings`, `/api/reports`

Unknown endpoints return `404` with `{"error":"Endpoint not found.","code":"not_found"}`.

## Deployment

Render builds with `npm --prefix server ci` and starts with `npm --prefix server start`.
Set the variables above in the Render dashboard (no `.env` file is shipped); the
health check path is `/api/health`. Free-tier instances sleep after inactivity, so
the first request after a sleep can be slow.
