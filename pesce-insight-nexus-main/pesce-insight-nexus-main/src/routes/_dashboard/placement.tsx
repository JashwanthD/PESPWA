import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Briefcase, BrainCircuit, BookOpen, Calculator, 
  GraduationCap, TrendingUp, Sparkles, User, 
  ChevronRight, CheckCircle, AlertTriangle, ShieldCheck 
} from "lucide-react";
import { useProfileSync } from "@/hooks/useProfileSync";
import { useCompanyData } from "@/hooks/useCompanyData";
import { CompanyCard } from "@/components/intelligence/CompanyCard";
import { SkillBadge } from "@/components/intelligence/SkillBadge";
import { InterviewVault } from "@/components/intelligence/InterviewVault";
import { OfferOptimizer } from "@/components/placement/OfferOptimizer";
import { SKILL_LABELS, PESCECompanySchema } from "@/types/intelligence";
import { CompanyLogo } from "@/components/CompanyLogo";
import { getScoreValue } from "@/utils/normalizers";

export const Route = createFileRoute("/_dashboard/placement")({
  component: PlacementDashboard,
});

type TabType = "openings" | "skillsync" | "vault" | "optimizer";

function PlacementDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("openings");
  const { student, calculateMatch } = useProfileSync();
  const { companies } = useCompanyData();

  const tabs = [
    { id: "openings" as const, label: "Placement Openings", icon: Briefcase, desc: "Active drives & Apply now" },
    { id: "skillsync" as const, label: "ProfileSync Analyzer", icon: BrainCircuit, desc: "Skill matching & LMS bridge" },
    { id: "vault" as const, label: "Interview Intelligence", icon: BookOpen, desc: "Alumni vault & tips" },
    { id: "optimizer" as const, label: "Offer Optimizer", icon: Calculator, desc: "Job comparator & simulation" },
  ];

  return (
    <div className="max-w-7xl mx-auto py-6 space-y-8 pb-24">
      {/* Page Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[var(--border)] pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-[var(--foreground)] uppercase tracking-tight flex items-center gap-2">
            Placement Hub <Sparkles className="h-5 w-5 text-indigo-400 animate-pulse" />
          </h1>
          <p className="text-[10px] text-[var(--muted)] uppercase tracking-[0.3em] font-black">
            PESCE Decision-Grade Placement Intelligence Platform
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-2 flex items-center gap-2.5 shadow-md">
            <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center text-white font-black text-[9px] shadow-md shadow-indigo-600/20">
              {student?.full_name?.[0]?.toUpperCase() || "S"}
            </div>
            <div>
              <div className="text-[8px] font-black uppercase tracking-widest text-[var(--muted)]">Student Profile</div>
              <div className="text-xs font-bold text-[var(--foreground)] capitalize">{student?.full_name || "Student Node"}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-[var(--border)]/20 p-1.5 border border-[var(--border)] rounded-2xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-start p-3 rounded-xl transition-all duration-300 border text-left cursor-pointer ${
                active 
                  ? "bg-indigo-500/10 dark:bg-indigo-600/10 border-indigo-500/30 text-[var(--primary)] shadow-lg shadow-indigo-600/5" 
                  : "bg-transparent border-transparent text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)]"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`h-4 w-4 ${active ? "text-[var(--primary)]" : "text-[var(--muted)]"}`} />
                <span className="text-xs font-black uppercase tracking-wider">{tab.label}</span>
              </div>
              <span className="text-[9px] text-[var(--muted)]/80 font-bold uppercase tracking-tight leading-none">{tab.desc}</span>
            </button>
          );
        })}
      </section>

      {/* Tab Contents */}
      <div className="mt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {/* 1. Placement Openings */}
            {activeTab === "openings" && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h2 className="text-lg font-black text-[var(--foreground)] uppercase tracking-tight">Active Recruitment Drives</h2>
                  <p className="text-[10px] text-[var(--muted)] uppercase tracking-widest font-black">
                    Vetted company nodes with active application portals
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {companies.map((company) => (
                    <CompanyCard key={company.company_id} company={company} />
                  ))}
                </div>
              </div>
            )}

            {/* 2. ProfileSync Analyzer & Skill LMS Bridge */}
            {activeTab === "skillsync" && (
              <div className="space-y-8">
                {/* Intro summary */}
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
                  
                  <div className="flex flex-col md:flex-row gap-6 justify-between md:items-center relative z-10">
                    <div className="space-y-3">
                      <span className="text-[8px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 flex items-center gap-1 w-fit">
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
                        <div className="text-xl font-black text-indigo-600 dark:text-indigo-400">{student?.interests?.length || 3}</div>
                        <div className="text-[8px] font-black text-[var(--muted)] uppercase">Interests</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Company Fit Lists */}
                <div className="space-y-6">
                  <h3 className="text-xs font-black text-[var(--muted)] uppercase tracking-widest">Alignment Report by Company Node</h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    {companies.map((company) => {
                      const fitPercent = calculateMatch(company);
                      const requiredSkills = (company.skill_levels || {}) as Record<string, number>;
                      
                      // Calculate skill gaps
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
                        <div key={company.company_id} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 flex flex-col justify-between gap-6 shadow-md">
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
                                  <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{company.category}</span>
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
                            <div className="space-y-3 pt-3 border-t border-[var(--border)]">
                              {missingSkills.length > 0 ? (
                                <div className="space-y-1.5">
                                  <span className="text-[9px] font-black uppercase tracking-wider text-red-500 dark:text-red-400 flex items-center gap-1">
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
                                <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-emerald-500 dark:text-emerald-400">
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
                          <div className="pt-4 border-t border-[var(--border)] flex justify-between items-center">
                            <span className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-wide">
                              HQ: {company.headquarters_address?.split(',')[0]}
                            </span>
                            {company.application_url ? (
                              <a
                                href={company.application_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[9px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-all flex items-center gap-1"
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
                </div>
              </div>
            )}

            {/* 3. Interview Intelligence Vault */}
            {activeTab === "vault" && (
              <div className="space-y-6">
                <InterviewVault />
              </div>
            )}

            {/* 4. Offer Optimizer Simulator */}
            {activeTab === "optimizer" && (
              <div className="space-y-6">
                <OfferOptimizer />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
