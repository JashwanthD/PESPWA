import { createFileRoute, Link } from "@tanstack/react-router";
import { useCompanyIntelligence } from "@/hooks/useCompanyIntelligence";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { Rocket, TrendingUp, Zap, Star, Shield, ArrowUpRight, Cpu } from "lucide-react";

export const Route = createFileRoute("/_dashboard/innovx")({
  component: GlobalInnovX,
});

function GlobalInnovX() {
  const { data: companies, loading } = useCompanyIntelligence();

  const breakthroughProjects = useMemo(() => {
    return (companies ?? [])
      .map(c => ({
        company: c,
        name: "Project Nexus-" + (c.short_name || c.name || "X").charAt(0),
        tier: "Breakthrough",
        impact: "High"
      }))
      .slice(0, 6);
  }, [companies]);

  return (
    <div className="max-w-7xl mx-auto py-6 space-y-12 pb-24">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-[var(--foreground)] uppercase tracking-tight">Global INNOVX Labs</h1>
        <p className="text-[10px] text-[var(--muted)] uppercase tracking-[0.4em] font-black">Cross-Node R&D Intelligence</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-[var(--surface)] border border-[var(--border)] p-8 rounded-3xl space-y-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-indigo-500" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted)]">Emerging Paradigms</h3>
              </div>
              <div className="space-y-3">
                {["GenAI Orchestration", "Sovereign Cloud", "Neuro-Symbolic AI", "Real-time Fintech"].map(t => (
                  <div key={t} className="p-4 bg-[var(--background)] border border-[var(--border)] rounded-2xl flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--foreground)] uppercase tracking-tight">{t}</span>
                    <div className="h-1 w-1 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,1)]" />
                  </div>
                ))}
              </div>
           </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-indigo-500" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted)]">High-Impact breakthrough Projects</h3>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-40 bg-zinc-900/50 border border-zinc-800 rounded-3xl animate-pulse" />
              ))
            ) : (
              breakthroughProjects.map((p, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-[var(--surface)] border border-[var(--border)] p-6 rounded-3xl hover:border-indigo-500/50 transition-all group relative overflow-hidden"
                >
                  <div className="absolute -right-8 -top-8 h-24 w-24 bg-indigo-500/5 blur-2xl rounded-full" />
                  
                  <div className="flex justify-between items-start mb-4">
                    <div className="h-10 w-10 rounded-xl bg-[var(--background)] border border-[var(--border)] flex items-center justify-center">
                      <Cpu className="h-5 w-5 text-indigo-400" />
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                      {p.tier}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-tight truncate">{p.name}</h4>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded bg-[var(--border)] flex items-center justify-center overflow-hidden">
                         {p.company.logo_url ? <img src={p.company.logo_url} className="h-full w-full object-cover" /> : <Shield className="h-2 w-2 text-[var(--muted)]" />}
                      </div>
                      <span className="text-[9px] font-black text-[var(--muted)] uppercase tracking-widest">{p.company.short_name || p.company.name}</span>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                     <Link to="/companies/$id/innovx" params={{ id: p.company.company_id.toString() }} className="p-2 bg-[var(--background)] border border-[var(--border)] rounded-lg hover:border-indigo-500/50 transition-colors">
                        <ArrowUpRight className="h-3.5 w-3.5 text-[var(--muted)] group-hover:text-indigo-400" />
                     </Link>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
