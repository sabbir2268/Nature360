# Nature360

Citizen-powered environmental complaint tracking and response. Citizens report
environmental problems with evidence and a GPS pin, officers verify and prioritise
them, volunteers investigate on site, and administrators configure the rules that
drive risk scoring and automatic hotspot alerts.

**Live app:** <https://nature360.vercel.app>

> The API is on Render's free tier, so after a period of inactivity it can take
> ~50 seconds to wake up. The first request after a sleep may be slow.

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

## Functional requirements (FR-01–FR-16)

FR-01 to FR-16 are the functional-requirement IDs from the project brief: the code
labels FR-04 (resolution feedback), FR-06–FR-10 (officer verification, assignment,
investigation, corrective action and status), FR-11–FR-13 (alerts, hotspot map and
analytics) and FR-14–FR-16 (admin config, users and audit), while FR-01–FR-03 and
FR-05 are not labelled in the current UI (TODO: confirm the exact wording of every
requirement against the brief).

## Screenshots

TODO: capture the images below and add them to `docs/screenshots/` (the folder is
not in the repository yet).

| View | Placeholder file |
| --- | --- |
| Citizen submit form | `docs/screenshots/citizen-submit-form.png` |
| Officer queue | `docs/screenshots/officer-queue.png` |
| Volunteer investigation | `docs/screenshots/volunteer-investigation.png` |
| Admin settings | `docs/screenshots/admin-settings.png` |
| Hotspot map | `docs/screenshots/hotspot-map.png` |
| Analytics | `docs/screenshots/analytics.png` |

## Demo accounts

TODO: create and confirm the demo logins and passwords. The four roles come from
`server/models/User.js`; roles can be bootstrapped with `ADMIN_EMAILS`,
`OFFICER_EMAILS` and `VOLUNTEER_EMAILS` in `server/.env`.

| Role | Email | Password |
| --- | --- | --- |
| Citizen | TODO | TODO |
| Officer | TODO | TODO |
| Volunteer | TODO | TODO |
| Admin | TODO | TODO |

## Team and contributions

TODO: fill in both names and your individual tasks. `git log` attributes every
commit in this repository to `Md Sabbir Rahman <mdsabbirrahman2268@gmail.com>`, so
the folder suggestions below are only a starting point, not a confirmed split.

| Member | Name | Tasks | Suggested folders from git log |
| --- | --- | --- | --- |
| You | TODO | TODO | Most feature work under `client/src/features/`, plus `server/models/` and `server/routes/` (TODO: confirm) |
| Teammate | TODO | TODO | The `setu656` branch / PR #1 touched `README.md`, `package.json`, `scripts/dev.mjs`, `server/.env.example` and `server/index.js` (TODO: confirm) |

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

## How risk scoring and hotspot alerts work

The scoring code is in `server/services/riskService.js`, the alert check in
`server/services/alertService.js`, and the configurable defaults in
`server/services/settingsService.js` (an admin can change them in Admin Config).

For a complaint, four parts are each reduced to a number from 0 to 100:

- **Frequency** — reports with the same category and area inside `frequencyWindowDays`
  (default 30), divided by that window and capped at 100.
- **Severity** — the average severity weight of those recent reports divided by the
  highest configured severity weight, capped at 100 (default weights: Low 1,
  Medium 2, High 3, Critical 4).
- **Recurrence** — `max(0, recurrenceCount − 1)` divided by `frequencyWindowDays × 1.5`,
  capped at 100; `recurrenceCount` counts reports inside `recurrenceWindowDays`
  (default 90).
- **Recency** — 100 if the newest report is at most 1 day old, then 80 up to 3 days,
  60 up to 7, 40 up to 14, 20 up to 30, 10 up to 90, and 0 beyond that.

The parts are combined as a weighted average with the default weights frequency 30,
severity 25, recurrence 25 and recency 20, then rounded to a score from 0 to 100.
The level is Low up to 39, Moderate up to 59, High up to 79, and Critical above
that; all weights and cut-offs are configurable.

A **hotspot** groups complaints by category plus `area`, falling back to `location`
and then to coordinates rounded to three decimals, and runs the same score with the
group's report count used for both frequency and recurrence. Results can be filtered
by risk level and minimum reports, and are sorted by score, then report count. When
scoring a single complaint, "same area" means a matching `area`/`location` or a
coordinate box of ±0.01 degrees.

An **alert** is checked after a complaint is created or verified. If alerts are
active, the complaint has an area, and its category and area have at least
`reportThreshold` reports (default 10) within `windowDays` (default 7), one Active
alert is created or updated per category and area per window. It uses the same score
with `windowDays` as the frequency window; a Low level is raised to Moderate, and
notifications go to `notifyRoles` (default Officer and Admin).

## Data model

MongoDB collections come from the Mongoose models in `server/models/` (collection
names use Mongoose's default pluralisation):

| Model / collection | Key fields |
| --- | --- |
| `User` / `users` | `uid` (unique), `name`, `email`, `role`, `status`, `phone`, `emailVerified`, `lastLoginAt` |
| `Post` / `posts` | `user`, `title`, `category`, `severity`, `priority`, `location`, `area`, `coordinates`, `description`, `incidentAt`, `evidence`, `status`, `statusHistory`, `verificationStatus`, `assignedTo`, `deadline`, `internalNotes`, `correctiveActions`, `investigation`, `duplicateOf`, `riskScore`, `riskLevel`, `resolutionStatus`, `citizenResponses`, `isDeleted` |
| `Alert` / `alerts` | `category`, `area`, `coordinates`, `reportCount`, `windowDays`, `riskScore`, `riskLevel`, `message`, `status`, `acknowledgedAt`, `resolvedAt` |
| `Setting` / `settings` | `key` (unique, `global`), `categories`, `severityLevels`, `riskRules`, `alertRules` |
| `Notification` / `notifications` | `user`, `type`, `title`, `message`, `link`, `relatedPost`, `read`, `readAt` |
| `AuditLog` / `auditlogs` | `actorUid`, `actorName`, `actorRole`, `action`, `entityType`, `entityId`, `details`, `ip` |

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

## Testing

TODO: there is no automated test suite in this repository (no test/spec files and
no `test` script in the root, client or server `package.json`). Add tests and record
the commands here once they exist.
