import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Terminal } from "lucide-react";

const TERMINAL_LOGS = [
  "Establishing MS2 Connection...",
  "Hydrating 143 Nodes...",
  "Encryption Ready.",
  "System Initialization Complete.",
];

export function Preloader({ onComplete }: { onComplete: () => void }) {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    let currentLog = 0;
    const interval = setInterval(() => {
      if (currentLog < TERMINAL_LOGS.length) {
        setLogs((prev) => [...prev, TERMINAL_LOGS[currentLog]]);
        currentLog++;
      } else {
        clearInterval(interval);
        setTimeout(onComplete, 800);
      }
    }, 400);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-zinc-950 font-sans"
    >
      <div className="relative flex flex-col items-center gap-12">
        {/* PESCE Nexus Logo Animation */}
        <div className="relative h-32 w-32">
          <svg viewBox="0 0 100 100" className="h-full w-full">
            <motion.path
              d="M30 20 H70 C85 20 85 45 70 45 H30 V80"
              fill="transparent"
              stroke="#6366f1"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
            <motion.circle
              cx="30"
              cy="45"
              r="4"
              fill="#6366f1"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1 }}
            />
          </svg>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full"
          />
        </div>

        {/* Terminal Text */}
        <div className="min-h-[140px] w-full max-w-[280px] flex flex-col gap-2 px-6 py-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-2">
            <Terminal className="h-3 w-3 text-indigo-400" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400/80">Nexus.OS Booting</span>
          </div>
          {logs.map((log, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-[10px] font-medium text-zinc-300 font-mono flex items-center gap-2"
            >
              <span className="text-zinc-600">»</span> {log}
            </motion.div>
          ))}
          <motion.div
            animate={{ opacity: [0, 1] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="h-3 w-1.5 bg-indigo-500 ml-5 mt-1"
          />
        </div>
      </div>

      <div className="absolute bottom-12 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700 animate-pulse">
        Establishing Secure Uplink
      </div>
    </motion.div>
  );
}
