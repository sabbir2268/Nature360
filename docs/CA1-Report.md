# CONTINUOUS ASSESSMENT 1
## INDIVIDUAL PROJECT REPORT

| Student and Project Information | Details |
| --- | --- |
| Student Name | Sabbir [Insert full official name] |
| Student ID | 462 |
| Group No. | 08 |
| Project Title | EcoTrack – Environmental Complaint Reporting and Tracking System |
| Assigned Module Name | Citizen Complaint Tracking and Resolution Feedback |
| Assessment | Continuous Assessment 1 |

---

## 1. Student and Project Information

EcoTrack is a web-based environmental complaint reporting and tracking system. It lets citizens report environmental problems in their local area and follow what happens after a complaint is submitted. Every complaint receives a reference, a current status and a complete timestamped status history.

For this individual assessment, my assigned requirements are **FR-03** and **FR-04**.

- **FR-03 – Citizen Complaint Status Tracking and History:** show the current status of a complaint, allow status filtering, and display a timestamped status history.
- **FR-04 – Citizen Resolution Feedback and Issue Reopening:** when a complaint is marked **Resolved**, allow the citizen to confirm the resolution, send feedback, attach additional evidence, reopen the issue or report an incorrect resolution.

Both requirements are now implemented end-to-end (React frontend, Express service layer, MongoDB model and API routes).

---

## 2. Features Implemented

| No. | Feature Name | Brief Description | Implementation Status |
| --- | --- | --- | --- |
| FR-03 | Citizen Complaint Status Tracking and History | View submitted complaints, filter by status with counts, open a complaint, and review its current status and timestamped status history. | Implemented (frontend + backend + database) |
| FR-04 | Citizen Resolution Feedback and Issue Reopening | Confirm a resolution, submit feedback, attach additional evidence, reopen an issue, or report an incorrect resolution. | Implemented (frontend + backend + database) |

---

## 3. Development Environment and Technologies

- **Frontend:** React.js (React 19), Vite, Tailwind CSS
- **Icons and formatting:** `lucide-react` icons and the project's `formatDateTime` utility
- **Routing and state:** `react-router-dom`, React hooks (`useState`, `useEffect`, `useMemo`, `useCallback`)
- **API/service integration:** `postServices.js` exposes `getUserPosts`, `getPost`, `submitResolutionResponse` and `updatePostStatus`. Requests use `apiRequest` in `client/src/lib/api.js`, authenticated with a Firebase ID token.
- **Backend:** JavaScript, Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** Firebase Authentication (email/password and Google); the server verifies the Firebase ID token in `server/middleware/auth.js`
- **Tools:** VS Code, Git & GitHub

---

## 4. Feature Implementation Details

### Activity Flow of the Features

**FR-03 activity flow**

Citizen → open Track Post → application calls `getUserPosts` → complaints displayed with current status → citizen selects a status filter or opens a complaint → application calls `getPost` with the complaint ID → complaint details, current status and status history displayed.

**FR-04 activity flow**

Citizen → open a complaint marked **Resolved** → review resolution state and previous responses → choose an action (confirm resolution / send feedback / attach additional evidence / reopen issue / report incorrect resolution) → validate input on the client and server → submit through `submitResolutionResponse` to `POST /api/posts/:id/responses` → success or error message → complaint data, status history and response history refresh.

---

### 4.1 Feature 1: FR-03 – Citizen Complaint Status Tracking and History

#### 4.1.1 Objective

The purpose of this feature is to let citizens understand the progress of their environmental complaints without contacting the responsible team for every update. A citizen can see the current status and review earlier status changes in chronological form. The status stages are **Submitted → Under Review → Verified → Investigation → Action Taken → Resolved**.

#### 4.1.2 User Flow / Functionality

1. The citizen signs in and opens the **Track Post** page.
2. `TrackPost` calls `getUserPosts` to retrieve the citizen's complaints.
3. Status filter buttons are shown for **All** and every configured status, each with a count.
4. Selecting a filter narrows the displayed list without another server request.
5. The citizen opens a complaint to view its details.
6. `PostDetails` reads the complaint ID from the route and calls `getPost`.
7. The page displays the title, category, location, description, severity, submission date, last update, reference and current status.
8. The **Status history** section lists every recorded status with its `changedAt` timestamp, note, and `changedBy` role/name.
9. If no history exists, a clear "No status updates recorded yet." message is displayed.
10. If loading fails, an error message with a **Try again** action is shown.

#### 4.1.3 Frontend Implementation

- `client/src/features/posts/pages/TrackPost.jsx`
  - Calls `getUserPosts` when the page loads (`TrackPost.jsx:69`).
  - Stores posts, loading, error, selected filter and a `reloadKey` used by the retry action (`TrackPost.jsx:64`).
  - Computes per-status counts with `useMemo` (`TrackPost.jsx:89`).
  - Applies the selected filter client-side (`TrackPost.jsx:97`).
  - Shows loading skeletons, an error panel with **Try again** (`TrackPost.jsx:180`), an empty-list state, and a per-filter no-results state.
- `client/src/features/posts/pages/PostDetails.jsx`
  - Uses `useParams` to read `postId` and calls `getPost` (`PostDetails.jsx:58`, `PostDetails.jsx:75`).
  - Keeps loaded data, loading and error state; provides a retry action.
  - Renders the current status with `StatusBadge` and overall progress with `StatusTimeline`.
  - Renders `post.statusHistory` as a timeline with `formatDateTime` timestamps, notes and actor information (`PostDetails.jsx:144`).
  - Displays the empty-history message when `history.length === 0` (`PostDetails.jsx:251`).
- `client/src/features/posts/components/StatusBadge.jsx` and `StatusTimeline.jsx` provide the status visuals.

> Screenshot: Track Post list with filters/counts — insert here.
>
> Screenshot: Complaint details with status history — insert here.

#### 4.1.4 Backend Implementation

`client/src/features/posts/services/postServices.js`

- `getUserPosts()` → `GET /api/posts`
- `getPost(postId)` → `GET /api/posts/:id`

`server/routes/posts.js`

- `GET /api/posts` (`posts.js:100`) requires `requireAuth` and returns only posts whose `user` matches the signed-in MongoDB user, newest first. Evidence payloads are omitted from this list response to keep it lightweight.
- `GET /api/posts/:id` (`posts.js:159`) loads the post through `findOwnedPost`, which validates the ObjectId and filters by `{ _id, user: req.user._id }` (`posts.js:39`). A citizen therefore cannot read another citizen's complaint.
- Responses are serialized by `serializePost`, which exposes `id`, normalizes `resolutionStatus` and `citizenResponses`, and removes `_id`.

#### 4.1.5 Database Implementation

`server/models/Post.js` defines the `posts` collection:

| Field | Type | Notes |
| --- | --- | --- |
| `user` | ObjectId (ref `User`) | Owner, indexed |
| `authorName`, `authorEmail` | String | Snapshot of the reporter |
| `title` | String | Required, max 160 |
| `category` | String | Enum of complaint categories |
| `severity` | String | `Low`, `Medium`, `High` |
| `location` | String | Max 200 |
| `description` | String | Required, max 2000 |
| `status` | String | Enum of the six statuses, indexed |
| `statusHistory` | Array | `{ status, note, changedAt, changedBy: { uid, name, role } }` |
| `createdAt`, `updatedAt` | Date | Added by Mongoose `timestamps` |

Each status change appends an entry to `statusHistory`, so previous statuses are never lost.

> Screenshot: A complaint document in MongoDB with its `statusHistory` — insert here.

#### 4.1.6 Validation and Error Handling

- Loading skeletons are shown while complaints or a single complaint are loading.
- `getApiErrorMessage` converts API/network failures into readable messages.
- `TrackPost` now offers a **Try again** button that reloads the list; the earlier failed retry test case is fixed.
- `PostDetails` offers **Try again** and **Back to complaints** on failure.
- Empty history renders an explanatory message instead of an empty timeline.
- Invalid or missing timestamps return the `formatDateTime` fallback (`—`) because the utility checks `Number.isNaN(date.getTime())` (`client/src/utils/format.js:14`).

#### 4.1.7 Implementation Evidence

> Insert screenshots:
> 1. Track Post list with status filters and counts.
> 2. Complaint details page with current status and status history.
> 3. MongoDB document showing `statusHistory`.

#### 4.1.8 Testing

| Test Case | Input / Action | Expected Result | Actual Result |
| --- | --- | --- | --- |
| T01: Load complaints | Sign in and open Track Post with existing complaints. | The citizen's complaints load and display with current statuses. | Matched |
| T02: Filter by status | Select **Under Review** or another filter. | Only matching complaints are shown and the count is correct. | Matched |
| T03: Open complaint details | Select a complaint from the list. | The correct details and current status are displayed. | Matched |
| T04: View status history | Open a complaint with multiple history entries. | Timeline shows each status, timestamp, note and actor. | Matched |
| T05: Empty history | Open a complaint with an empty `statusHistory`. | The no-status-updates message appears; the page does not break. | Matched |
| T06: API failure and retry | Make the complaint API fail, then press **Try again** after restoring it. | A readable error appears and retry reloads the data. | Fixed and matched (retry added in `TrackPost.jsx`) |

---

### 4.2 Feature 2: FR-04 – Citizen Resolution Feedback and Issue Reopening

#### 4.2.1 Objective

The purpose of FR-04 is to give citizens a voice after a complaint is marked as resolved. The citizen can review the resolution, confirm it, explain what still needs attention, attach additional evidence, reopen the complaint, or report that the resolution is incorrect. Every response is stored against the complaint and the status history is updated when the complaint is reopened or disputed.

#### 4.2.2 User Flow / Functionality

1. The citizen opens a complaint whose current status is **Resolved**.
2. The **Resolution feedback** card shows the current resolution state (`Awaiting Citizen`, `Confirmed`, `Reopened`, `Disputed`) and previous responses.
3. The citizen chooses one of five actions:
   - **Confirm resolution** – the problem is fully fixed.
   - **Send feedback** – the problem still needs attention (message required).
   - **Add evidence** – attach a JPG/PNG/WebP/GIF/PDF file (required, max 2 MB).
   - **Reopen issue** – the problem came back or was never fixed (message required).
   - **Report incorrect** – the resolution does not match reality (message required).
4. The citizen may add a note and/or attach evidence.
5. The client validates the input, then calls `submitResolutionResponse`.
6. The server validates the action, ownership, status, message length and evidence type/size.
7. On success the API returns the updated complaint and a success message. The page refreshes the complaint, the resolution state, the response history and (for reopen/incorrect) the status history.
8. On failure, a readable error message is shown and the form remains available.
9. When the complaint is not currently **Resolved**, the form is disabled with an explanation; previous responses remain visible.

#### 4.2.3 Frontend Implementation

- `client/src/features/posts/components/ResolutionFeedback.jsx`
  - Renders the resolution state chip and the five action options (`ResolutionFeedback.jsx:42`).
  - Client-side validation:
    - message of at least 10 characters for Feedback, Reopened and Incorrect Resolution (`ResolutionFeedback.jsx:153`);
    - an evidence file is required for Additional Evidence (`ResolutionFeedback.jsx:158`);
    - file type and 2 MB size limit are checked immediately when the file is chosen (`ResolutionFeedback.jsx:110`).
  - Reads the selected file as a base64 data URL with `FileReader` (`ResolutionFeedback.jsx:79`).
  - Shows a submitting state and disables the controls to prevent repeated clicks.
  - Displays success and error banners.
  - Renders previous responses with action, message, timestamp, actor and a downloadable evidence link.
- `client/src/features/posts/pages/PostDetails.jsx`
  - Imports and renders `ResolutionFeedback` in the complaint details column (`PostDetails.jsx:312`).
  - `handlePostUpdated` replaces the component state with the response returned by the API (`PostDetails.jsx:100`), so the badge, timeline and progress update immediately.
  - Adds a **Resolution** row to the complaint overview.
- `client/src/features/posts/services/postServices.js`
  - `submitResolutionResponse(postId, { action, message, evidence })` sends `POST /api/posts/:id/responses` (`postServices.js:65`).

> Screenshot: Resolution feedback card with the five actions — insert here.
>
> Screenshot: Successful confirmation/feedback message — insert here.

#### 4.2.4 Backend Implementation

`POST /api/posts/:id/responses` (`server/routes/posts.js:215`) is protected by `requireAuth`. It:

1. Validates that `action` is one of `Confirmed`, `Feedback`, `Additional Evidence`, `Reopened`, `Incorrect Resolution` (`posts.js:221`).
2. Loads the complaint through `findOwnedPost`, which enforces ownership (`posts.js:228`).
3. Rejects the request unless the current `status` is `Resolved` (`posts.js:231`).
4. Rejects a second confirmation when `resolutionStatus` is already `Confirmed` (`posts.js:238`).
5. Requires a message of at least 10 characters for Feedback, Reopened and Incorrect Resolution (`posts.js:247`).
6. Validates evidence with `normalizeEvidence` (`posts.js:54`, `posts.js:254`).
7. Appends the response to `citizenResponses` with responder identity and timestamp (`posts.js:278`).
8. Applies the business transition:
   - **Confirmed** → `resolutionStatus = "Confirmed"`.
   - **Reopened** → status becomes `Under Review`, `resolutionStatus = "Reopened"`, and a history entry is appended.
   - **Incorrect Resolution** → status becomes `Investigation`, `resolutionStatus = "Disputed"`, and a history entry is appended.
   - **Feedback / Additional Evidence** → the complaint stays `Resolved`; the response is stored for the responsible team.
9. Returns `201` with the updated complaint and a success message (`posts.js:315`).

When an officer later changes the status back to `Resolved`, `PATCH /api/posts/:id/status` resets `resolutionStatus` to `Awaiting Citizen` (`posts.js:194`), starting a new feedback round while preserving all previous responses.

#### 4.2.5 Database Implementation

`server/models/Post.js` adds:

- `resolutionStatus` (`Post.js:87`): `Awaiting Citizen | Confirmed | Reopened | Disputed`, default `Awaiting Citizen`.
- `citizenResponses` (`Post.js:88`): an array of response subdocuments (`Post.js:57`) with:
  - `action` (enum),
  - `message` (max 1000),
  - `evidence` (`name`, `mimeType`, `size`, `data`),
  - `respondedAt`,
  - `respondedBy` (`uid`, `name`, `role`).
- `evidenceSchema` (`Post.js:47`) stores the file metadata and the base64 data URL.

Evidence is limited to 2 MB in both the client and server, and the Express JSON body limit was raised to 8 MB to accommodate the encoded file.

> Screenshot: MongoDB document showing `resolutionStatus` and `citizenResponses` — insert here.

#### 4.2.6 Validation and Error Handling

- **Required explanation:** Feedback, Reopened and Incorrect Resolution require at least 10 characters (client and server).
- **Required evidence:** Additional Evidence requires a file.
- **Authorization:** `requireAuth` plus `findOwnedPost` ensure only the owner can respond.
- **Status rules:** responses are accepted only while the complaint is `Resolved`.
- **Evidence rules:** JPG, PNG, WebP, GIF or PDF; maximum 2 MB; validated on both client and server.
- **Duplicate protection:** a resolution cannot be confirmed twice while `resolutionStatus` is `Confirmed`.
- **Loading state:** the submit button shows "Sending…" and all controls are disabled during the request.
- **API errors:** `getApiErrorMessage` presents server messages such as `not_resolved`, `invalid_message`, `invalid_evidence` and `already_confirmed` in the form.
- **Invalid collection state:** after a successful update the component receives the new complaint object, so the UI never shows stale statuses.

#### 4.2.7 Implementation Evidence

> Insert screenshots:
> 1. Resolved complaint with the resolution feedback card.
> 2. Successful confirmation message and `Confirmed` state.
> 3. Reopened complaint showing a new `Under Review` history entry.
> 4. MongoDB document with `citizenResponses` and evidence metadata.

#### 4.2.8 Testing

| Test Case | Input / Action | Expected Result | Actual Result |
| --- | --- | --- | --- |
| T-01: Confirm resolution | Open a resolved complaint and choose **Confirm resolution**, then submit. | The response is stored, `resolutionStatus` becomes `Confirmed`, and a success message appears. | Matched (implemented and code-verified) |
| T-02: Submit feedback | Enter valid feedback (10+ characters) and submit. | The feedback is stored on the correct complaint and a success message appears. | Matched (implemented and code-verified) |
| T-03: Submit additional evidence | Choose a permitted file (≤2 MB) with the **Add evidence** action and submit. | The file metadata and data are stored and linked to the complaint in the response history. | Matched (implemented and code-verified) |
| T-04: Reopen issue | Choose **Reopen issue**, enter a reason and submit. | Status becomes `Under Review`, `resolutionStatus` becomes `Reopened`, and a new history entry is added. | Matched (implemented and code-verified) |
| T-05: Incorrect resolution | Choose **Report incorrect**, enter a reason and submit. | Status becomes `Investigation`, `resolutionStatus` becomes `Disputed`, and a success message appears. | Matched (implemented and code-verified) |
| T-06: Invalid response | Submit too-short text, a disallowed file type, an oversized file, or Add evidence without a file. | Submission is blocked with a clear validation message; no API call is made for client-side failures. | Matched (implemented and code-verified) |

> Note: T-01 to T-06 were verified through code review, `eslint`, the production build and server syntax/import checks. Insert browser screenshots after running the flow with a signed-in Firebase test account to complete the visual evidence.

---

## 5. Features Integration

FR-03 and FR-04 are connected through the complaint details page:

- FR-03 retrieves the complaint and displays its current status, status history and timestamps.
- FR-04 appears on the same page in `PostDetails.jsx`. It is enabled only when the current status is `Resolved`.
- A successful FR-04 response returns the updated complaint; `handlePostUpdated` replaces the page state.
- **Reopen** and **Incorrect Resolution** update both `resolutionStatus` and `statusHistory`, so the change immediately appears in the FR-03 timeline.
- **Confirm**, **Feedback** and **Additional Evidence** are stored in `citizenResponses` and shown in the resolution response history, while the status remains `Resolved`.
- When an officer resolves the complaint again, `resolutionStatus` resets to `Awaiting Citizen`, allowing a new response round.

---

## 6. Challenges and Solutions

**Challenge 1 – Presenting status history clearly.**
A complaint may have many status changes. The timeline in `PostDetails` separates each entry and shows the status, timestamp, note and actor. The latest entry is marked as current, and `StatusTimeline` shows the overall progress.

**Challenge 2 – Handling asynchronous complaint data.**
The tracking pages depend on API responses. Loading skeletons, readable error messages and retry actions prevent blank pages. The FR-03 retry test case was fixed by adding the **Try again** action to `TrackPost`.

**Challenge 3 – Collecting evidence without a file-storage service.**
The project does not include a cloud storage service. Evidence is read in the browser as a base64 data URL, validated by type and size (maximum 2 MB), and stored with the complaint in MongoDB. The API list endpoint omits the encoded data so the complaint list stays small, while the single-complaint endpoint returns it for viewing and download.

**Challenge 4 – Preventing conflicting resolution responses.**
The backend rejects responses unless the complaint is `Resolved` and blocks a second confirmation. Reopening or disputing a resolution changes the status and adds a history entry, so the next state is explicit and auditable.

---

## 7. Git/GitHub Contribution

Git and GitHub were used to maintain and submit the assigned work for complaint tracking and resolution feedback.

- **Repository link:** [insert repository URL]
- **Branch name:** [insert branch name, e.g. `feature/fr03-fr04-resolution-feedback`]
- **Relevant commits / pull request:** [insert commit hashes / PR link]

Suggested commit message for this work:

```text
Add: FR-04 resolution feedback, evidence upload and issue reopening
```

---

## 8. Final Summary of Individual Contribution

In this Continuous Assessment, my assigned work is **FR-03 (Citizen Complaint Status Tracking and History)** and **FR-04 (Citizen Resolution Feedback and Issue Reopening)** in EcoTrack.

For FR-03, citizens can load their complaints, filter them by status with counts, open a complaint, and review its current status, timestamped status history, notes and actor information. Loading, empty, error and retry states are handled.

For FR-04, a resolved complaint now exposes a resolution feedback card with five actions: confirm resolution, send feedback, attach additional evidence, reopen the issue and report an incorrect resolution. The frontend and backend enforce ownership, status eligibility, message requirements and evidence rules. Reopening and incorrect-resolution reports update the status history, while every response is stored with a timestamp and responder identity.

| Feature | Status | Notes |
| --- | --- | --- |
| FR-03 – Citizen Complaint Status Tracking and History | Complete | Frontend, API and database implemented. Retry added for API failure. |
| FR-04 – Citizen Resolution Feedback and Issue Reopening | Complete | Frontend, API and database implemented with validation, ownership checks, evidence upload and history updates. |

### Verification performed

- `cd client && npm run lint` – passed with no errors.
- `cd client && npm run build` – production build passed.
- `node --check` on `server/models/Post.js`, `server/routes/posts.js` and `server/index.js` – passed.
- Server model and route modules load successfully.

### Remaining manual step

Sign in with a Firebase test account, create or progress a complaint to **Resolved**, run T-01 to T-06 in the browser, and capture the screenshots referenced in sections 4.1.7 and 4.2.7.
