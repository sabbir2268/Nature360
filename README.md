# Nature360 / EcoTrack

Citizen-powered environmental complaint tracking and response. Citizens report
environmental problems with evidence and a GPS pin, officers verify and prioritise
them, volunteers investigate on site, and administrators configure the rules that
drive risk scoring and automatic hotspot alerts.

**Live app:** <https://nature360.vercel.app> · **Live API:** <https://nature360.onrender.com/api>

## Stack

- **Client:** React 19, Vite, Tailwind CSS v4, Firebase Auth/Storage, Leaflet, Recharts
- **Server:** Express, MongoDB (Mongoose), Firebase ID-token verification, PDFKit
- **Identity:** Firebase Auth for sign-in; MongoDB stores profiles, roles, and complaints

## Features

| Role | Capabilities |
| --- | --- |
| Citizen | Register/sign in, submit complaints with photos/videos/PDF and a GPS pin, edit or soft-delete before investigation, track status history, confirm resolution or reopen with feedback |
| Officer | Filter and search the queue, verify/reject, adjust category/severity/priority, check duplicates, assign volunteers with deadlines, add internal notes, record corrective actions, export an admin PDF |
| Volunteer | Self-register at sign-up, see assigned cases and deadlines, record on-site observations, GPS and evidence, submit an investigation report |
| Admin | Everything officers can do, plus user roles/status, categories, severity weights, risk and alert rules, and the audit trail |
| Shared | Hotspot map, analytics, automatic hotspot alerts, notifications, profile and security settings |

The platform implements FR-01 through FR-16. Complaints are soft-deleted only, and
internal notes are never exposed to citizens or volunteers.

## Project structure

```
.                     Root scripts and deployment configs
├── client/           Vite + React single-page app  (see client/README.md)
├── server/           Express API + MongoDB         (see server/README.md)
└── DEPLOYMENT.md     Step-by-step Vercel/Render/Atlas/Firebase guide
```

## Quick start

```bash
npm run install:all
```

Create `server/.env` from `server/.env.example` and `client/.env` from
`client/.env.example` (see the READMEs in each folder for the full variable lists).
The server needs `MONGODB_URI`, `FIREBASE_API_KEY`, and usually `CORS_ORIGIN`; the
client needs the Firebase web config and `VITE_API_URL`.

Run both apps together:

```bash
npm run dev
```

On Windows PowerShell, if `npm.ps1` is blocked by the execution policy, use
`npm.cmd run dev`. To run them separately, use `npm run dev:server` and
`npm run dev:client` in two terminals.

Root scripts:

| Script | Purpose |
| --- | --- |
| `npm run install:all` | Install client and server dependencies |
| `npm run dev` / `dev:all` | Start API and web app together via `scripts/dev.mjs` |
| `npm run dev:server` / `dev:client` | Start one app |
| `npm run build` | Production build of the client |
| `npm run lint` | ESLint the client |
| `npm start` | Start the API |

Health check: <http://localhost:5000/api/health> — it must report `"db": "connected"`.
Empty dashboards usually mean only the web app is running, or the database is empty.

## API overview

All routes except `/api/health` require a Firebase ID token in the
`Authorization: Bearer <token>` header.

| Area | Routes |
| --- | --- |
| Profile | `GET/PATCH /api/users/me`, `POST /api/users/volunteer`, `GET /api/users/volunteers` |
| Complaints | `GET/POST /api/posts`, `GET/PATCH/DELETE /api/posts/:id`, `PATCH /api/posts/:id/status`, `POST /api/posts/:id/responses` |
| Officer workflow | `POST /api/posts/:id/verify`, `GET /api/posts/:id/duplicates`, `POST /api/posts/:id/assign`, `POST /api/posts/:id/notes`, `POST /api/posts/:id/corrective-actions` |
| Volunteer workflow | `GET /api/posts/assigned`, `PATCH /api/posts/:id/investigation`, `POST /api/posts/:id/investigation/report` |
| Intelligence | `GET /api/intelligence/hotspots`, `GET /api/intelligence/areas`, `GET /api/intelligence/risk/:id`, `GET /api/analytics/summary`, `GET /api/analytics/trends` |
| Alerts | `GET /api/alerts`, `PATCH /api/alerts/:id/status`, `POST /api/alerts/scan` |
| Admin | `GET/PATCH /api/users`, `GET/PUT /api/settings`, `GET /api/audit`, `GET /api/reports/admin.pdf` |

Statuses: `Submitted → Under Review → Verified → Investigation → Action Taken → Resolved` (plus `Rejected`).

## Deployment

The web app is deployed on Vercel and the API on Render, with MongoDB Atlas and
Firebase. `render.yaml` holds the API build settings; `vercel.json` only holds SPA
rewrites and asset cache headers. See [DEPLOYMENT.md](./DEPLOYMENT.md) for the
complete guide and troubleshooting.

Two details that matter for a working deployment:

- Build `VITE_API_URL` into the Vercel app as `https://nature360.onrender.com/api` (no trailing slash). The client also falls back to that URL in production builds if the variable is missing or points at localhost.
- `CORS_ORIGIN` on Render must contain the Vercel origin. The server normalises trailing slashes, but the value still needs to be present.

Verify a deployment with:

```bash
curl https://nature360.onrender.com/api/health
# {"ok":true,"service":"nature360-api","db":"connected","time":"..."}
```
