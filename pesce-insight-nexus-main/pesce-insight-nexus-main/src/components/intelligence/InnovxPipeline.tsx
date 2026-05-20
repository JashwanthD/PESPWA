import React from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Cpu, Lightbulb, Rocket, Target, ShieldCheck, 
  BarChart3, Dna, TrendingUp, Box 
} from "lucide-react";
import { motion } from "framer-motion";
import type { PESCECompanySchema } from "@/types/intelligence";

interface InnovxPipelineProps {
  company: PESCECompanySchema;
}

export function InnovxPipeline({ company }: InnovxPipelineProps) {
  const roadmapText = company.innovation_roadmap || "";
  const productText = company.product_pipeline || "";
  const rndInvestment = company.r_and_d_investment || "Aggressive";
  const aiAdoptionLevel = company.ai_ml_adoption_level || "High";
  
  // Try to parse if it's JSON, otherwise split by comma or newline for fallback items
  const parseItems = (text: string, defaultName: string) => {
    if (!text) return [];
    try {
      if (text.trim().startsWith('[')) {
        return JSON.parse(text);
      }
    } catch {}
    
    return text.split(/[,;\n]+/).filter(s => s.trim().length > 3).map(s => ({
      project_name: s.trim().substring(0, 30),
      project_description: s.trim()
    }));
  };

  const roadmapItems = parseItems(roadmapText, "Innovation Theme");
  const productItems = parseItems(productText, "Product Milestone");

  const aiScoreMap: Record<string, number> = {
    "Low": 30, "Medium": 60, "High": 85, "Very High": 95, "Elite": 98
  };
  const aiAdoption = aiScoreMap[aiAdoptionLevel] || 65;

  if (roadmapItems.length === 0 && productItems.length === 0) {
    return (
      <div className="intel-card p-12 text-center space-y-4">
        <Dna className="h-12 w-12 text-muted/20 mx-auto" />
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-widest">Pipeline Dark</h3>
        <p className="text-zinc-500 dark:text-zinc-400 text-xs max-w-xs mx-auto">
          Signals for this R&D roadmap are currently encrypted or in early-stage synthesis. 
          Check back for the next Staging Node sync.
        </p>
      </div>
    );
  }

  const itemsToDisplay = roadmapItems.length > 0 ? roadmapItems : productItems;

  return (
    <div className="space-y-8">
      {/* INNOVATION KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* AI/ML Readiness */}
        <div className="md:col-span-2 intel-card p-8 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
            <Cpu className="h-40 w-40" />
          </div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20 text-primary">
                <Box className="h-5 w-5" />
              </div>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">AI Readiness Index</span>
            </div>
            <span className="text-2xl font-black text-primary tabular-nums">{aiAdoption}%</span>
          </div>
          <div className="space-y-4">
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-1">Neural Integration</span>
            <Progress value={aiAdoption} className="h-1.5 bg-zinc-500/10 dark:bg-zinc-400/10 rounded-full" />
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-md">
              High-fidelity R&D investment signals and active patent filings indicate an **Aggressive** adoption of Multi-Agent Systems and Generative Logic.
            </p>
          </div>
        </div>

        {/* Matrix Card */}
        <div className="intel-card p-8 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">R&D Matrix</span>
          </div>
          <div className="space-y-5">
            {[
              { label: "IP Strength", value: "Strong", color: "text-primary" },
              { label: "Venture Fit",  value: rndInvestment, color: "text-primary/70" },
              { label: "Future Bet",   value: itemsToDisplay[0]?.project_name || "Autonomous Ops", color: "text-foreground" },
            ].map((kpi) => (
              <div key={kpi.label} className="flex justify-between items-end border-b border-border pb-2">
                <span className="text-[10px] uppercase font-bold opacity-30">{kpi.label}</span>
                <span className={`text-[11px] font-black ${kpi.color}`}>{kpi.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ACTIVE PROJECTS & TRENDS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Projects Timeline */}
        <div className="lg:col-span-8 space-y-4">
           <div className="flex items-center gap-2 mb-2">
            <Rocket className="h-4 w-4 text-primary" />
            <h4 className="text-xs font-black uppercase tracking-widest text-foreground">Active Innovation Pipeline</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {itemsToDisplay.slice(0, 4).map((item: any, idx: number) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="intel-card p-5 group hover:border-primary/40 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                   <Badge className="bg-muted/10 text-[8px] font-black uppercase tracking-widest text-primary/60 border-primary/20">Phase 0{idx+1}</Badge>
                   <TrendingUp className="h-3 w-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h5 className="text-xs font-black text-zinc-900 dark:text-zinc-50 group-hover:text-primary transition-colors mb-2 truncate">
                  {item.project_name || item.innovation_theme || "Internal Prototype"}
                </h5>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-3">
                  {item.project_description || item.problem_statement || "Classified R&D initiative focusing on high-density infrastructure optimized for enterprise scale."}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Market Signals */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            <h4 className="text-xs font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-50">Surveillance Trends</h4>
          </div>
          <div className="space-y-3">
            <div className="intel-card p-8 flex flex-col items-center justify-center text-center opacity-40">
              <BarChart3 className="h-8 w-8 mb-2" />
              <span className="text-[10px] font-black uppercase">Synthesizing Signals...</span>
            </div>
          </div>
        </div>
      </div>

      {/* DISCLOSURE */}
      <div className="intel-card p-6 border-primary/10 flex items-center gap-4 bg-primary/5">
        <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed italic">
          InnovX data is derived via algorithmic patent surveillance, active GitHub repository tracking, and 
          quarterly analyst briefings. These signals are intended for high-level tactical preparation only.
        </p>
      </div>
    </div>
  );
}
