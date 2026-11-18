# Nature360 API (Express + MongoDB)

Backend for Nature360 / EcoTrack. Firebase Authentication handles sign-in; the
client sends a Firebase ID token with every request and MongoDB is the source of
truth for profiles, roles, complaints, alerts and settings.

See the [project README](../README.md) for full setup, environment variables,
Firebase configuration and the route overview.

## Structure

```
server/
  index.js              Express app + startup/shutdown
  config/db.js          MongoDB connection (+ local embedded fallback)
  models/               User, Post, Notification, AuditLog, Alert, Setting
  middleware/auth.js    Firebase token verification, Mongo profile, RBAC
  services/             settings, evidence, risk, notification, audit, alert
  routes/               users, posts, notifications, alerts, audit, settings,
                        dashboard, analytics, intelligence, reports
```

## Quick start

```bash
npm install
cp .env.example .env
npm run dev
```

Health check: `GET http://localhost:5000/api/health`

### Local MongoDB fallback

If `MONGODB_URI` cannot be reached, set `MONGODB_EMBEDDED_FALLBACK=true` to
start an embedded MongoDB. Data persists in `server/.data/mongodb` and the
fallback is disabled when `NODE_ENV=production`.

### Role bootstrap

Set comma-separated `ADMIN_EMAILS`, `OFFICER_EMAILS` and `VOLUNTEER_EMAILS` in
`server/.env`. New sign-ins with those emails receive the role; existing
accounts are promoted on their next sign-in. Admins can also change roles from
the dashboard.
