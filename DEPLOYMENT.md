# Deploy Nature360 (Vercel + Render)

Frontend on **Vercel**, API on **Render**, database on **MongoDB Atlas**, auth/storage on **Firebase**.

```
Browser -> Vercel (React SPA) -> Render (Express API) -> MongoDB Atlas
                    |                    |
                    +---- Firebase Auth / Storage
```

Both apps are in one repo. `vercel.json` and `render.yaml` at the repo root hold the
build settings, so no manual build commands are needed.

---

## 1. Set up MongoDB Atlas

1. Create a free account at <https://www.mongodb.com/atlas> and create an **M0 Free** cluster.
2. **Database Access -> Add new database user**: choose password auth, save the password.
3. **Network Access -> Add IP Address -> Allow Access from Anywhere** (`0.0.0.0/0`).
   Render does not have a static IP on the free plan. For production on a paid plan,
   allow only Render's outbound IPs.
4. **Database -> Connect -> Drivers -> Node.js**: copy the connection string. It looks like
   `mongodb+srv://user:password@cluster.mongodb.net/?retryWrites=true&w=majority`.
5. URL-encode special characters in the password (`@` -> `%40`, `#` -> `%23`, `:` -> `%3A`).
6. You will use this string as `MONGODB_URI`, and `nature360` as `MONGODB_DB`.

---

## 2. Set up Firebase

1. Create a project at <https://console.firebase.google.com>.
2. **Authentication -> Sign-in method**: enable **Email/Password** and **Google**.
3. **Authentication -> Settings -> Authorized domains**: add your Vercel domain
   (e.g. `nature360.vercel.app`). `localhost` is already there.
4. **Storage -> Get started**: create the default bucket. Note the bucket name
   (e.g. `your-project.firebasestorage.app`) for `VITE_FIREBASE_STORAGE_BUCKET`.
5. **Project settings -> Your apps -> Web app**: register an app and copy the web config
   values: `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`.
6. In **Storage -> Rules**, allow authenticated users to write complaint evidence:

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

Tighten these rules before going public. Keep `VITE_ALLOW_INLINE_EVIDENCE=false` in production.

> The `apiKey` is a public web key. The server needs the **same** key as the client
> (`FIREBASE_API_KEY` = `VITE_FIREBASE_API_KEY`) to verify ID tokens. It is not a secret,
> but it must be set on both services.

---

## 3. Deploy the API on Render

### 3.1 Local pre-flight (PowerShell)

```powershell
git remote -v
git status --short

$env:NODE_ENV = "production"
npm --prefix server ci
node --check server/index.js
node --check server/middleware/auth.js
npm --prefix server start
```

`npm --prefix server start` only boots fully when `MONGODB_URI` and `FIREBASE_API_KEY`
are set. Without `server/.env` it fails fast with a clear error — that is expected.
Render runs these two commands for you:

```
Build Command: npm --prefix server ci
Start Command: npm --prefix server start
```

### 3.2 Install and validate the Render CLI (optional but recommended)

```powershell
winget install render.cli
render --version
render login
render whoami
render blueprints validate render.yaml
```

On macOS: `brew install render`. On Linux:
`curl -fsSL https://raw.githubusercontent.com/render-oss/cli/refs/heads/main/bin/install.sh | sh`.
`render blueprints validate` needs no login and exits non-zero on errors.

Commit and push before creating the service:

```powershell
git add render.yaml .gitignore DEPLOYMENT.md
git commit -m "Add Render and Vercel deployment configs"
git push
```

### 3.3 Create the service — choose one method

**Option A — Blueprint from the CLI (requires Render CLI v2.35.0+)**

```powershell
render ea blueprints create --name nature360 --branch main
```

It prints a Blueprint ID (`exs-...`). Create `env-values.json` in the repo root:

```json
{
  "MONGODB_URI": "mongodb+srv://user:encoded-password@cluster.mongodb.net/?retryWrites=true&w=majority",
  "FIREBASE_API_KEY": "AIza...",
  "CORS_ORIGIN": "https://nature360.vercel.app",
  "ADMIN_EMAILS": "you@example.com",
  "OFFICER_EMAILS": "",
  "VOLUNTEER_EMAILS": ""
}
```

Then approve the plan:

```powershell
render ea blueprints plan exs-xxxxxxxx
render ea blueprints approve exs-xxxxxxxx --manual-env-vars-file .\env-values.json
```

`env-values.json` is gitignored — delete it after approving. Render only accepts
`sync: false` values when a service is first created; later changes are made in the
dashboard.

**Option B — Dashboard (simplest)**

1. Render Dashboard -> **New -> Blueprint** (reads `render.yaml`) or
   **New -> Web Service**.
2. If using Web Service, set:
   - **Root Directory**: leave empty (repo root)
   - **Runtime**: Node
   - **Build Command**: `npm --prefix server ci`
   - **Start Command**: `npm --prefix server start`
   - **Health Check Path**: `/api/health`
3. Fill these environment variables:

| Key | Value |
| --- | --- |
| `NODE_ENV` | `production` (already in `render.yaml`) |
| `MONGODB_DB` | `nature360` (already in `render.yaml`) |
| `MONGODB_URI` | Atlas connection string from step 1 |
| `FIREBASE_API_KEY` | Firebase web `apiKey` from step 2 |
| `CORS_ORIGIN` | Your Vercel URL, e.g. `https://nature360.vercel.app` |
| `ADMIN_EMAILS` | Your admin email (optional) |
| `OFFICER_EMAILS` | Officer emails, comma separated (optional) |
| `VOLUNTEER_EMAILS` | Volunteer emails, comma separated (optional) |

### 3.4 Verify the deployed API

```powershell
curl.exe https://<your-service>.onrender.com/api/health
# or
Invoke-RestMethod https://<your-service>.onrender.com/api/health
```

Expected:

```json
{ "ok": true, "service": "nature360-api", "db": "connected", "time": "..." }
```

If `db` is `disconnected`, recheck `MONGODB_URI`, the URL-encoded password, and Atlas
Network Access. Copy this Render URL — you need it in the next step.

### 3.5 Useful Render commands

Replace `srv-xxxxxxxx` with the service ID from the Render dashboard:

```powershell
render logs --resources srv-xxxxxxxx --tail
render deploys list srv-xxxxxxxx
render deploys create srv-xxxxxxxx --wait
render restart srv-xxxxxxxx --confirm
```

Use `render deploys create ... --wait` after changing `CORS_ORIGIN` in step 5.

---

## 4. Deploy the frontend on Vercel

1. Push the repo to GitHub/GitLab.
2. Vercel -> **Add New -> Project**, import the repository.
3. Keep these detected from `vercel.json` (do not change Root Directory):
   - **Framework Preset**: Vite
   - **Install Command**: `npm --prefix client ci`
   - **Build Command**: `npm --prefix client run build`
   - **Output Directory**: `client/dist`
4. Add environment variables **before** deploying:

| Key | Value |
| --- | --- |
| `VITE_API_URL` | `https://<your-service>.onrender.com/api` (no trailing slash) |
| `VITE_FIREBASE_API_KEY` | Firebase web `apiKey` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase `authDomain` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase `projectId` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase `storageBucket` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase `messagingSenderId` |
| `VITE_FIREBASE_APP_ID` | Firebase `appId` |
| `VITE_ALLOW_INLINE_EVIDENCE` | `false` |

5. Click **Deploy**. Vercel gives you a URL like `https://nature360.vercel.app`.
6. Open it, sign in, and check the dashboards load real data.

---

## 5. Connect the two (final step)

The Vercel URL from step 4 must be allowed by the API:

1. Render -> `nature360-api` -> **Environment**.
2. Set `CORS_ORIGIN` to `https://<your-project>.vercel.app`
   (or a comma-separated list: `https://nature360.vercel.app,https://nature360-git-main.vercel.app`).
3. Redeploy the Render service: **Manual Deploy -> Deploy latest commit**.
4. In Firebase **Authentication -> Settings -> Authorized domains**, confirm the
   Vercel domain is present.

Done. The site is live at the Vercel URL.

---

## 6. Custom domains (optional)

- **Vercel**: Project -> Settings -> Domains -> add your domain and point the DNS records as shown.
- **Render**: Service -> Settings -> Custom Domain -> add `api.yourdomain.com`, then use
  `https://api.yourdomain.com/api` as `VITE_API_URL` and add that domain to `CORS_ORIGIN`.
- Add both domains to Firebase authorized domains and update `VITE_FIREBASE_AUTH_DOMAIN`
  if you use a custom auth domain.

---

## 7. What makes it fast

- Firebase ID tokens are verified with Google **once per token** and cached in memory until
  they expire instead of making a network call on every request.
- API responses are gzip-compressed (`compression`); health checks are never cached.
- MongoDB uses a 20-connection pool and the collection indexes are defined in the models.
- The React build is split into lazy-loaded route chunks plus stable vendor chunks
  (`react`, `firebase`, `charts`, `maps`, `motion`, `router`, `icons`), so returning
  visitors re-download very little.
- Vercel serves `/assets/*` with `Cache-Control: immutable` for one year.

For the fastest API response times, upgrade the Render service from **Free** to **Starter**:
free services sleep after inactivity and the first request after a sleep can take ~50s.

---

## 8. Local development (unchanged)

```bash
npm run install:all
npm run dev
```

`client/.env` and `server/.env` keep the localhost values from the `.env.example` files.
Production uses environment variables on Vercel/Render; no `.env` file is shipped.

---

## 9. Troubleshooting

| Symptom | Fix |
| --- | --- |
| Browser console: `Origin ... is not allowed by CORS` | Add the exact Vercel URL to `CORS_ORIGIN` on Render and redeploy. |
| `Server auth is not configured` | Set `FIREBASE_API_KEY` on Render (same as `VITE_FIREBASE_API_KEY`). |
| `401 / Your session is invalid` | Add the Vercel domain to Firebase authorized domains; check the Firebase API key is correct. |
| Health check `db: disconnected` | Check `MONGODB_URI`, URL-encoded password, and Atlas Network Access. |
| Dashboards empty with `db: connected` | The Atlas database is empty; role bootstrap emails sign in to create users, then submit complaints. |
| First request is very slow | Render free-tier cold start; upgrade to Starter. |
| `VITE_API_URL` wrong in built site | Vercel env vars are baked at build time; redeploy after changing them. |
| `npm error Missing script: "build"` | Render ran `npm run build` in `server/`. Set **Root Directory** blank + **Build Command** `npm --prefix server ci`, or Root Directory `server` + Build Command `npm ci`. |
| PDF/analytics slow | Ensure Atlas indexes exist; Mongoose creates them from the model definitions on connect. |
