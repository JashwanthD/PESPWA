import { useAuth } from "@/lib/auth";
import { ShieldCheck, GraduationCap, Zap, RotateCcw } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LiquidMatrix } from "./LiquidMatrix";

export function LinearAuthScreen() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleBypass = (role: "student" | "admin") => {
    console.log(`[Auth] ⚡ Dev Bypass: Redirecting to Dashboard as ${role}`);
    login(role);
    // Force a stable navigation
    setTimeout(() => {
      window.location.href = "/";
    }, 100);
  };

  const handleSignIn = (role: "student" | "admin") => {
    console.log(`[Auth] 🔑 Redirecting to Login for ${role}`);
    navigate({ to: "/login", search: { role } });
  };

  const clearSession = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4 overflow-hidden relative transition-colors duration-500">
      <LiquidMatrix />
      <div className="absolute inset-0 dot-grid-bg opacity-20 pointer-events-none" />
      
      <div className="w-full max-w-sm relative z-10 space-y-6">
        {/* Top bar theme toggle for Gate */}
        <div className="flex justify-center mb-4">
          <div className="w-48">
            <ThemeToggle />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key="auth-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10"
          >
            {/* Logo Mark */}
            <div className="flex flex-col items-center text-center">
              <div className="h-14 w-14 bg-[var(--foreground)] text-[var(--background)] flex items-center justify-center font-black text-2xl mb-6 rounded-2xl shadow-2xl">
                P
              </div>
              <h1 className="text-3xl font-black tracking-tighter text-[var(--foreground)] uppercase leading-none">
                PESCE<br /><span className="text-[var(--primary)]">Nexus</span>
              </h1>
              <p className="text-[10px] text-[var(--muted)] mt-4 uppercase tracking-[0.2em] font-black opacity-60">
                Intelligence Placement Network
              </p>
            </div>

            {/* Auth Cards */}
            <div className="space-y-3">
              <button
                onClick={() => handleSignIn("student")}
                className="group w-full bg-[var(--surface)] hover:bg-[var(--primary)] border border-[var(--border)] hover:border-[var(--primary)] py-5 px-6 text-left transition-all duration-300 flex items-center gap-5 rounded-2xl hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] hover:-translate-y-1"
              >
                <div className="h-10 w-10 rounded-xl bg-[var(--background)] border border-[var(--border)] flex items-center justify-center group-hover:bg-white/10 group-hover:text-white transition-colors">
                  <GraduationCap className="h-5 w-5 text-[var(--muted)] group-hover:text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-black text-[var(--foreground)] group-hover:text-white transition-colors uppercase tracking-tight">Student Node</div>
                  <div className="text-[9px] uppercase tracking-[0.1em] text-[var(--muted)] group-hover:text-white/70 transition-colors font-bold mt-1">Research & Career Pathways</div>
                </div>
              </button>

              <button
                onClick={() => handleSignIn("admin")}
                className="group w-full bg-[var(--primary)] hover:bg-[var(--primary)] border border-transparent py-5 px-6 text-left transition-all duration-300 flex items-center gap-5 rounded-2xl shadow-lg hover:shadow-[0_20px_50px_rgba(99,102,241,0.3)] hover:-translate-y-1"
              >
                <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-black text-white uppercase tracking-tight">Admin Terminal</div>
                  <div className="text-[9px] uppercase tracking-[0.1em] text-white/70 font-bold mt-1">System Oversight & Deployment</div>
                </div>
              </button>

              {import.meta.env.DEV && (
                <div className="pt-4 border-t border-[var(--border)] mt-6">
                  <div className="text-[9px] uppercase tracking-widest text-[var(--muted)] font-black mb-3 px-1">Dev Tools</div>
                  <div className="flex gap-2">
                      <button
                      onClick={() => handleBypass("student")}
                      className="flex-1 py-2 px-3 bg-[var(--surface)] border border-[var(--border)] text-[9px] font-black uppercase text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--primary)] transition-all rounded-lg flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Zap className="h-3 w-3 text-[var(--primary)]" /> Student Bypass
                    </button>
                    <button
                      onClick={() => handleBypass("admin")}
                      className="flex-1 py-2 px-3 bg-[var(--surface)] border border-[var(--border)] text-[9px] font-black uppercase text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--primary)] transition-all rounded-lg flex items-center justify-center gap-2 shadow-sm"
                    >
                      <ShieldCheck className="h-3 w-3 text-[var(--primary)]" /> Admin Bypass
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col items-center gap-4">
              <p className="text-[9px] text-[var(--muted)] uppercase tracking-[0.2em] font-black opacity-40">
                Decision-Grade Intelligence · 163 Nodes
              </p>
              
              <button 
                onClick={clearSession}
                className="flex items-center gap-2 text-[8px] uppercase tracking-widest font-black text-[var(--muted)] hover:text-red-500 transition-colors"
              >
                <RotateCcw className="h-3 w-3" /> Clear Local Session Cache
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
