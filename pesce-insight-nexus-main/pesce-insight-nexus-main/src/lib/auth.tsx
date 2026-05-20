import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { supabaseMS1, type UserRole } from "./supabase";
import type { Session } from "@supabase/supabase-js";

type AuthContextType = {
  role: UserRole;
  session: Session | null;
  profile: any | null;
  loading: boolean;
  login: (role: UserRole) => void;
  signInWithPassword: (email: string, pass: string) => Promise<{ error: any }>;
  signUpWithPassword: (email: string, pass: string) => Promise<{ error: any }>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabaseMS1
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (error) return null;
    return data;
  };

  const syncAuthState = async (newSession: Session | null) => {
    if (newSession) {
      setSession(newSession);
      const userProfile = await fetchProfile(newSession.user.id);
      if (userProfile) {
        setProfile(userProfile);
        setRole(userProfile.role as UserRole);
      } else {
        setRole((newSession.user.user_metadata.role as UserRole) || "student");
      }
    } else {
      setSession(null);
      setProfile(null);
      const mockRole = localStorage.getItem("nexus_mock_role") as UserRole;
      setRole(mockRole || null);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) setLoading(false);
    }, 3000);

    supabaseMS1.auth.getSession().then(({ data: { session: s } }: any) => {
      syncAuthState(s).finally(() => {
        setLoading(false);
        clearTimeout(timer);
      });
    });

    const { data: { subscription } } = supabaseMS1.auth.onAuthStateChange((_event: string, s: Session | null) => {
      syncAuthState(s).finally(() => setLoading(false));
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const logout = async () => {
    await supabaseMS1.auth.signOut();
    localStorage.removeItem("nexus_mock_role");
    setSession(null);
    setRole(null);
  };

  const login = (newRole: UserRole) => {
    // Legacy support for memory-based login (used by Bypass)
    setRole(newRole);
    if (newRole) {
      localStorage.setItem("nexus_mock_role", newRole);
    }
  };

  const signInWithPassword = async (email: string, pass: string) => {
    const { data, error } = await supabaseMS1.auth.signInWithPassword({
      email,
      password: pass,
    });
    if (data.session) {
      setSession(data.session);
      setRole((data.session.user.user_metadata?.role as UserRole) || "student");
    }
    return { error };
  };

  const signUpWithPassword = async (email: string, pass: string) => {
    const { data, error } = await supabaseMS1.auth.signUp({
      email,
      password: pass,
      options: {
        data: { role: 'student' }
      }
    });
    if (data.session) {
      setSession(data.session);
      setRole("student");
    }
    return { error };
  };

  return (
    <AuthContext.Provider value={{ 
      role, 
      session, 
      profile,
      loading, 
      login, 
      signInWithPassword,
      signUpWithPassword,
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
