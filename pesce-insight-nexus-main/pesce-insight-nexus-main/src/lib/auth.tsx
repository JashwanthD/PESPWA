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
  updateProfile: (profile: any) => void;
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
        const localMockStr = localStorage.getItem("nexus_mock_profile");
        let localMock: any = {};
        if (localMockStr) {
          try {
            localMock = JSON.parse(localMockStr);
          } catch {}
        }
        
        const mergedProfile = {
          ...localMock,
          ...userProfile,
          skills: (userProfile.skills && Object.keys(userProfile.skills).length > 0)
            ? userProfile.skills
            : (localMock.skills || {}),
          interests: (userProfile.interests && userProfile.interests.length > 0)
            ? userProfile.interests
            : (localMock.interests || [])
        };

        setProfile(mergedProfile);
        setRole(userProfile.role as UserRole);
        localStorage.setItem("nexus_mock_profile", JSON.stringify(mergedProfile));
      } else {
        setRole((newSession.user.user_metadata.role as UserRole) || "student");
      }
    } else {
      setSession(null);
      const mockProfileStr = localStorage.getItem("nexus_mock_profile");
      if (mockProfileStr) {
        try {
          setProfile(JSON.parse(mockProfileStr));
        } catch {
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
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
    localStorage.removeItem("nexus_mock_profile");
    setSession(null);
    setRole(null);
    setProfile(null);
  };

  const login = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole) {
      localStorage.setItem("nexus_mock_role", newRole);
      
      // Seed a robust default profile for the chosen mock role
      const defaultProfile = {
        full_name: newRole === "admin" ? "Architect Prime" : "Jashwanth D",
        nexus_id: newRole === "admin" ? "PES-ADMIN-001" : "PES2024-NEXUS",
        email: newRole === "admin" ? "architect@pes.edu" : "jashwanth.d@pes.edu",
        major: newRole === "admin" ? "Principal System Architect" : "Computer Science & Engineering",
        gpa: "8.85",
        graduation_year: 2024,
        location: "Bengaluru, India",
        bio: newRole === "admin" ? "Root node administrator" : "Aspiring Full-Stack Architect...",
        skills: {
          coding: 8,
          data_structures_and_algorithms: 8,
          object_oriented_programming_and_design: 7,
          aptitude_and_problem_solving: 8,
          communication_skills: 9,
          ai_native_engineering: 6,
          devops_and_cloud: 5,
          sql_and_design: 7,
          software_engineering: 8,
          system_design_and_architecture: 6,
          computer_networking: 5,
          operating_system: 6,
        },
        interests: ["Fintech", "SaaS", "AI Orchestration"]
      };
      
      localStorage.setItem("nexus_mock_profile", JSON.stringify(defaultProfile));
      setProfile(defaultProfile);
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

  const updateProfile = (newProfile: any) => {
    setProfile(newProfile);
    localStorage.setItem("nexus_mock_profile", JSON.stringify(newProfile));
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
      logout,
      updateProfile
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
