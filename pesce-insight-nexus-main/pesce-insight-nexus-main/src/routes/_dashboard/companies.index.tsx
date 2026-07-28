import { createFileRoute } from "@tanstack/react-router";
import { useCompanyData } from "@/hooks/useCompanyData";
import { CompanyCard } from "@/components/intelligence/CompanyCard";
import { CardSkeleton } from "@/components/ui/skeletons";
import { useMemo, useState } from "react";
import { Search, Filter, X, LayoutGrid, List } from "lucide-react";
import { CompanyListItem } from "@/components/intelligence/CompanyListItem";
import { AddCompanyModal } from "@/components/intelligence/AddCompanyModal";
import { useAuth } from "@/lib/auth";

interface CompaniesSearch {
  category?: string;
}

export const Route = createFileRoute("/_dashboard/companies/")({
  validateSearch: (search: Record<string, unknown>): CompaniesSearch => ({
    category: typeof search.category === "string" ? search.category : undefined,
  }),
  component: CompaniesDirectory,
});

const CATEGORIES = ["All", "Marquee", "Super Dream", "Dream", "Regular"];

function CompaniesDirectory() {
  const { role } = useAuth();
  const { category: initialCategory } = Route.useSearch();
  const { companies: data, isLoading: loading } = useCompanyData();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(initialCategory ?? "All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filtered = useMemo(() => {
    return (data ?? []).filter((c) => {
      const matchesSearch = !query || 
        c.name?.toLowerCase().includes(query.toLowerCase()) || 
        c.short_name?.toLowerCase().includes(query.toLowerCase());
      
      const matchesCategory = activeCategory === "All" || c.category === activeCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [data, query, activeCategory]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-6">
      {/* 1. Header & Filters */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col sm:flex-row sm:items-end gap-6 w-full">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-[var(--foreground)] uppercase tracking-tight">Intelligence Vault</h1>
            <p className="text-[10px] text-[var(--muted)] uppercase tracking-[0.4em] font-black">Node Directory / {filtered.length} Entities</p>
          </div>
          
          <div className="flex gap-2 items-center ml-auto">
            {role === 'admin' && <AddCompanyModal />}
            <div className="flex gap-1 p-1 bg-[var(--surface)] border border-[var(--border)] rounded-xl">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative group min-w-0 sm:min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)] group-focus-within:text-indigo-400 transition-colors" />
            <input
              type="text"
              placeholder="Search companies..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl py-3 pl-12 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all shadow-xl"
            />
          </div>
          <div className="overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex gap-1 p-1 bg-[var(--surface)] border border-[var(--border)] rounded-xl w-fit">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all whitespace-nowrap ${
                    activeCategory === cat
                      ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                      : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border)]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Content View */}
      <section className={viewMode === "grid" 
        ? "grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" 
        : "flex flex-col gap-3"
      }>
        {loading ? (
          Array.from({ length: 12 }).map((_, i) => <CardSkeleton key={i} />)
        ) : filtered.length > 0 ? (
          filtered.map((c) => (
            viewMode === "grid" 
              ? <CompanyCard key={c.company_id} company={c} />
              : <CompanyListItem key={c.company_id} company={c} />
          ))
        ) : (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center gap-4 bg-[var(--surface)] border border-dashed border-[var(--border)] rounded-3xl">
            <div className="h-12 w-12 rounded-2xl bg-[var(--background)] border border-[var(--border)] flex items-center justify-center">
              <X className="h-6 w-6 text-[var(--muted)]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--muted)] uppercase tracking-widest">No matching nodes found</h3>
              <p className="text-[10px] text-[var(--muted)]/50 uppercase tracking-widest mt-1">Refine your search or filters</p>
            </div>
            <button 
              onClick={() => { setQuery(""); setActiveCategory("All"); }}
              className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
