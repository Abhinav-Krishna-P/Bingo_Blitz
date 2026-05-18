import { onAuthStateChanged, type User } from "firebase/auth";
import { createContext, useEffect, useRef, useState, type ReactNode } from "react";
import toast from "react-hot-toast";
import { logOut, signInWithGoogle, upsertUserProfile } from "@/firebase/auth";
import { isFirebaseConfigured, auth } from "@/firebase/config";
import { markOffline, registerPresence, subscribeToSession, updatePresence } from "@/firebase/presence";
import type { SessionPresence } from "@/types/game";

interface AuthContextValue {
  user: User | null;
  session: SessionPresence | null;
  loading: boolean;
  firebaseReady: boolean;
  signIn: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<SessionPresence | null>(null);
  const [loading, setLoading] = useState(true);
  const pingRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return undefined;
    }

    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      setLoading(false);

      if (!nextUser) {
        setSession(null);
        if (pingRef.current) {
          window.clearInterval(pingRef.current);
          pingRef.current = null;
        }
        return;
      }

      try {
        await upsertUserProfile(nextUser);
        const nextSession = await registerPresence(nextUser);
        setSession(nextSession);

        if (pingRef.current) {
          window.clearInterval(pingRef.current);
        }

        pingRef.current = window.setInterval(() => {
          void updatePresence(nextUser.uid, { online: true });
        }, 30_000);
      } catch (error) {
        console.error(error);
        toast.error("Failed to initialize session presence.");
      }
    });

    const handleUnload = () => {
      if (auth.currentUser) {
        void markOffline(auth.currentUser.uid);
      }
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => {
      unsubscribe();
      window.removeEventListener("beforeunload", handleUnload);
      if (pingRef.current) {
        window.clearInterval(pingRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!user || !isFirebaseConfigured) {
      return undefined;
    }

    return subscribeToSession(user.uid, (nextSession) => {
      setSession(nextSession);
    });
  }, [user]);

  async function handleSignIn() {
    if (!isFirebaseConfigured) {
      toast.error("Firebase config is missing. Add the env values first.");
      return;
    }

    try {
      await signInWithGoogle();
    } catch (error) {
      console.error(error);
      toast.error("Google sign-in failed.");
    }
  }

  async function handleSignOut() {
    if (!user) return;
    try {
      await markOffline(user.uid);
    } catch (error) {
      console.error(error);
    }
    await logOut();
    setSession(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        firebaseReady: isFirebaseConfigured,
        signIn: handleSignIn,
        signOutUser: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
