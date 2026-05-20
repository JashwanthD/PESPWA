import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Lock, ArrowRight, Fingerprint, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  
  const { login, signInWithPassword, signUpWithPassword } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (initialRole === "admin") {
      setEmail("admin@pesce.ac.in");
    } else if (initialRole === "student") {
      setEmail("student@pesce.ac.in");
    }
  }, [initialRole]);

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
            ) : (
              <motion.div 
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-8"
              >
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="h-16 w-16 rounded-2xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center justify-center shadow-lg">
                    <Shield className="h-8 w-8 text-[var(--primary)]" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black text-[var(--foreground)] uppercase tracking-tighter">PESCE Intelligence</h1>
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
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] ml-1">Secure Key</label>
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
                    className="mt-4 w-full bg-[var(--foreground)] text-[var(--background)] hover:bg-[var(--primary)] hover:text-white transition-all duration-300 py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2 shadow-xl active:scale-95"
                  >
                    {isSignUp ? "Register Node" : "Initiate Handshake"} <ArrowRight className="h-4 w-4" />
                  </button>
                  
                  <button 
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-[10px] text-[var(--muted)] font-black uppercase tracking-widest hover:text-[var(--primary)] transition-colors text-center w-full"
                  >
                    {isSignUp ? "Existing Node? Authenticate" : "New Node? Register"}
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
