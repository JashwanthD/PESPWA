import { createFileRoute, Link } from "@tanstack/react-router";
import { useCompanyIntelligence } from "@/hooks/useCompanyIntelligence";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Briefcase, ChevronRight, ChevronDown, 
  CheckCircle2, HelpCircle, Zap, Activity, Target, ArrowUpRight
} from "lucide-react";

export const Route = createFileRoute("/_dashboard/hiring")({
  component: GlobalHiringProcess,
});

function GlobalHiringProcess() {
  const { data: companies, loading } = useCompanyIntelligence();
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    if (!companies) return [];
    return companies.filter((c) => {
      const searchStr = `${c.name} ${c.short_name} ${c.category}`.toLowerCase();
      return searchStr.includes(query.toLowerCase());
    });
  }, [companies, query]);

  return (
    <div className="max-w-7xl mx-auto py-6 space-y-12 pb-24">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-[var(--foreground)] uppercase tracking-tight">Global Hiring Intelligence</h1>
        <p className="text-[10px] text-[var(--muted)] uppercase tracking-[0.4em] font-black">Recruitment Pathway Aggregator</p>
      </div>

      <div className="relative max-w-xl group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)] group-focus-within:text-indigo-400 transition-colors" />
        <input
          type="text"
          placeholder="Search company hiring patterns..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-2xl py-3 pl-12 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all shadow-xl"
        />
      </div>

      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 bg-[var(--surface)] border border-[var(--border)] rounded-2xl animate-pulse" />
          ))
        ) : (
          filtered.map((c) => (
            <HiringAggregatorCard 
              key={c.company_id} 
              company={c} 
              isExpanded={expandedId === c.company_id}
              onToggle={() => setExpandedId(expandedId === c.company_id ? null : c.company_id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function HiringAggregatorCard({ company, isExpanded, onToggle }: { company: any; isExpanded: boolean; onToggle: () => void }) {
  const rounds = [
    { name: "Aptitude & Coding", type: "Elimination" },
    { name: "Technical Interview I", type: "Core Skills" },
    { name: "Technical Interview II", type: "Architecture" },
    { name: "HR & Culture", type: "Final" },
  ];

  return (
    <div className={`bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden transition-all duration-300 ${isExpanded ? "ring-1 ring-indigo-500/30" : "hover:border-indigo-500/30"}`}>
      <div 
        className="p-6 flex items-center justify-between cursor-pointer group"
        onClick={onToggle}
      >
        <div className="flex items-center gap-6">
          <div className="h-12 w-12 rounded-xl bg-[var(--background)] border border-[var(--border)] flex items-center justify-center overflow-hidden">
             {company.logo_url ? <img src={company.logo_url} className="h-full w-full object-cover" /> : <Briefcase className="h-5 w-5 text-[var(--muted)]" />}
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-tight group-hover:text-indigo-400 transition-colors">{company.name}</h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)]">{company.category}</span>
              <span className="h-1 w-1 rounded-full bg-[var(--border)]" />
              <span className="text-[9px] font-black uppercase tracking-widest text-indigo-500">{rounds.length} Assessment Steps</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <Link to="/companies/$id/process" params={{ id: company.company_id.toString() }} className="p-2 hover:bg-indigo-500/10 rounded-lg transition-colors group/link">
              <ArrowUpRight className="h-4 w-4 text-[var(--muted)] group-hover/link:text-indigo-400" />
           </Link>
           {isExpanded ? <ChevronDown className="h-4 w-4 text-indigo-400" /> : <ChevronRight className="h-4 w-4 text-[var(--border)]" />}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-6 pb-8 border-t border-zinc-800/50"
          >
            <div className="grid md:grid-cols-4 gap-4 mt-6">
              {rounds.map((r, i) => (
                <div key={i} className="bg-[var(--background)] border border-[var(--border)] p-4 rounded-xl space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[8px] font-black">
                      {i + 1}
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)]">{r.type}</span>
                  </div>
                  <div className="text-xs font-bold text-[var(--foreground)] uppercase tracking-tight leading-tight">{r.name}</div>
                </div>
              ))}
            </div>
            <div className="mt-8 flex justify-end">
              <Link 
                to="/companies/$id/process" 
                params={{ id: company.company_id.toString() }}
                className="px-6 py-3 bg-[var(--background)] border border-[var(--border)] text-[10px] font-black uppercase tracking-[0.2em] text-[var(--foreground)] hover:bg-indigo-500 hover:border-indigo-400 hover:text-white transition-all rounded-xl flex items-center gap-2"
              >
                Deep-Dive Process <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
