# Nature360 / EcoTrack

Citizen-powered environmental complaint tracking. Citizens report problems,
follow each complaint through its status timeline, and officers update progress.

- **Client:** React 19 + Vite + Tailwind CSS + Firebase Authentication
- **Server:** Express + MongoDB (Mongoose) + Firebase ID-token verification
- **Profiles:** Firebase Auth for sign-in, MongoDB for users and complaints

## Project structure

```
.
├── client/   Vite React app
├── server/   Express API (users + posts/complaints)
└── package.json   Convenience scripts for both apps
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
FIREBASE_API_KEY=<same value as VITE_FIREBASE_API_KEY>
CORS_ORIGIN=http://localhost:5173
```

Create `client/.env` from `client/.env.example` with your Firebase web config and:

```env
VITE_API_URL=http://localhost:5000/api
```

`FIREBASE_API_KEY` on the server must be the same Firebase project as the
client config. The client sends the signed-in user's Firebase ID token in the
`Authorization: Bearer <token>` header on every API request.

## Run both apps

Use two terminals:

```bash
# Terminal 1 — API on http://localhost:5000
npm run dev:server

# Terminal 2 — web app on http://localhost:5173
npm run dev:client
```

Or run the server from `server/` and the client from `client/` directly.

Health check: <http://localhost:5000/api/health>

## Common problem: “Port 5000 is already in use”

Another API process is already running. Stop it before starting a new one:

```powershell
Get-NetTCPConnection -LocalPort 5000 -State Listen |
  Select-Object -ExpandProperty OwningProcess -Unique |
  ForEach-Object { Stop-Process -Id $_ -Force }
```

Then start the server again. The API prints a clear message when the port is
busy instead of crashing with an unhandled `EADDRINUSE` error.

## API

All routes except `/api/health` require a Firebase ID token.

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Service + database status |
| GET | `/api/users/me` | Signed-in user profile |
| GET | `/api/posts` | Complaints of the signed-in user |
| POST | `/api/posts` | Create a complaint |
| GET | `/api/posts/:id` | One complaint with status history |
| PATCH | `/api/posts/:id/status` | Update status and append history |

Statuses: `Submitted → Under Review → Verified → Investigation → Action Taken → Resolved`

## Build

```bash
npm run build
npm run lint
```
