import User from "../models/User.js";

const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY || "";

async function verifyFirebaseToken(idToken) {
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(FIREBASE_API_KEY)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
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
  };
}

/**
 * Verifies the Firebase ID token, then finds or creates the user in MongoDB.
 * The MongoDB user document is attached as req.user.
 */
export async function requireAuth(req, res, next) {
  try {
    if (!FIREBASE_API_KEY) {
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

    const user = await User.findOneAndUpdate(
      { uid: firebaseUser.uid },
      {
        $set: { name: firebaseUser.name, email: firebaseUser.email },
        $setOnInsert: { role: "Citizen" },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    req.user = user;
    return next();
  } catch (error) {
    console.error("Auth verification failed:", error);
    return res.status(401).json({
      error: "Your session could not be verified. Please sign in again.",
      code: "unauthorized",
    });
  }
}
