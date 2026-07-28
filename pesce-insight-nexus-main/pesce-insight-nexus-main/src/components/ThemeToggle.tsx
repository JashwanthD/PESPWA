import { useTheme } from "./ThemeProvider";
import { Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="relative flex items-center justify-between w-full p-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl hover:border-[var(--primary)]/50 transition-all group overflow-hidden"
      aria-label="Toggle Theme"
    >
      <div className="flex items-center gap-2 px-2 z-10">
        <div className={`h-6 w-6 rounded-lg flex items-center justify-center transition-colors ${theme === 'dark' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}`}>
           <Moon className="w-3.5 h-3.5" />
        </div>
        <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${theme === 'dark' ? 'text-[var(--foreground)]' : 'text-[var(--muted)]'}`}>Carbon</span>
      </div>

      <div className="flex items-center gap-2 px-2 z-10">
        <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${theme === 'light' ? 'text-[var(--primary)]' : 'text-[var(--muted)]'}`}>Dossier</span>
        <div className={`h-6 w-6 rounded-lg flex items-center justify-center transition-colors ${theme === 'light' ? 'bg-indigo-500/10 text-[var(--primary)]' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}`}>
           <Sun className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Sliding Highlight */}
      <motion.div 
        layoutId="theme-slider"
        initial={false}
        animate={{ 
          x: theme === 'dark' ? '0%' : '100%'
        }}
        style={{ left: 0 }}
        className="absolute top-0 bottom-0 w-1/2 bg-indigo-500/5 border border-indigo-500/20 rounded-xl z-0"
      />
    </button>
  );
}
