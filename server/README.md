# Nature360 API (Express + MongoDB)

Simple backend that stores users and their environmental posts (complaints) in
MongoDB. Firebase Authentication handles sign-in; the client sends its Firebase
ID token with every request.

## Structure

```
server/
├── index.js            Express app + startup
├── config/db.js        MongoDB connection
├── models/User.js      users collection
├── models/Post.js      posts collection (+ status history)
├── middleware/auth.js  verifies the Firebase token, finds/creates the user
└── routes/
    ├── users.js        current user profile
    └── posts.js        create / list / get / update status
```

## Setup

```bash
cd server
npm install
```

Create `server/.env` and set:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=nature360
FIREBASE_API_KEY=<same value as VITE_FIREBASE_API_KEY in client/.env>
CORS_ORIGIN=http://localhost:5173,http://localhost:5199
```

Run it:

```bash
npm run dev     # node --watch
npm start       # plain node
```

Health check: `GET http://localhost:5000/api/health`

The client reads the API URL from `VITE_API_URL` (already set to
`http://localhost:5000/api` in `client/.env`).

## Endpoints

All routes except `/api/health` require
`Authorization: Bearer <firebase-id-token>`.

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Service + database status |
| GET | `/api/users/me` | Signed-in user's profile |
| GET | `/api/posts` | Posts of the signed-in user |
| POST | `/api/posts` | Create a post (starts at `Submitted`) |
| GET | `/api/posts/:id` | One post with its status history |
| PATCH | `/api/posts/:id/status` | Change status and record history |

## Statuses

`Submitted → Under Review → Verified → Investigation → Action Taken → Resolved`

Each status change appends to `statusHistory` with a timestamp, note and actor,
so previous statuses are never lost.

## Data shape

`users`

```js
{
  uid, name, email, role, createdAt, updatedAt
}
```

`posts`

```js
{
  user,                        // users._id
  authorName, authorEmail,
  title, category, severity, location, description,
  status,                      // one of the six statuses
  statusHistory: [{ status, note, changedAt, changedBy: { uid, name, role } }],
  createdAt, updatedAt
}
```
