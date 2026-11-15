import { useCallback, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { AuthContext } from "./authContext.jsx";
import { auth } from "../config/firebase";
import { ensureUserProfile, getUserProfile } from "../features/auth/services/authServices";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (authUser) => {
    if (!authUser) {
      setProfile(null);
      return null;
    }

    const fallback = {
      uid: authUser.uid,
      name: authUser.displayName || "",
      email: authUser.email || "",
      role: "Citizen",
      createdAt: null,
    };

    try {
      const stored = await getUserProfile(authUser.uid).then(
        (existing) => existing ?? ensureUserProfile(authUser),
      );
      const merged = {
        ...fallback,
        ...(stored || {}),
        name: stored?.name || fallback.name,
        email: stored?.email || fallback.email,
      };
      setProfile(merged);
      return merged;
    } catch (error) {
      // Do not block the session if Firestore is unreachable or rules deny reads.
      console.error("Unable to load user profile:", error);
      setProfile(fallback);
      return fallback;
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      // Never block the UI on the Firestore profile fetch.
      setLoading(false);

      if (authUser) {
        loadProfile(authUser);
      } else {
        setProfile(null);
      }
    });

    return unsubscribe;
  }, [loadProfile]);

  const refreshProfile = useCallback(async () => {
    if (!auth.currentUser) return null;
    return loadProfile(auth.currentUser);
  }, [loadProfile]);

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      refreshProfile,
    }),
    [user, profile, loading, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthProvider };
