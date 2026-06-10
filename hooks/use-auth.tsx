"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import type { User } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";

type AuthContextValue = {
  error: string | null;
  isConfigured: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<{ requiresEmailConfirmation: boolean }>;
  user: User | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function getEmailRedirectTo() {
  if (typeof window === "undefined") {
    return undefined;
  }

  return `${window.location.origin}/login?verified=1`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setIsLoading(false);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      error,
      isConfigured: isSupabaseConfigured,
      isLoading,
      user,
      async login(email, password) {
        if (!supabase) {
          setError("Supabase is not configured.");
          return;
        }

        setError(null);
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (loginError) {
          setError(loginError.message);
          throw loginError;
        }
      },
      async logout() {
        if (!supabase) {
          return;
        }

        await supabase.auth.signOut();
      },
      async resendVerification(email) {
        if (!supabase) {
          setError("Supabase is not configured.");
          return;
        }

        setError(null);
        const { error: resendError } = await supabase.auth.resend({
          type: "signup",
          email,
          options: {
            emailRedirectTo: getEmailRedirectTo()
          }
        });

        if (resendError) {
          setError(resendError.message);
          throw resendError;
        }
      },
      async signup(email, password) {
        if (!supabase) {
          setError("Supabase is not configured.");
          return { requiresEmailConfirmation: false };
        }

        setError(null);
        const { data, error: signupError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: getEmailRedirectTo()
          }
        });

        if (signupError) {
          setError(signupError.message);
          throw signupError;
        }

        return { requiresEmailConfirmation: !data.session };
      }
    }),
    [error, isLoading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return value;
}
