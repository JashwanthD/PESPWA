import { createFileRoute, Link } from "@tanstack/react-router";
import { useCompanyData } from "@/hooks/useCompanyData";
import { useProfileSync } from "@/hooks/useProfileSync";
import { SkillBadge } from "@/components/intelligence/SkillBadge";
import { motion } from "framer-motion";
import { Network, Zap, Shield, ChevronRight, ShieldCheck, AlertTriangle, CheckCircle, BrainCircuit } from "lucide-react";
import { SKILL_LABELS } from "@/types/intelligence";
import { useMemo, useState } from "react";
import { CompanyLogo } from "@/components/CompanyLogo";
import { getScoreValue } from "@/utils/normalizers";

export const Route = createFileRoute("/_dashboard/skills")({
  component: GlobalSkillMatrix,
});

function GlobalSkillMatrix() {
  const { companies, isLoading } = useCompanyData();
  const { student, calculateMatch } = useProfileSync();
  const [activeSubTab, setActiveSubTab] = useState<"matrix" | "profilesync">("matrix");

  const skillAxioms = Object.keys(SKILL_LABELS) as (keyof typeof SKILL_LABELS)[];

  const aggregatedSkills = useMemo(() => {
    return skillAxioms.map(axiom => {
      const activeCompanies = companies
        .filter(c => getScoreValue((c as any).skill_levels?.[axiom]) > 0)
        .sort((a, b) => getScoreValue((b as any).skill_levels?.[axiom]) - getScoreValue((a as any).skill_levels?.[axiom]))
        .slice(0, 5);
      
      const avgRating = activeCompanies.length > 0 
        ? Math.round(activeCompanies.reduce((acc, c) => acc + getScoreValue((c as any).skill_levels?.[axiom]), 0) / activeCompanies.length)
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
    <div className="max-w-7xl mx-auto py-6 space-y-8 pb-24">
      {/* Header section with tab selectors */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-800 pb-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-black text-[var(--foreground)] uppercase tracking-tight">Skill Matrix & Sync</h1>
          <p className="text-[10px] text-[var(--muted)] uppercase tracking-[0.4em] font-black">Cross-Node Intelligence Aggregator</p>
        </div>
        
        <div className="flex gap-1 p-1 bg-zinc-950 border border-zinc-800 rounded-xl w-fit">
          <button
            onClick={() => setActiveSubTab("matrix")}
            className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all whitespace-nowrap ${
              activeSubTab === "matrix"
                ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-zinc-900"
            }`}
          >
            Skill Matrix Overview
          </button>
          <button
            onClick={() => setActiveSubTab("profilesync")}
            className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeSubTab === "profilesync"
                ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-zinc-900"
            }`}
          >
            <BrainCircuit className="h-3 w-3 animate-pulse" />
            ProfileSync Live Alignment
          </button>
        </div>
      </div>

      {/* Tab 1: Skill Matrix Overview */}
      {activeSubTab === "matrix" && (
        <div className="grid lg:grid-cols-2 gap-6">
          {isLoading ? (
            <div className="col-span-full py-20 text-center text-xs uppercase tracking-widest text-[var(--muted)]">
              Loading aggregator metrics...
            </div>
          ) : (
            aggregatedSkills.map((skill, idx) => (
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
                      <span className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)]">Industry Difficulty</span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className={`h-1 w-3 rounded-full ${i < skill.avgRating / 2 ? "bg-indigo-500" : "bg-[var(--border)]"}`} />
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
                  <div className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] mb-2">High-Intensity Hiring Nodes</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {skill.topNodes.map(node => (
                      <Link 
                        key={node.company_id}
                        to="/companies/$id"
                        params={{ id: node.company_id.toString() }}
                        className="flex items-center gap-3 p-3 bg-[var(--background)] border border-[var(--border)] rounded-xl hover:border-indigo-500/50 transition-all group/node"
                      >
                        <CompanyLogo 
                          name={node.name || "?"} 
                          logoUrl={node.logo_url || undefined}
                          domain={node.website_url || undefined} 
                          className="h-8 w-8 shrink-0 rounded-lg" 
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] font-bold text-[var(--foreground)] uppercase truncate">{node.name}</div>
                          <div className="text-[8px] font-black text-indigo-550 dark:text-indigo-400 uppercase tracking-widest">Lvl {getScoreValue((node as any).skill_levels?.[skill.key])} Requirement</div>
                        </div>
                        <ChevronRight className="h-3 w-3 text-[var(--border)] group-hover/node:text-indigo-400 transition-colors" />
                      </Link>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: ProfileSync Live Alignment & LMS Bridges */}
      {activeSubTab === "profilesync" && (
        <div className="space-y-8">
          {/* Summary Dashboard Bar */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
            
            <div className="flex flex-col md:flex-row gap-6 justify-between md:items-center relative z-10">
              <div className="space-y-3">
                <span className="text-[8px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 flex items-center gap-1 w-fit">
                  <ShieldCheck className="h-3 w-3" /> PROFILESYNC LIVE ALIGNMENT
                </span>
                <h2 className="text-xl font-black text-[var(--foreground)] uppercase tracking-tight">Skill Matching Matrix & LMS Bridges</h2>
                <p className="text-xs text-[var(--muted)] max-w-2xl leading-relaxed">
                  Below is a detailed analysis of your skill proficiencies matched against our top tier hiring partners. Click on any missing or active skill badge to open direct learning pathways on YouTube, Coursera, or practice exercises on LeetCode.
                </p>
              </div>

              <div className="bg-[var(--background)] border border-[var(--border)] p-4 rounded-2xl flex items-center gap-4 shrink-0 shadow-md">
                <div className="text-center">
                  <div className="text-xl font-black text-[var(--foreground)]">{student?.gpa || "8.85"}</div>
                  <div className="text-[8px] font-black text-[var(--muted)] uppercase">GPA</div>
                </div>
                <div className="h-8 w-px bg-[var(--border)]" />
                <div className="text-center">
                  <div className="text-xl font-black text-indigo-400">{student?.interests?.length || 3}</div>
                  <div className="text-[8px] font-black text-[var(--muted)] uppercase">Interests</div>
                </div>
              </div>
            </div>
          </div>

          {/* Company Alignment Lists */}
          <div className="space-y-6">
            <h3 className="text-xs font-black text-[var(--muted)] uppercase tracking-widest">Alignment Report by Company Node</h3>
            
            {isLoading ? (
              <div className="text-center py-12 text-xs uppercase tracking-widest text-[var(--muted)]">
                Computing live alignment matrix...
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {companies.map((company) => {
                  const fitPercent = calculateMatch(company);
                  const requiredSkills = (company.skill_levels || {}) as Record<string, number>;
                  
                  const skillStates = Object.entries(requiredSkills).map(([key, reqVal]) => {
                    const numericReqVal = getScoreValue(reqVal as any);
                    const studVal = student.skills?.[key] || 0;
                    const isMissing = studVal < numericReqVal;
                    const label = SKILL_LABELS[key as keyof typeof SKILL_LABELS] || key;
                    return { key, label, reqVal: numericReqVal, studVal, isMissing };
                  });

                  const missingSkills = skillStates.filter(s => s.isMissing && s.reqVal > 0);
                  const matchedSkills = skillStates.filter(s => !s.isMissing && s.reqVal > 0);

                  return (
                    <div key={company.company_id} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 flex flex-col justify-between gap-6 shadow-md hover:border-zinc-800 transition-colors">
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex items-center gap-3">
                            <CompanyLogo 
                              name={company.name || "?"} 
                              logoUrl={company.logo_url || undefined}
                              domain={company.website_url || undefined} 
                              className="h-10 w-10 shrink-0 rounded-lg p-1" 
                            />
                            <div>
                              <h4 className="text-sm font-black text-[var(--foreground)] uppercase tracking-tight">{company.name}</h4>
                              <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">{company.category}</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-lg font-black text-amber-500 flex items-center gap-0.5 justify-end">
                              {fitPercent}%
                            </div>
                            <div className="text-[8px] font-black text-[var(--muted)] uppercase tracking-widest">Profile Match</div>
                          </div>
                        </div>

                        {/* Gap Analysis */}
                        <div className="space-y-3 pt-3 border-t border-[var(--border)]/50">
                          {missingSkills.length > 0 ? (
                            <div className="space-y-1.5">
                              <span className="text-[9px] font-black uppercase tracking-wider text-red-400 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" /> Gaps Detected ({missingSkills.length})
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {missingSkills.map((sk) => (
                                  <SkillBadge 
                                    key={sk.key} 
                                    skillKey={sk.key} 
                                    label={sk.label} 
                                    isMissing={true}
                                  />
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-emerald-400">
                              <CheckCircle className="h-3.5 w-3.5" /> All requirements matched!
                            </div>
                          )}

                          {matchedSkills.length > 0 && (
                            <div className="space-y-1.5">
                              <span className="text-[9px] font-black uppercase tracking-wider text-[var(--muted)]">
                                Aligned Skills ({matchedSkills.length})
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {matchedSkills.map((sk) => (
                                  <SkillBadge 
                                    key={sk.key} 
                                    skillKey={sk.key} 
                                    label={sk.label} 
                                    isMissing={false}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Footer Apply CTA */}
                      <div className="pt-4 border-t border-[var(--border)]/50 flex justify-between items-center">
                        <span className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-wide">
                          HQ: {company.headquarters_address?.split(',')[0] || "India"}
                        </span>
                        {company.application_url ? (
                          <a
                            href={company.application_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[9px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-all flex items-center gap-1"
                          >
                            Apply Gateway <ChevronRight className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)]/50">No Active Drive</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
