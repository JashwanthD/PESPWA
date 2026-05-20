import { createFileRoute, Link } from "@tanstack/react-router";
import { useCompanyIntelligence } from "@/hooks/useCompanyIntelligence";
import { motion } from "framer-motion";
import { Network, Search, Zap, Shield, ChevronRight } from "lucide-react";
import { SKILL_LABELS } from "@/types/intelligence";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/_dashboard/skills")({
  component: GlobalSkillMatrix,
});

function GlobalSkillMatrix() {
  const { data, loading } = useCompanyIntelligence();
  const [query, setQuery] = useState("");
  const companies = data ?? [];

  const skillAxioms = Object.keys(SKILL_LABELS) as (keyof typeof SKILL_LABELS)[];

  const aggregatedSkills = useMemo(() => {
    return skillAxioms.map(axiom => {
      const activeCompanies = companies
        .filter(c => (c as any).skill_levels?.[axiom] > 0)
        .sort((a, b) => ((b as any).skill_levels?.[axiom] || 0) - ((a as any).skill_levels?.[axiom] || 0))
        .slice(0, 5);
      
      const avgRating = activeCompanies.length > 0 
        ? Math.round(activeCompanies.reduce((acc, c) => acc + ((c as any).skill_levels?.[axiom] || 0), 0) / activeCompanies.length)
        : 0;

      return {
        key: axiom,
        label: SKILL_LABELS[axiom],
        avgRating,
        topNodes: activeCompanies
      };
    });
  }, [companies]);

  return (
    <div className="max-w-7xl mx-auto py-6 space-y-12 pb-24">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-[var(--foreground)] uppercase tracking-tight">Global Skill Matrix</h1>
        <p className="text-[10px] text-[var(--muted)] uppercase tracking-[0.4em] font-black">Cross-Node Intelligence Aggregator</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {aggregatedSkills.map((skill, idx) => (
          <motion.div 
            key={skill.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-[var(--surface)] border border-[var(--border)] p-8 rounded-3xl hover:border-indigo-500/30 transition-all group"
          >
            <div className="flex justify-between items-start mb-8">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-[var(--foreground)] uppercase tracking-tight group-hover:text-indigo-400 transition-colors">
                  {skill.label}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Industry Difficulty</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className={`h-1 w-3 rounded-full ${i < skill.avgRating / 2 ? "bg-indigo-500" : "bg-zinc-800"}`} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-[var(--background)] border border-[var(--border)] flex flex-col items-center justify-center">
                <span className="text-lg font-black text-[var(--foreground)]">{skill.avgRating}</span>
                <span className="text-[7px] font-black text-[var(--muted)] uppercase">AVG</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">High-Intensity Hiring Nodes</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {skill.topNodes.map(node => (
                  <Link 
                    key={node.company_id}
                    to="/companies/$id"
                    params={{ id: node.company_id.toString() }}
                    className="flex items-center gap-3 p-3 bg-[var(--background)] border border-[var(--border)] rounded-xl hover:border-indigo-500/50 transition-all group/node"
                  >
                    <div className="h-8 w-8 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center overflow-hidden">
                      {node.logo_url ? <img src={node.logo_url} className="h-full w-full object-cover" /> : <Shield className="h-4 w-4 text-[var(--muted)]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-bold text-[var(--foreground)] uppercase truncate">{node.name}</div>
                      <div className="text-[8px] font-black text-indigo-500 uppercase tracking-widest">Lvl {(node as any).skill_levels?.[skill.key]} Requirement</div>
                    </div>
                    <ChevronRight className="h-3 w-3 text-[var(--border)] group-hover/node:text-indigo-400 transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
