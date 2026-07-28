import type { PESCECompanySchema } from "@/types/intelligence";
import { useNavigate } from "@tanstack/react-router";
import { ArrowUpRight, MapPin, Users, Calendar, Briefcase, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { ensureAbsoluteUrl } from "@/utils/calculators";
import { useProfileSync } from "@/hooks/useProfileSync";
import { CompanyLogo } from "@/components/CompanyLogo";

export function CompanyCard({ company }: { company: PESCECompanySchema }) {
  const { calculateMatch } = useProfileSync();
  const matchScore = calculateMatch(company);
  const navigate = useNavigate();

  const logoSrc = ensureAbsoluteUrl(company.logo_url);
  const initials = (company.short_name || company.name || "?")
    .split(/\s+/)
    .map(word => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleCardClick = () => {
    navigate({
      to: "/companies/$id",
      params: { id: company.company_id.toString() }
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full"
    >
      <div
        onClick={handleCardClick}
        className="group h-full bg-surface border border-border p-5 rounded-2xl hover:border-primary/50 transition-all duration-300 flex flex-col gap-5 shadow-sm hover:shadow-primary/5 hover:-translate-y-1 overflow-hidden cursor-pointer"
      >
        {/* Header: Logo & Name */}
        <div className="flex justify-between items-start">
          <CompanyLogo 
            name={company.name || "?"} 
            logoUrl={company.logo_url || undefined}
            domain={company.website_url || undefined} 
            className="h-12 w-12 shrink-0 rounded-xl" 
          />
          <div className="flex flex-col items-end gap-1">
            <ArrowUpRight className="h-4 w-4 text-border group-hover:text-primary transition-colors" />
            <div className="flex items-center gap-1 text-[8px] font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
              <Zap className="h-2 w-2" /> {matchScore}%
            </div>
          </div>
        </div>

        {/* Body: Title & Overview */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-tight group-hover:text-primary transition-colors truncate">
            {company.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/10">
              {company.category || "Intelligence Node"}
            </span>
          </div>
        </div>

        {/* Info Grid: Year, Nature, Employees */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-muted">
              <Calendar className="h-3 w-3" /> Est. Year
            </div>
            <div className="text-xs font-bold text-foreground">{company.incorporation_year || "—"}</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-muted">
              <Briefcase className="h-3 w-3" /> Nature
            </div>
            <div className="text-xs font-bold text-foreground truncate">{company.nature_of_company?.split('·')[0] || "—"}</div>
          </div>
        </div>

        {/* Apply Now Routing Gateway */}
        <div className="w-full mt-2">
          {company.application_url ? (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.open(company.application_url!, "_blank", "noopener,noreferrer");
              }}
              className="w-full text-center bg-primary hover:opacity-90 active:scale-[0.98] text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-lg shadow-primary/15 cursor-pointer uppercase tracking-wider"
            >
              Apply Now
            </button>
          ) : (
            <button
              disabled
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="w-full text-center bg-muted/10 border border-border text-muted/80 text-xs font-bold py-2.5 px-4 rounded-xl cursor-not-allowed uppercase tracking-wider"
            >
              No Active Openings
            </button>
          )}
        </div>

        {/* Footer: HQ & Employees */}
        <div className="mt-auto pt-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 min-w-0">
            <MapPin className="h-3 w-3 text-[var(--muted)] shrink-0" />
            <span className="text-[10px] font-bold text-[var(--muted)] truncate uppercase tracking-tighter">
              {company.headquarters_address?.split(",").slice(-2).join(",").trim() || "India"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Users className="h-3 w-3 text-[var(--muted)]" />
            <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-tighter">
              {company.employee_size || "—"}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
