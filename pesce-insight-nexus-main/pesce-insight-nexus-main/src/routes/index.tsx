import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCompanyData } from "@/hooks/useCompanyData";
import { CardSkeleton } from "@/components/ui/skeletons";
import { CompanyCard } from "@/components/intelligence/CompanyCard";
import { Building2, Search, TrendingUp, Star, Zap, Briefcase, ArrowRight, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CompanyLogo } from "@/components/CompanyLogo";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

const METRICS = [
  { key: "Total", label: "Active Intel Nodes", icon: Building2, color: "text-zinc-400" },
  { key: "Marquee", label: "Marquee", icon: Star, color: "text-amber-400" },
  { key: "Super Dream", label: "Super Dream", icon: Zap, color: "text-indigo-400" },
  { key: "Dream", label: "Dream", icon: TrendingUp, color: "text-emerald-400" },
  { key: "Regular", label: "Regular", icon: Briefcase, color: "text-zinc-500" },
] as const;

function Dashboard() {
  const { companies, isLoading: loading } = useCompanyData();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const navigate = useNavigate();

  const metricsData = useMemo(() => {
    const activeNodes = companies.filter(c => c.name && c.name.trim().length > 0);
    return METRICS.map(m => {
      let count = 0;
      if (m.key === "Total") count = activeNodes.length;
      else count = activeNodes.filter(c => c.category?.toLowerCase() === m.key.toLowerCase()).length;
      return { ...m, count };
    });
  }, [companies]);

  const featuredCompanies = useMemo(() => {
    return companies
      .filter(c => c.category?.toLowerCase() === "marquee")
      .slice(0, 4);
  }, [companies]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return companies
      .filter(c => c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || c.short_name?.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 5);
  }, [companies, searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      navigate({ to: "/companies/$id", params: { id: searchResults[0].company_id.toString() } });
    }
  };

  return (
    <div className="space-y-12 max-w-7xl mx-auto py-6">
      {/* 1. Command Header & Search */}
      <section className="flex flex-col gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-[var(--foreground)] uppercase leading-none">
            Nexus<span className="text-[var(--primary)]"> Intelligence</span>
          </h1>
          <p className="text-[10px] text-zinc-500 uppercase tracking-[0.4em] font-black">PES Placement Intelligence</p>
        </div>

        <div className="relative max-w-2xl w-full">
          <form onSubmit={handleSearchSubmit} className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search Intelligence Vault..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-2xl py-4 pl-12 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]/50 transition-all backdrop-blur-xl shadow-2xl"
            />
            {loading && (
              <div className="absolute inset-y-0 right-4 flex items-center">
                <Loader2 className="h-4 w-4 text-[var(--primary)] animate-spin" />
              </div>
            )}
          </form>

          <AnimatePresence>
            {isSearchFocused && searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden shadow-2xl z-50 backdrop-blur-2xl"
              >
                {searchResults.map((c) => (
                  <Link
                    key={c.company_id}
                    to="/companies/$id"
                    params={{ id: c.company_id.toString() }}
                    className="flex items-center gap-4 p-4 hover:bg-[var(--border)]/50 transition-colors border-b border-[var(--border)] last:border-0"
                  >
                    <CompanyLogo 
                      name={c.name || "?"} 
                      logoUrl={c.logo_url || undefined}
                      domain={c.website_url || undefined} 
                      className="h-8 w-8 shrink-0 rounded-lg" 
                    />
                    <div>
                      <div className="text-xs font-bold text-white uppercase tracking-tight">{c.name}</div>
                      <div className="text-[9px] text-zinc-500 uppercase tracking-widest">{c.category}</div>
                    </div>
                    <ArrowRight className="h-3 w-3 text-zinc-700 ml-auto" />
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* 2. Metric Cards Row */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {metricsData.map((m, idx) => {
          const Icon = m.icon;
          return (
            <Link
              key={m.key}
              to="/companies"
              search={{ category: m.key === "Total" ? undefined : m.key }}
              className="group bg-[var(--surface)] border border-[var(--border)] p-6 rounded-2xl hover:border-indigo-500/50 transition-all duration-300 flex flex-col gap-4 shadow-sm hover:shadow-indigo-500/10 hover:-translate-y-1"
            >
              <div className="flex justify-between items-start">
                <div className="h-10 w-10 rounded-xl bg-[var(--background)] border border-[var(--border)] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon className={`h-5 w-5 ${m.color}`} />
                </div>
                <div className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)] group-hover:text-indigo-400 transition-colors">Tier {idx + 1}</div>
              </div>
              <div>
                <div className="text-3xl font-black text-[var(--foreground)] tabular-nums leading-none mb-1">{m.count}</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">{m.label}</div>
              </div>
            </Link>
          );
        })}
      </section>

      {/* 3. Featured Intelligence Nodes */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-[var(--foreground)] uppercase tracking-tight">Top Marquee Nodes</h2>
            <p className="text-[10px] text-[var(--muted)] uppercase tracking-[0.2em] font-black">Premier Placement Intelligence</p>
          </div>
          <Link to="/companies" search={{ category: "Marquee" }} className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)] hover:underline flex items-center gap-2">
            View All Marquee <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
          ) : featuredCompanies.length > 0 ? (
            featuredCompanies.map((c) => <CompanyCard key={c.company_id} company={c} />)
          ) : (
            <div className="col-span-full py-12 bg-[var(--surface)] border border-dashed border-[var(--border)] rounded-2xl flex flex-col items-center justify-center gap-4 text-[var(--muted)]">
              <Building2 className="h-8 w-8 opacity-20" />
              <span className="text-[10px] font-black uppercase tracking-widest">Scanning for Marquee Nodes...</span>
            </div>
          )}
        </div>
      </section>

      {/* 4. Pulse Section (Preview) */}
      <section className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-indigo-500/5 to-transparent" />
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Live Placement Stream</span>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[var(--foreground)] uppercase tracking-tight">Active Recruitment Intel</h2>
              <p className="text-xs text-[var(--muted)] leading-relaxed max-w-md">
                Analyzing 200+ company nodes. Real-time skill matrix comparison and hiring round breakdown for the 2025-26 cycle.
              </p>
            </div>
            <div className="flex items-center justify-end">
              <Link to="/companies" className="px-6 py-3 bg-[var(--background)] border border-[var(--border)] text-[10px] font-black uppercase tracking-[0.2em] text-[var(--foreground)] hover:bg-indigo-500 hover:border-indigo-400 hover:text-white transition-all rounded-xl flex items-center gap-3">
                Access Company Vault <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
