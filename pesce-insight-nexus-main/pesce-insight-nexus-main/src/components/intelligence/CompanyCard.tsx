import type { PESCECompanySchema } from "@/types/intelligence";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, MapPin, Users, Calendar, Briefcase, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { ensureAbsoluteUrl } from "@/utils/calculators";
import { useProfileSync } from "@/hooks/useProfileSync";
import { CompanyLogo } from "@/components/CompanyLogo";

export function CompanyCard({ company }: { company: PESCECompanySchema }) {
  const { calculateMatch } = useProfileSync();
  const matchScore = calculateMatch(company);

  const logoSrc = ensureAbsoluteUrl(company.logo_url);
  const initials = (company.short_name || company.name || "?")
    .split(/\s+/)
    .map(word => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full"
    >
      <Link
        to="/companies/$id"
        params={{ id: company.company_id.toString() }}
        className="group h-full bg-[var(--surface)] border border-[var(--border)] p-5 rounded-2xl hover:border-indigo-500/50 transition-all duration-300 flex flex-col gap-5 shadow-sm hover:shadow-indigo-500/5 hover:-translate-y-1 overflow-hidden"
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
            <ArrowUpRight className="h-4 w-4 text-[var(--border)] group-hover:text-indigo-400 transition-colors" />
            <div className="flex items-center gap-1 text-[8px] font-black text-amber-500 bg-amber-500/5 px-1.5 py-0.5 rounded border border-amber-500/10">
              <Zap className="h-2 w-2" /> {matchScore}%
            </div>
          </div>
        </div>

        {/* Body: Title & Overview */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-tight group-hover:text-indigo-400 transition-colors truncate">
            {company.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500/80 bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/10">
              {company.category || "Intelligence Node"}
            </span>
          </div>
        </div>

        {/* Info Grid: Year, Nature, Employees */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[var(--border)]">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-[var(--muted)]">
              <Calendar className="h-3 w-3" /> Est. Year
            </div>
            <div className="text-xs font-bold text-[var(--foreground)]">{company.incorporation_year || "—"}</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-[var(--muted)]">
              <Briefcase className="h-3 w-3" /> Nature
            </div>
            <div className="text-xs font-bold text-[var(--foreground)] truncate">{company.nature_of_company?.split('·')[0] || "—"}</div>
          </div>
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
      </Link>
    </motion.div>
  );
}
