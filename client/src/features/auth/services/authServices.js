import { deleteApp, initializeApp } from "firebase/app";
import {
  GoogleAuthProvider,
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  getAuth,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { app, auth, db } from "../../../config/firebase";

const USERS_COLLECTION = "users";
const REGISTRATION_APP_NAME = "ecotrack-registration";

/**
 * Creates the Firebase Auth account on a temporary secondary app so the
 * primary session stays signed out. That guarantees the user always lands on
 * the login page after registering.
 *
 * The Firestore profile document is created on the first successful login
 * (see ensureUserProfile), where the request is properly authenticated.
 */
export async function registerUser({ name, email, password }) {
  const secondaryApp = initializeApp(app.options, REGISTRATION_APP_NAME);
  const secondaryAuth = getAuth(secondaryApp);

  try {
    const credential = await createUserWithEmailAndPassword(
      secondaryAuth,
      email.trim(),
      password,
    );

    await updateProfile(credential.user, { displayName: name.trim() });
    await signOut(secondaryAuth);

    return {
      uid: credential.user.uid,
      name: name.trim(),
      email: credential.user.email,
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

/**
 * Google sign-in. Works both as a first-time sign-up and as a returning login;
 * the Firestore profile document is created on the first authenticated load.
 */
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

function normalizeProfile(data) {
  return {
    ...data,
    createdAt: data.createdAt?.toDate?.() ?? null,
  };
}

export async function getUserProfile(uid) {
  const snapshot = await getDoc(doc(db, USERS_COLLECTION, uid));
  if (!snapshot.exists()) return null;
  return normalizeProfile(snapshot.data());
}

/**
 * Creates the profile document the first time an account signs in.
 */
export async function ensureUserProfile(user) {
  const reference = doc(db, USERS_COLLECTION, user.uid);
  const snapshot = await getDoc(reference);

  if (snapshot.exists()) {
    return normalizeProfile(snapshot.data());
  }

  const profile = {
    uid: user.uid,
    name: user.displayName?.trim() || user.email?.split("@")[0] || "EcoTrack member",
    email: user.email || "",
    role: "Citizen",
    createdAt: serverTimestamp(),
  };

  await setDoc(reference, profile);

  return { ...profile, createdAt: new Date() };
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
  "permission-denied": "Your profile could not be saved. Check your Firestore rules and try again.",
};

export function getAuthErrorMessage(error) {
  if (!error) return "";
  const code = error.code || "";
  return AUTH_ERROR_MESSAGES[code] || error.message || "Something went wrong. Please try again.";
}
