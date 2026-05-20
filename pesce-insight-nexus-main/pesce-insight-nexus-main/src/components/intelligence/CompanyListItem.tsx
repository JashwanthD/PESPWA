import type { PESCECompanySchema } from "@/types/intelligence";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, MapPin, Briefcase, Zap, Shield, TrendingUp, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { ensureAbsoluteUrl } from "@/utils/calculators";
import { useState } from "react";
import { CompanyLogo } from "@/components/CompanyLogo";

import { useProfileSync } from "@/hooks/useProfileSync";

export function CompanyListItem({ company }: { company: PESCECompanySchema }) {
  const { calculateMatch } = useProfileSync();
  const matchScore = calculateMatch(company);
  const [applied, setApplied] = useState(false);
  
  const logoSrc = ensureAbsoluteUrl(company.logo_url);
  const initials = (company.short_name || company.name || "?")
    .split(/\s+/)
    .map(word => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-full"
    >
      <Link
        to="/companies/$id"
        params={{ id: company.company_id.toString() }}
        className="group flex flex-col md:flex-row md:items-center gap-4 md:gap-6 bg-[var(--surface)] border border-[var(--border)] p-4 rounded-2xl hover:border-indigo-500/50 transition-all duration-300 shadow-sm hover:shadow-indigo-500/5 relative overflow-hidden"
      >
        <div className="flex items-center gap-4 w-full md:w-auto md:flex-1 min-w-0">
          {/* Logo Section */}
          <CompanyLogo 
            name={company.name || "?"} 
            logoUrl={company.logo_url || undefined}
            domain={company.website_url || undefined} 
            className="h-14 w-14 shrink-0 rounded-xl" 
          />

          {/* Primary Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-tight group-hover:text-indigo-400 transition-colors truncate">
                {company.name}
              </h3>
              <span className="text-[8px] font-black uppercase tracking-widest text-indigo-500/80 bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/10 shrink-0">
                {company.category}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--muted)] uppercase tracking-tighter truncate">
                <MapPin className="h-3 w-3 shrink-0" />
                {company.headquarters_address?.split(",").slice(-1)[0].trim() || "India"}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--muted)] uppercase tracking-tighter shrink-0">
                <Briefcase className="h-3 w-3 shrink-0" />
                <span className="truncate">{company.nature_of_company?.split('·')[0] || "Services"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Section (Slider on Mobile) */}
        <div className="flex items-center gap-8 overflow-x-auto no-scrollbar md:px-8 md:border-x border-[var(--border)]/50 pb-2 md:pb-0 shrink-0 w-full md:w-auto">
          <div className="space-y-1 shrink-0">
            <div className="text-[8px] font-black uppercase tracking-widest text-[var(--muted)]">Hiring Node</div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-3 w-3 text-indigo-500" />
              <span className="text-[10px] font-black text-[var(--foreground)] uppercase">{company.hiring_velocity || "Stable"}</span>
            </div>
          </div>
          <div className="space-y-1 shrink-0">
            <div className="text-[8px] font-black uppercase tracking-widest text-[var(--muted)]">Sync Score</div>
            <div className="flex items-center gap-2">
              <Zap className={`h-3 w-3 ${matchScore > 70 ? 'text-amber-500' : matchScore > 40 ? 'text-blue-500' : 'text-red-500'}`} />
              <span className="text-[10px] font-black text-[var(--foreground)]">{matchScore}%</span>
            </div>
          </div>
        </div>

        {/* Action Section */}
        <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto shrink-0 border-t border-[var(--border)]/50 md:border-t-0 pt-3 md:pt-0">
          <button 
            onClick={(e) => {
              e.preventDefault();
              setApplied(true);
            }}
            disabled={applied}
            className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 flex-1 md:flex-none ${
              applied 
                ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 shadow-none cursor-default" 
                : "bg-indigo-500 hover:bg-indigo-600 text-white shadow-indigo-500/20"
            }`}
          >
            {applied ? (
              <>
                <CheckCircle2 className="h-3 w-3" /> Applied
              </>
            ) : (
              "Easy Apply"
            )}
          </button>
          <div className="h-8 w-8 rounded-lg bg-[var(--background)] border border-[var(--border)] flex items-center justify-center group-hover:border-indigo-500/50 transition-colors shrink-0">
            <ArrowUpRight className="h-4 w-4 text-[var(--muted)] group-hover:text-indigo-400 transition-colors" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
