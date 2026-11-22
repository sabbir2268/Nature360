import User from "../models/User.js";

function getFirebaseApiKey() {
  return (process.env.FIREBASE_API_KEY || "").trim();
}

function emailList(name) {
  return (process.env[name] || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function bootstrappedRole(email) {
  const normalized = String(email || "").trim().toLowerCase();
  if (!normalized) return null;
  if (emailList("ADMIN_EMAILS").includes(normalized)) return "Admin";
  if (emailList("OFFICER_EMAILS").includes(normalized)) return "Officer";
  if (emailList("VOLUNTEER_EMAILS").includes(normalized)) return "Volunteer";
  return null;
}

async function verifyFirebaseToken(idToken) {
  const apiKey = getFirebaseApiKey();

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
      signal: AbortSignal.timeout(10000),
    },
  );

  if (!response.ok) return null;

  const data = await response.json();
  const account = data?.users?.[0];
  if (!account?.localId) return null;

  return {
    uid: account.localId,
    email: account.email || "",
    name: account.displayName || account.email?.split("@")[0] || "Nature360 member",
    emailVerified: Boolean(account.emailVerified),
  };
}

/**
 * Verifies the Firebase ID token, then finds or creates the user in MongoDB.
 * The MongoDB user document is attached as req.user.
 */
export async function requireAuth(req, res, next) {
  try {
    if (!getFirebaseApiKey()) {
      return res.status(500).json({
        error: "Server auth is not configured. Add FIREBASE_API_KEY to server/.env.",
        code: "auth_not_configured",
      });
    }

    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";

    if (!token) {
      return res.status(401).json({ error: "Please sign in again.", code: "unauthorized" });
    }

    const firebaseUser = await verifyFirebaseToken(token);
    if (!firebaseUser) {
      return res.status(401).json({
        error: "Your session is invalid or has expired. Please sign in again.",
        code: "unauthorized",
      });
    }

    const bootstrapRole = bootstrappedRole(firebaseUser.email);

    const user = await User.findOneAndUpdate(
      { uid: firebaseUser.uid },
      {
        $set: {
          email: firebaseUser.email,
          emailVerified: firebaseUser.emailVerified,
          lastLoginAt: new Date(),
          ...(bootstrapRole ? { role: bootstrapRole } : {}),
        },
        $setOnInsert: {
          name: firebaseUser.name,
          status: "Active",
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    if (user.status === "Suspended") {
      return res.status(403).json({
        error: "Your account has been suspended. Please contact an administrator.",
        code: "account_suspended",
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    console.error("Auth verification failed:", error);

    if (error.name === "TimeoutError" || error.name === "AbortError") {
      return res.status(503).json({
        error: "The authentication service is taking too long to respond. Please try again.",
        code: "auth_unavailable",
      });
    }

    return res.status(401).json({
      error: "Your session could not be verified. Please sign in again.",
      code: "unauthorized",
    });
  }
}

/** Role-based access control. Use after requireAuth. */
export function requireRole(...roles) {
  const allowed = roles.flat().filter(Boolean);

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Please sign in again.", code: "unauthorized" });
    }

    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({
        error: "You do not have permission to perform this action.",
        code: "forbidden",
      });
    }

    return next();
  };
}

export function isStaff(user) {
  return user?.role === "Officer" || user?.role === "Admin";
}
