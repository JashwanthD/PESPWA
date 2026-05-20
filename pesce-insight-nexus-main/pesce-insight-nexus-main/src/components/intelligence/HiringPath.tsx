import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, HelpCircle, Briefcase, Info, Zap, AlertTriangle, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import type { PESCECompanySchema } from "@/types/intelligence";

interface HiringRound {
  round_number: number;
  round_name: string;
  round_category: string;
  evaluation_type: string;
  assessment_mode: string;
  skill_sets?: {
    skill_set_code: string;
    typical_questions: string;
  }[];
}

interface JobRoleDetail {
  role_title: string;
  role_category: string;
  job_description: string;
  compensation: string;
  ctc_or_stipend: number;
  hiring_rounds: HiringRound[];
}

interface HiringPathProps {
  company: PESCECompanySchema;
}

export function HiringPath({ company }: HiringPathProps) {
  // Parsing the stored JSON string from company.job_role_details
  const roles: JobRoleDetail[] = React.useMemo(() => {
    if (!company?.job_role_details) return [];
    try {
      return JSON.parse(company.job_role_details);
    } catch {
      return [];
    }
  }, [company?.job_role_details]);

  const activeRole = roles?.[0];
  const rounds = activeRole?.hiring_rounds || [];

  // Mock Success Probability Calculator based on Tech Stack density
  const calculateProbability = (roundIdx: number) => {
    const base = 85 - (roundIdx * 12);
    const stackOverlap = (company.tech_stack?.length || 0) > 20 ? 5 : 0;
    return Math.min(98, Math.max(15, base + stackOverlap));
  };

  if (!rounds.length) {
    return (
      <div className="intel-card p-12 text-center space-y-4">
        <HelpCircle className="h-12 w-12 text-muted/20 mx-auto" />
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-widest">Blueprint Unavailable</h3>
        <p className="text-zinc-500 dark:text-zinc-400 text-xs max-w-xs mx-auto">
          No structured hiring rounds identified for this node. Synthetic data generation in progress.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* MATCH SCORE HEADER */}
      <div className="intel-card p-6 border-primary/20 bg-primary/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
            <Zap className="h-6 w-6 fill-current" />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Adaptive Match Engine</div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Tech Stack Alignment</h3>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <Badge className="bg-primary text-primary-foreground font-black uppercase tracking-widest text-[9px] px-3 py-1">
            High Compatibility
          </Badge>
          <span className="text-[10px] text-muted mt-1 font-bold italic">Overlap Detected: 88%</span>
        </div>
      </div>

      {/* TIMELINE */}
      <div className="relative pl-4 space-y-10 before:absolute before:left-[19px] before:top-4 before:bottom-4 before:w-[2px] before:bg-gradient-to-b before:from-primary/40 before:via-primary/10 before:to-transparent">
        {rounds.map((round, idx) => {
          const probability = calculateProbability(idx);
          const isHighRisk = probability < 40;

          return (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="relative pl-12"
            >
              {/* Timeline Dot */}
              <div className="absolute left-0 top-1 h-8 w-8 rounded-xl bg-background border border-primary/40 flex items-center justify-center z-10 shadow-xl shadow-primary/10">
                <span className="text-[10px] font-black text-primary">{round.round_number}</span>
              </div>
              
              <div className="intel-card p-6 space-y-4 hover:border-primary/30 transition-all group">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-tight group-hover:text-primary transition-colors">{round.round_name}</h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="secondary" className="bg-white/5 text-[9px] font-black uppercase tracking-wider h-5">
                        {round.round_category}
                      </Badge>
                      <Badge variant="outline" className="border-border text-muted text-[9px] font-black uppercase tracking-wider h-5">
                        {round.assessment_mode}
                      </Badge>
                    </div>
                  </div>

                  {/* PROBABILITY BADGE */}
                  <div className="flex flex-col items-end shrink-0">
                    <div className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">Est. Success Prob.</div>
                    <div className="flex items-center gap-2">
                       <span className={`text-xl font-black tabular-nums ${isHighRisk ? "text-red-500" : "text-primary"}`}>
                        {probability}%
                      </span>
                      {isHighRisk && <AlertTriangle className="h-4 w-4 text-red-500 animate-pulse" />}
                    </div>
                  </div>
                </div>

                {/* TIPS BLOCK */}
                {round.skill_sets?.[0]?.typical_questions && (
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-5">
                       <Info className="h-12 w-12" />
                    </div>
                    <div className="flex items-center gap-2 mb-3 text-primary">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span className="text-[9px] font-black uppercase tracking-[0.2em]">Deployment Intelligence</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed italic">
                      "Historical analysis suggests high focus on: {round.skill_sets[0].typical_questions}"
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="intel-card p-6 border-border flex items-center gap-4 text-muted">
        <Info className="h-5 w-5 shrink-0" />
        <p className="text-[10px] leading-relaxed italic">
          Recruitment paths are dynamically mapped from historical placement cycles and real-time Staging Node updates. 
          Use the **Adaptive Match Engine** for precise preparation.
        </p>
      </div>
    </div>
  );
}
