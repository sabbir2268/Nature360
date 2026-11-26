import { deleteApp, initializeApp } from "firebase/app";
import {
  GoogleAuthProvider,
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  getAuth,
  reload,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { app, auth } from "../../../config/firebase";
import { apiRequest } from "../../../lib/api";

const REGISTRATION_APP_NAME = "nature360-registration";
const PENDING_ROLE_KEY = "nature360:pendingRole";

export function queueVolunteerRole(email = "") {
  try {
    window.localStorage.setItem(PENDING_ROLE_KEY, String(email).trim().toLowerCase());
  } catch {
    return null;
  }
  return true;
}

export function clearPendingRole() {
  try {
    window.localStorage.removeItem(PENDING_ROLE_KEY);
  } catch {
    return null;
  }
  return true;
}

export async function claimPendingRole(authUser = auth.currentUser) {
  let expectedEmail = null;
  try {
    expectedEmail = window.localStorage.getItem(PENDING_ROLE_KEY);
  } catch {
    return null;
  }

  if (expectedEmail === null || !authUser) return null;

  const normalizedEmail = expectedEmail.trim().toLowerCase();
  const currentEmail = String(authUser.email || "").trim().toLowerCase();
  if (normalizedEmail && normalizedEmail !== currentEmail) return null;

  const data = await apiRequest("/users/volunteer", { method: "POST" });
  clearPendingRole();
  return data.user;
}

/**
 * Creates the Firebase Auth account on a temporary secondary app so the
 * primary session stays signed out, then sends the verification email.
 * The MongoDB user profile is created by the API on the first sign-in.
 */
export async function registerUser({ name, email, password, role = "Citizen" }) {
  const secondaryApp = initializeApp(app.options, REGISTRATION_APP_NAME);
  const secondaryAuth = getAuth(secondaryApp);

  try {
    const credential = await createUserWithEmailAndPassword(
      secondaryAuth,
      email.trim(),
      password,
    );

    await updateProfile(credential.user, { displayName: name.trim() });

    let verificationSent = false;
    try {
      await sendEmailVerification(credential.user);
      verificationSent = true;
    } catch (verificationError) {
      console.warn("Verification email could not be sent:", verificationError);
    }

    await signOut(secondaryAuth);

    if (role === "Volunteer") queueVolunteerRole(credential.user.email);
    else clearPendingRole();

    return {
      uid: credential.user.uid,
      name: name.trim(),
      email: credential.user.email,
      verificationSent,
    };
  } finally {
    await deleteApp(secondaryApp);
  }
}

export async function loginUser({ email, password, remember = true }) {
  await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
  const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
  return credential.user;
}

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  const credential = await signInWithPopup(auth, provider);
  return credential.user;
}

export async function sendResetEmail(email) {
  await sendPasswordResetEmail(auth, email.trim());
}

export async function logoutUser() {
  await signOut(auth);
}

/** Re-send the Firebase verification email to the signed-in user. */
export async function sendVerificationEmail() {
  if (!auth.currentUser) {
    throw new Error("Please sign in again.");
  }
  await sendEmailVerification(auth.currentUser);
}

/** Reload the Firebase user so emailVerified reflects the latest state. */
export async function reloadCurrentUser() {
  if (!auth.currentUser) return null;
  await reload(auth.currentUser);
  return auth.currentUser;
}

/** MongoDB is the source of truth for roles and account state. */
export async function getMyProfile() {
  const data = await apiRequest("/users/me");
  return data.user;
}

export async function updateMyProfile(payload) {
  const data = await apiRequest("/users/me", { method: "PATCH", body: payload });
  return data.user;
}

const AUTH_ERROR_MESSAGES = {
  "auth/invalid-email": "That email address doesn't look valid. Please check it and try again.",
  "auth/missing-password": "Please enter your password.",
  "auth/missing-email": "Please enter your email address first.",
  "auth/user-not-found": "No account found with that email address.",
  "auth/wrong-password": "Incorrect password. Please try again.",
  "auth/invalid-credential": "Incorrect email or password. Please try again.",
  "auth/invalid-login-credentials": "Incorrect email or password. Please try again.",
  "auth/user-disabled": "This account has been disabled. Please contact support.",
  "auth/email-already-in-use": "An account with that email address already exists. Try signing in instead.",
  "auth/weak-password": "Your password is too weak. Use at least 8 characters.",
  "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
  "auth/network-request-failed": "Network error. Check your connection and try again.",
  "auth/unauthorized-domain": "This domain is not authorised in your Firebase project settings.",
  "auth/operation-not-allowed": "Email/password sign-in is not enabled for this project yet.",
  "auth/popup-blocked": "Your browser blocked the Google popup. Please allow popups and try again.",
  "auth/popup-closed-by-user": "Google sign-in was cancelled.",
  "auth/cancelled-popup-request": "",
  "auth/account-exists-with-different-credential":
    "An account already exists with this email using a different sign-in method.",
  "auth/requires-recent-login": "Please sign in again before making this change.",
};

export function getAuthErrorMessage(error) {
  if (!error) return "";
  const code = error.code || "";
  return AUTH_ERROR_MESSAGES[code] || error.message || "Something went wrong. Please try again.";
}
