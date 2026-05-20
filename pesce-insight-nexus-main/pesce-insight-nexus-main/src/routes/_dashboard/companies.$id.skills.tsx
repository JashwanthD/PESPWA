import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useCompanyById } from "@/hooks/useCompanyIntelligence";
import { ArrowLeft, BrainCircuit, Info } from "lucide-react";
import { motion } from "framer-motion";
import { SKILL_LABELS } from "@/types/intelligence";

export const Route = createFileRoute("/_dashboard/companies/$id/skills")({
  component: CompanySkillsMatrix,
});

function CompanySkillsMatrix() {
  const { id } = useParams({ from: "/_dashboard/companies/$id/skills" });
  const { data: company, loading } = useCompanyById(Number(id));

  const levels = Array.from({ length: 10 }, (_, i) => i + 1);
  const skillKeys = Object.keys(SKILL_LABELS) as (keyof typeof SKILL_LABELS)[];

  if (loading) return <div className="p-20 text-center animate-pulse text-zinc-500 uppercase tracking-widest font-black">Syncing Skill Matrix...</div>;
  if (!company) return <div>Node Null.</div>;

  return (
    <div className="max-w-7xl mx-auto py-6 space-y-8">
      <nav>
        <Link to="/companies/$id" params={{ id }} className="text-zinc-500 hover:text-white transition-colors flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to {company.short_name || company.name}
        </Link>
      </nav>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-white uppercase tracking-tight">Hiring Skill Matrix</h1>
        <p className="text-[10px] text-zinc-500 uppercase tracking-[0.4em] font-black">Intelligence Rubric / 12 Standard Axioms</p>
      </div>

      <div className="intel-card overflow-hidden bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/50">
                <th className="p-6 text-left border-r border-zinc-800 min-w-[200px] sticky left-0 z-20 bg-zinc-900/50">
                  <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Skill Axiom</div>
                </th>
                {levels.map(l => (
                  <th key={l} className="p-4 text-center border-r border-zinc-800 min-w-[120px]">
                    <div className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1">Level</div>
                    <div className="text-lg font-black text-white">{l}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {skillKeys.map((key) => (
                <tr key={key} className="border-b border-zinc-800 hover:bg-white/[0.02] transition-colors group">
                  <td className="p-6 border-r border-zinc-800 sticky left-0 z-20 bg-zinc-950 group-hover:bg-zinc-900/80 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                      <div className="text-xs font-black text-white uppercase tracking-tight">{SKILL_LABELS[key]}</div>
                    </div>
                  </td>
                  {levels.map(level => {
                    const rating = (company as any).skill_levels?.[key] || 0;
                    const isActive = level <= rating;
                    
                    return (
                      <td key={level} className={`p-4 border-r border-zinc-800 text-center transition-all ${isActive ? "bg-indigo-500/[0.03]" : ""}`}>
                        {isActive ? (
                          <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="inline-flex flex-col items-center gap-1"
                          >
                            <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 mb-2" />
                            <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter max-w-[80px] leading-tight">
                              {/* In a real app, this would be fetched from skill_set_topics */}
                              {getMockTopic(key, level)}
                            </div>
                          </motion.div>
                        ) : (
                          <div className="text-[8px] font-black text-zinc-800 uppercase tracking-widest opacity-20">—</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center gap-3 p-4 bg-zinc-900/40 border border-zinc-800 rounded-xl">
        <Info className="h-4 w-4 text-indigo-400" />
        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
          The matrix maps 12 standard skills across 10 levels of proficiency. Highlighted nodes indicate {company.short_name} hiring expectations.
        </p>
      </div>
    </div>
  );
}

function getMockTopic(skill: string, level: number): string {
  const topics: Record<string, string[]> = {
    coding: ["Syntax", "Loops", "Recursion", "Complexity", "Optimization", "Patterns", "Concurrency", "Security", "Scale", "Architecture"],
    data_structures_and_algorithms: ["Arrays", "Linked Lists", "Stacks/Queues", "Trees", "Heaps", "Graphs", "DP", "Advanced Graphs", "Distributed ALGO", "Quant"],
    system_design_and_architecture: ["Basics", "Scalability", "Caching", "Load Balancing", "Sharding", "CAP Theorem", "Eventual Consistency", "Microservices", "CQRS", "Global Scale"],
    // Fallback
    default: ["Foundational", "Standard", "Advanced", "Professional", "Expert", "Lead", "Architect", "Principal", "Fellow", "Legacy"]
  };
  return topics[skill]?.[level - 1] || topics.default[level - 1];
}
