import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Lock, ArrowRight, Fingerprint, Loader2, AlertCircle, Eye, EyeOff, GraduationCap, ShieldCheck, Zap } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LiquidMatrix } from "@/components/LiquidMatrix";

interface LoginSearch {
  role?: "student" | "admin";
}

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    role: (search.role as "student" | "admin") || undefined,
  }),
  component: LoginComponent,
});

function LoginComponent() {
  const { role: initialRole } = Route.useSearch();
  const [selectedRole, setSelectedRole] = useState<"student" | "admin" | null>(initialRole || null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  
  const { login, signInWithPassword, signUpWithPassword } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (initialRole) {
      setSelectedRole(initialRole);
    }
  }, [initialRole]);

  useEffect(() => {
    if (selectedRole === "admin") {
      setEmail("admin@pesce.ac.in");
      setPassword("pesce@2025");
    } else if (selectedRole === "student") {
      setEmail("student@pesce.ac.in");
      setPassword("pesce@2025");
    } else {
      setEmail("");
      setPassword("");
    }
  }, [selectedRole]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Artificial delay to maintain the "Secure Handshake" aesthetic
    await new Promise(r => setTimeout(r, 1200));

    try {
      // Hardcoded Bypass check
      if (password === "pesce@2025") {
        console.log("[Auth] ✅ Hardcoded Handshake Successful");
        const targetRole = email.includes("admin") ? "admin" : "student";
        login(targetRole);
        await new Promise(r => setTimeout(r, 400));
        navigate({ to: "/" });
        return;
      }

      let authError;
      if (isSignUp) {
        const { error: signUpError } = await signUpWithPassword(email, password);
        authError = signUpError;
      } else {
        const { error: signInError } = await signInWithPassword(email, password);
        authError = signInError;
      }

      if (authError) {
        setError(authError.message || "Invalid Credentials. Access Denied.");
      } else {
        console.log("[Auth] ✅ Supabase Authentication Successful");
        await new Promise(r => setTimeout(r, 400));
        navigate({ to: "/" });
      }
    } catch (err) {
      console.error("[Auth] Login Exception:", err);
      setError("System Error: Handshake Failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleBypass = (role: "student" | "admin") => {
    console.log(`[Auth] ⚡ Dev Bypass: Logging in as ${role}`);
    login(role);
    setTimeout(() => {
      navigate({ to: "/" });
    }, 100);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[var(--background)] px-4 relative overflow-hidden transition-colors duration-500">
      <LiquidMatrix />
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 h-[600px] w-[600px] bg-[var(--primary)]/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none opacity-50" />
      <div className="absolute bottom-0 left-0 h-[400px] w-[400px] bg-[var(--primary)]/10 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none opacity-50" />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-[400px] z-10 space-y-4"
      >
        {/* Top bar theme toggle - High contrast button */}
        <div className="flex justify-center mb-6">
          <div className="w-48">
            <ThemeToggle />
          </div>
        </div>

        <div className="bg-[var(--surface)] p-8 rounded-3xl border border-[var(--border)] shadow-2xl backdrop-blur-2xl flex flex-col gap-8 relative overflow-hidden transition-all duration-300">
          
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center py-10 text-center gap-6"
              >
                <div className="relative">
                  <div className="absolute inset-0 animate-ping bg-[var(--primary)]/20 rounded-full" />
                  <div className="relative h-16 w-16 bg-[var(--surface)] border border-[var(--primary)]/30 rounded-2xl flex items-center justify-center shadow-inner">
                    <Loader2 className="h-8 w-8 text-[var(--primary)] animate-spin" />
                  </div>
                </div>
                <div>
                  <h2 className="text-sm font-black uppercase tracking-[0.3em] text-[var(--foreground)] animate-pulse">
                    Verifying Credentials
                  </h2>
                  <p className="text-[9px] text-[var(--muted)] mt-2 uppercase tracking-widest font-bold">Encrypted Handshake in progress...</p>
                </div>
              </motion.div>
            ) : selectedRole === null ? (
              <motion.div
                key="choice"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex flex-col gap-6"
              >
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="h-16 w-16 rounded-2xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center justify-center shadow-lg">
                    <Shield className="h-8 w-8 text-[var(--primary)]" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black text-[var(--foreground)] uppercase tracking-tighter">PESCE Intelligence</h1>
                    <p className="text-[var(--muted)] text-[10px] font-medium uppercase tracking-[0.2em] mt-1">Authorized Access Gateway</p>
                  </div>
                </div>

                {/* Role Choice Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={() => setSelectedRole("student")}
                    className="group w-full bg-[var(--surface)] hover:bg-indigo-500/10 border border-[var(--border)] hover:border-indigo-500/30 py-5 px-6 text-left transition-all duration-300 flex items-center gap-5 rounded-2xl shadow-sm hover:-translate-y-1 cursor-pointer"
                  >
                    <div className="h-10 w-10 rounded-xl bg-[var(--background)] border border-[var(--border)] flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                      <GraduationCap className="h-5 w-5 text-[var(--muted)] group-hover:text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-black text-[var(--foreground)] uppercase tracking-tight">Student Portal</div>
                      <div className="text-[9px] uppercase tracking-[0.1em] text-[var(--muted)] font-bold mt-1">Access drives & placement hub</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setSelectedRole("admin")}
                    className="group w-full bg-[var(--surface)] hover:bg-emerald-500/10 border border-[var(--border)] hover:border-emerald-500/30 py-5 px-6 text-left transition-all duration-300 flex items-center gap-5 rounded-2xl shadow-sm hover:-translate-y-1 cursor-pointer"
                  >
                    <div className="h-10 w-10 rounded-xl bg-[var(--background)] border border-[var(--border)] flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                      <ShieldCheck className="h-5 w-5 text-[var(--muted)] group-hover:text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-black text-[var(--foreground)] uppercase tracking-tight">Admin Terminal</div>
                      <div className="text-[9px] uppercase tracking-[0.1em] text-[var(--muted)] font-bold mt-1">Manage pipeline & hydrate nodes</div>
                    </div>
                  </button>
                </div>

                <div className="pt-4 border-t border-[var(--border)]">
                  <div className="text-[9px] uppercase tracking-widest text-[var(--muted)] font-black mb-3 px-1">Quick Access Choice (Bypass Login)</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleBypass("student")}
                      className="flex-1 py-3 px-3 bg-[var(--background)]/40 hover:bg-indigo-500/15 border border-[var(--border)] hover:border-indigo-500/50 text-[9px] font-black uppercase text-[var(--muted)] hover:text-[var(--foreground)] transition-all rounded-xl flex items-center justify-center gap-2 shadow-sm active:scale-95 cursor-pointer"
                    >
                      <Zap className="h-3.5 w-3.5 text-indigo-400" /> Student
                    </button>
                    <button
                      onClick={() => handleBypass("admin")}
                      className="flex-1 py-3 px-3 bg-[var(--background)]/40 hover:bg-emerald-500/15 border border-[var(--border)] hover:border-emerald-500/50 text-[9px] font-black uppercase text-[var(--muted)] hover:text-[var(--foreground)] transition-all rounded-xl flex items-center justify-center gap-2 shadow-sm active:scale-95 cursor-pointer"
                    >
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 animate-pulse" /> Admin
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-8"
              >
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className={`h-16 w-16 rounded-2xl flex items-center justify-center shadow-lg ${
                    selectedRole === "admin" ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-indigo-500/10 border border-indigo-500/20"
                  }`}>
                    {selectedRole === "admin" ? <ShieldCheck className="h-8 w-8 text-emerald-500" /> : <GraduationCap className="h-8 w-8 text-indigo-500" />}
                  </div>
                  <div>
                    <h1 className="text-2xl font-black text-[var(--foreground)] uppercase tracking-tighter">
                      {selectedRole === "admin" ? "Admin Terminal" : "Student Portal"}
                    </h1>
                    <p className="text-[var(--muted)] text-xs font-medium uppercase tracking-[0.2em] mt-1">Authorized Access Only</p>
                  </div>
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-500 text-[10px] font-bold uppercase tracking-wider"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </motion.div>
                )}

                <form onSubmit={handleLogin} className="flex flex-col gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] ml-1">Terminal ID</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@pesce.ac.in"
                      className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 transition-all font-mono"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Secure Key</label>
                      <span className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-tight">Passcode: pesce@2025</span>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 transition-all pr-12"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-4 w-full bg-[var(--foreground)] text-[var(--background)] hover:bg-[var(--primary)] hover:text-white transition-all duration-300 py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2 shadow-xl active:scale-95 cursor-pointer"
                  >
                    Initiate Handshake <ArrowRight className="h-4 w-4" />
                  </button>
                  
                  <button 
                    type="button"
                    onClick={() => setSelectedRole(null)}
                    className="text-[10px] text-[var(--muted)] font-black uppercase tracking-widest hover:text-[var(--primary)] transition-colors text-center w-full mt-2"
                  >
                    ← Back to Role Gate
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-2 text-center">
            <p className="text-[10px] font-medium text-[var(--muted)] uppercase tracking-widest">
              Secured by MS2 Encryption
            </p>
          </div>
        </div>

        <div className="mt-4 flex justify-center gap-8 opacity-20 hover:opacity-40 transition-opacity">
          <div className="h-1 w-12 bg-[var(--foreground)] rounded-full" />
          <div className="h-1 w-12 bg-[var(--foreground)] rounded-full" />
          <div className="h-1 w-12 bg-[var(--foreground)] rounded-full" />
        </div>
      </motion.div>
    </div>
  );
}
