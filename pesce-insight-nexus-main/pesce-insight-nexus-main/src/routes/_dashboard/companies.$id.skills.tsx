import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useCompanyById } from "@/hooks/useCompanyIntelligence";
import { ArrowLeft, BrainCircuit, Info, CheckCircle, AlertTriangle, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import { SKILL_LABELS } from "@/types/intelligence";
import { getScoreValue } from "@/utils/normalizers";
import { useProfileSync } from "@/hooks/useProfileSync";

export const Route = createFileRoute("/_dashboard/companies/$id/skills")({
  component: CompanySkillsMatrix,
});

function CompanySkillsMatrix() {
  const { id } = useParams({ from: "/_dashboard/companies/$id/skills" });
  const { data: company, loading } = useCompanyById(Number(id));
  const { student } = useProfileSync();

  const levels = Array.from({ length: 10 }, (_, i) => i + 1);
  const skillKeys = Object.keys(SKILL_LABELS) as (keyof typeof SKILL_LABELS)[];

  if (loading) return <div className="p-20 text-center animate-pulse text-[var(--muted)] uppercase tracking-widest font-black">Syncing Skill Matrix...</div>;
  if (!company) return <div>Node Null.</div>;

  return (
    <div className="max-w-7xl mx-auto py-6 space-y-8">
      <nav>
        <Link to="/companies/$id" params={{ id }} className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to {company.short_name || company.name}
        </Link>
      </nav>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-[var(--foreground)] uppercase tracking-tight">Hiring Skill Matrix</h1>
        <p className="text-[10px] text-[var(--muted)] uppercase tracking-[0.4em] font-black">Intelligence Rubric / 12 Standard Axioms</p>
      </div>

      <div className="intel-card overflow-hidden bg-[var(--surface)] border border-[var(--border)] rounded-3xl shadow-2xl">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--background)]/50">
                <th className="p-6 text-left border-r border-[var(--border)] min-w-[200px] sticky left-0 z-20 bg-[var(--surface)]">
                  <div className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Skill Axiom</div>
                </th>
                {levels.map(l => (
                  <th key={l} className="p-4 text-center border-r border-[var(--border)] min-w-[120px]">
                    <div className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)] mb-1">Level</div>
                    <div className="text-lg font-black text-[var(--foreground)]">{l}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {skillKeys.map((key) => {
                const studentRating = student.skills?.[key] || 0;
                
                return (
                  <tr key={key} className="border-b border-[var(--border)] hover:bg-[var(--border)]/10 transition-colors group">
                    <td className="p-6 border-r border-[var(--border)] sticky left-0 z-20 bg-[var(--surface)] group-hover:bg-[var(--background)] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                        <div className="text-xs font-black text-[var(--foreground)] uppercase tracking-tight">{SKILL_LABELS[key]}</div>
                      </div>
                    </td>
                    {levels.map(level => {
                      const rawRating = (company as any).skill_levels?.[key];
                      const rating = getScoreValue(rawRating);
                      const isActive = level <= rating;
                      const isMet = level <= studentRating;
                      
                      if (isActive) {
                        if (isMet) {
                          // Requirement Met (Green/Emerald highlight)
                          return (
                            <td key={level} className="p-4 border-r border-[var(--border)] text-center transition-all bg-emerald-500/[0.04]">
                              <motion.div 
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="inline-flex flex-col items-center gap-1"
                              >
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] mb-2" />
                                <div className="text-[9px] font-bold text-emerald-400/90 uppercase tracking-tighter max-w-[80px] leading-tight">
                                  {getMockTopic(key, level)}
                                </div>
                              </motion.div>
                            </td>
                          );
                        } else {
                          // Requirement Gap (Rose/Red highlight)
                          return (
                            <td key={level} className="p-4 border-r border-[var(--border)] text-center transition-all bg-rose-500/[0.04]">
                              <motion.div 
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="inline-flex flex-col items-center gap-1"
                              >
                                <div className="h-1.5 w-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)] mb-2" />
                                <div className="text-[9px] font-bold text-rose-400/90 uppercase tracking-tighter max-w-[80px] leading-tight">
                                  {getMockTopic(key, level)}
                                </div>
                              </motion.div>
                            </td>
                          );
                        }
                      } else {
                        if (isMet) {
                          // Exceeds Company Requirement (Muted Zinc highlight)
                          return (
                            <td key={level} className="p-4 border-r border-[var(--border)] text-center transition-all bg-zinc-500/[0.01]">
                              <motion.div 
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="inline-flex flex-col items-center gap-1 opacity-60"
                              >
                                <div className="h-1 w-1 rounded-full bg-zinc-500 mb-2" />
                                <div className="text-[8px] font-bold text-[var(--muted)] uppercase tracking-tighter max-w-[80px] leading-tight">
                                  {getMockTopic(key, level)}
                                </div>
                              </motion.div>
                            </td>
                          );
                        } else {
                          // Not required & not possessed
                          return (
                            <td key={level} className="p-4 border-r border-[var(--border)] text-center transition-all">
                              <div className="text-[8px] font-black text-[var(--border)] uppercase tracking-widest opacity-40">—</div>
                            </td>
                          );
                        }
                      }
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend and Info Card */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="flex items-center gap-3 p-6 bg-[var(--surface)] border border-[var(--border)] rounded-2xl">
          <Info className="h-5 w-5 text-indigo-400 shrink-0" />
          <p className="text-[10px] text-[var(--muted)] font-bold uppercase tracking-widest leading-relaxed">
            The matrix maps 12 standard skills across 10 levels of proficiency. Your live ProfileSync credentials are automatically matched against {company.short_name} requirements.
          </p>
        </div>

        <div className="p-6 bg-[var(--surface)] border border-[var(--border)] rounded-2xl space-y-3">
          <div className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Matrix Scorecard Legend</div>
          <div className="grid grid-cols-2 gap-2 text-[9px] font-black uppercase tracking-wider">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle className="h-3.5 w-3.5" /> Met Requirement
            </div>
            <div className="flex items-center gap-2 text-rose-400">
              <AlertTriangle className="h-3.5 w-3.5" /> Skill Gap Detected
            </div>
            <div className="flex items-center gap-2 text-zinc-400 opacity-60">
              <HelpCircle className="h-3.5 w-3.5" /> Exceeds Requirement
            </div>
            <div className="flex items-center gap-2 text-[var(--muted)]/50">
              <span className="text-xs font-bold w-3.5 text-center">—</span> Not Required
            </div>
          </div>
        </div>
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
