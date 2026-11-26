# Nature360 / EcoTrack

Citizen-powered environmental complaint tracking and response. Citizens report
environmental problems with evidence, officers verify and prioritise them,
volunteers investigate on site, and administrators configure the rules that
drive risk scoring and automatic hotspot alerts.

- **Client:** React 19, Vite, Tailwind CSS v4, Firebase Auth/Storage, Leaflet, Recharts
- **Server:** Express, MongoDB (Mongoose), Firebase ID-token verification, PDFKit
- **Profiles:** Firebase Auth for sign-in, MongoDB for users and complaints

## Features

| Role | Capabilities |
| --- | --- |
| Citizen | Register/sign in, submit complaints with photos/videos/PDF, GPS pin, edit or soft-delete before investigation, track status history, confirm resolution or reopen with feedback |
| Officer | Filter and search the complaint queue, verify/reject, adjust category/severity/priority, check duplicates, assign volunteers with deadlines, add internal notes, record corrective actions, update status, export admin PDF |
| Volunteer | Self-register at sign-up, see assigned cases and deadlines, record on-site observations, GPS and evidence, submit an investigation report |
| Admin | Everything officers can do, plus user roles/status, categories, severity weights, risk rules, alert rules and the audit trail |
| Shared | Hotspot map, analytics, automatic hotspot alerts, notifications, profile/security settings |

The platform implements FR-01 through FR-16. Complaint records are soft-deleted
only, and internal notes are never exposed to citizens or volunteers.

## Project structure

```
client/   Vite React app
server/   Express API
```

## First-time setup

```bash
npm run install:all
```

Create `server/.env` from `server/.env.example` and fill in:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/nature360
MONGODB_DB=nature360
MONGODB_EMBEDDED_FALLBACK=true
FIREBASE_API_KEY=<same value as VITE_FIREBASE_API_KEY>
CORS_ORIGIN=http://localhost:5173
ADMIN_EMAILS=you@example.com
OFFICER_EMAILS=officer@example.com
VOLUNTEER_EMAILS=volunteer@example.com
```

Role lists are optional. New sign-ins with those emails receive the role, and
existing accounts are promoted on their next sign-in. Admins can also change
roles from **Dashboard -> User Management**.

Accounts created with the sign-up form default to **Citizen**. Select
**Field volunteer** on the form to register as a **Volunteer** without a
hardcoded email; officers and admins can then assign complaints to that account
from the complaint workspace. `VOLUNTEER_EMAILS` remains available for
bootstrapping volunteer accounts.

Create `client/.env` from `client/.env.example` with your Firebase web config:

```env
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_ALLOW_INLINE_EVIDENCE=false
```

`FIREBASE_API_KEY` on the server must belong to the same Firebase project as
the client config. The client sends the signed-in user's Firebase ID token in
the `Authorization: Bearer <token>` header on every API request.

### Firebase console checklist

1. Enable **Email/Password** and **Google** sign-in providers.
2. Add `localhost` to **Authentication -> Settings -> Authorized domains**.
3. Create the Storage bucket referenced by `VITE_FIREBASE_STORAGE_BUCKET`.
4. Allow authenticated users to write under `complaints/` and read files they
   are linked to through a complaint. A starting rule set:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /complaints/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Tighten these rules before production. Set
`VITE_ALLOW_INLINE_EVIDENCE=true` only for local development when Storage is
not configured; inline evidence is limited to 2 MB per file.

## Run both apps

The dashboards read their data from the API. If only the web app is running,
every dashboard shows empty metrics and errors. Start both apps with one command:

```bash
npm run dev
```

On Windows PowerShell, if `npm.ps1` is blocked by the execution policy, run
`npm.cmd run dev` instead.

Alternatively, use two terminals:

```bash
# Terminal 1 - API on http://localhost:5000
npm run dev:server

# Terminal 2 - web app on http://localhost:5173
npm run dev:client
```

Health check: <http://localhost:5000/api/health>

If dashboards are empty, open the health check first. It must return
`"db": "connected"`; otherwise the API is down or connected to an empty
database. In that case check `MONGODB_URI` / `MONGODB_DB` in `server/.env`
(the embedded fallback starts with an empty database).

If port 5000 is busy:

```powershell
Get-NetTCPConnection -LocalPort 5000 -State Listen |
  Select-Object -ExpandProperty OwningProcess -Unique |
  ForEach-Object { Stop-Process -Id $_ -Force }
```

## Main API routes

All routes except `/api/health` require a Firebase ID token.

| Area | Routes |
| --- | --- |
| Profile | `GET/PATCH /api/users/me`, `POST /api/users/volunteer`, `GET /api/users/volunteers` |
| Complaints | `GET/POST /api/posts`, `GET/PATCH/DELETE /api/posts/:id`, `PATCH /api/posts/:id/status`, `POST /api/posts/:id/responses` |
| Officer workflow | `POST /api/posts/:id/verify`, `GET /api/posts/:id/duplicates`, `POST /api/posts/:id/assign`, `POST /api/posts/:id/notes`, `POST /api/posts/:id/corrective-actions` |
| Volunteer workflow | `GET /api/posts/assigned`, `PATCH /api/posts/:id/investigation`, `POST /api/posts/:id/investigation/report` |
| Intelligence | `GET /api/intelligence/hotspots`, `GET /api/intelligence/areas`, `GET /api/intelligence/risk/:id`, `GET /api/analytics/summary`, `GET /api/analytics/trends` |
| Alerts | `GET /api/alerts`, `PATCH /api/alerts/:id/status`, `POST /api/alerts/scan` |
| Admin | `GET/PATCH /api/users`, `GET/PUT /api/settings`, `GET /api/audit`, `GET /api/reports/admin.pdf` |

Statuses: `Submitted -> Under Review -> Verified -> Investigation -> Action Taken -> Resolved`
(plus `Rejected`).

## Build and checks

```bash
npm run lint
npm run build
```
