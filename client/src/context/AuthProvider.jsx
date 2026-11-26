import { useCallback, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { AuthContext } from "./authContext.jsx";
import { auth } from "../config/firebase";
import { claimPendingRole, getMyProfile } from "../features/auth/services/authServices";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState("");

  const loadProfile = useCallback(async (authUser) => {
    if (!authUser) {
      setProfile(null);
      return null;
    }

    const fallback = {
      id: null,
      uid: authUser.uid,
      name: authUser.displayName || "",
      email: authUser.email || "",
      role: "Citizen",
      status: "Active",
      emailVerified: Boolean(authUser.emailVerified),
      createdAt: null,
    };

    try {
      try {
        await claimPendingRole(authUser);
      } catch (claimError) {
        console.warn("Volunteer role claim failed:", claimError);
      }

      const stored = await getMyProfile();
      const merged = {
        ...fallback,
        ...stored,
        name: stored?.name || fallback.name,
        email: stored?.email || fallback.email,
        role: stored?.role || "Citizen",
      };
      setProfile(merged);
      setProfileError("");
      return merged;
    } catch (error) {
      console.error("Unable to load user profile:", error);
      setProfileError(error?.message || "Your profile could not be loaded.");
      setProfile(fallback);
      return fallback;
    }
  }, []);

  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};

    unsubscribe = onAuthStateChanged(auth, (authUser) => {
      if (!active) return;

      setUser(authUser);

      if (!authUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      loadProfile(authUser).finally(() => {
        if (active) setLoading(false);
      });
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [loadProfile]);

  const refreshProfile = useCallback(async () => {
    if (!auth.currentUser) return null;
    return loadProfile(auth.currentUser);
  }, [loadProfile]);

  const value = useMemo(
    () => ({
      user,
      profile,
      role: profile?.role || "Citizen",
      loading,
      profileError,
      refreshProfile,
    }),
    [user, profile, loading, profileError, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthProvider };
