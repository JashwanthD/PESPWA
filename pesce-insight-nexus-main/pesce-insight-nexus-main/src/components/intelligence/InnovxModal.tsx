import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Cpu, 
  Lightbulb, 
  Rocket, 
  Target, 
  ShieldCheck, 
  BarChart3,
  Dna
} from "lucide-react";
import type { InnovxData } from "@/services/dataHydrator";

interface InnovxModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyName: string;
  data: InnovxData | null;
}

export function InnovxModal({ isOpen, onClose, companyName, data }: InnovxModalProps) {
  if (!data) return null;

  const aiAdoption = data.innovx_master?.ai_readiness_score ?? 65;
  const roadmap = data.innovation_roadmap || [];
  const projects = data.innovx_projects || [];
  const trends = data.industry_trends || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto glass-dark border-white/10 text-slate-white">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Dna className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black tracking-tight">Innovation Roadmap</DialogTitle>
              <DialogDescription className="text-slate-white/60">
                Future-tech pipeline for {companyName}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {/* AI/ML Readiness Card */}
          <div className="md:col-span-2 glass-dark border-white/5 p-4 rounded-2xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-gold" />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-white/80">AI/ML Adoption Level</span>
              </div>
              <span className="text-xl font-black text-gold">{aiAdoption}%</span>
            </div>
            <Progress value={aiAdoption} className="h-2 bg-white/10" />
            <p className="text-[10px] text-slate-white/40 mt-3 leading-relaxed">
              Based on R&D investment signals and active AI patent filings identified in our analysis.
            </p>
          </div>

          {/* R&D Card */}
          <div className="glass-dark border-white/5 p-4 rounded-2xl">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-4 w-4 text-indigo-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-slate-white/80">R&D Matrix</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-white/50 underline decoration-white/10 underline-offset-4">Investment</span>
                <span className="text-white font-bold">{data.innovx_master?.rd_investment ?? "Aggressive"}</span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-white/50 underline decoration-white/10 underline-offset-4">IP Portfolio</span>
                <span className="text-white font-bold">{data.innovx_master?.ip_strength ?? "Analysis Pending"}</span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-white/50 underline decoration-white/10 underline-offset-4">Future Bet</span>
                <span className="text-white font-bold">{roadmap[0]?.innovation_theme ?? "Multi-Agent Systems"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          {/* Active Projects */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Rocket className="h-4 w-4 text-gold" />
              <h4 className="text-sm font-bold uppercase tracking-wider">Future Projects & Bets</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(projects.length > 0 ? projects : roadmap.slice(0, 4)).map((item: any, idx: number) => (
                <div key={idx} className="glass border-white/5 p-3 rounded-xl hover:border-gold/20 transition-colors group">
                  <h5 className="text-xs font-bold text-slate-white group-hover:text-gold transition-colors">
                    {item.project_name || item.innovation_theme || "Internal Prototype"}
                  </h5>
                  <p className="text-[10px] text-slate-white/50 mt-1 line-clamp-2">
                    {item.project_description || item.problem_statement || "No public data on project specifics."}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Trends */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="h-4 w-4 text-indigo-400" />
              <h4 className="text-sm font-bold uppercase tracking-wider">Surveillance Trends</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {trends.length > 0 ? trends.map((trend: any, idx: number) => (
                <div key={idx} className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                  <Target className="h-3 w-3 text-gold" />
                  <span className="text-[10px] font-bold text-slate-white/80">{trend.trend_name}</span>
                  <Badge className="bg-white/10 text-[8px] text-white p-0 px-1.5 h-4">
                    {trend.time_horizon_years}Y
                  </Badge>
                </div>
              )) : (
                <div className="text-xs text-slate-white/40 italic">Synthesizing market signals...</div>
              )}
            </div>
          </section>
        </div>

        <div className="mt-8 flex items-center gap-3 p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
          <ShieldCheck className="h-5 w-5 text-indigo-400 shrink-0" />
          <p className="text-[11px] text-slate-white/60 leading-relaxed">
            InnovX data is curated via patent scraping, GitHub activity, and analyst briefings. 
            All insights are directional and intended for strategic preparation.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
