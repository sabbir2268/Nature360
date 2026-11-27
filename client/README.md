# Nature360 client

The React 19 single-page app for Nature360, built with Vite, Tailwind
CSS v4, Firebase Auth/Storage, Leaflet, and Recharts. See the
[project README](../README.md) for the big picture and [DEPLOYMENT.md](../DEPLOYMENT.md)
for production setup.

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

Open <http://localhost:5173>. The API must also be running (`npm run dev:server`
from the repo root), otherwise dashboards are empty.

| Script | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the built app locally |
| `npm run lint` | ESLint |

## Environment (`.env`)

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | API base URL, e.g. `http://localhost:5000/api` or `https://nature360.onrender.com/api` |
| `VITE_FIREBASE_API_KEY` | Firebase web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project id |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage bucket for evidence |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender id |
| `VITE_FIREBASE_APP_ID` | Firebase web app id |
| `VITE_ALLOW_INLINE_EVIDENCE` | Local dev only; embed evidence < 2 MB when Storage is unavailable. Keep `false` in production. |

`VITE_*` values are baked into the bundle at build time. After changing them on
Vercel, redeploy. In production builds the API client falls back to
`https://nature360.onrender.com/api` if `VITE_API_URL` is missing or points at
localhost, so the deployed app always talks to the deployed backend.

All API calls go through `src/lib/api.js`, which attaches the signed-in user's
Firebase ID token as `Authorization: Bearer <token>`. Evidence uploads go through
`src/lib/storage.js`.

## Structure

```
src/
├── main.jsx, app/          Entry point, router, lazy pages, layouts
├── components/             Shared UI, maps, and common widgets
├── config/firebase.js      Firebase app (Auth + Storage)
├── context/, features/auth Auth state and sign-in/sign-up
├── features/               One folder per area: posts, officer, volunteer,
│                           intelligence, admin, profile, settings, notifications
├── lib/                    API client and Storage helpers
├── routes/                 Private/Public/Role guards
├── styles/                 Tailwind theme and global styles
└── utils/                  Formatting, geo, and path helpers
```

Routes are declared in `src/app/router.jsx`; page paths live in `src/utils/paths.js`.
Route-based code splitting and vendor chunks are configured in `vite.config.js`.

## Firebase checklist

Enable Email/Password and Google sign-in, add the app domain to Authorized domains,
create the Storage bucket, and allow authenticated writes under `complaints/`.
Keep `VITE_ALLOW_INLINE_EVIDENCE=false` in production.
