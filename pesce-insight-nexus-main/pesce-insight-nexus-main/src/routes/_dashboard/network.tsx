import { createFileRoute } from "@tanstack/react-router";
import { NexusGraph } from "@/components/NexusGraph";
import { useCompanyIntelligence } from "@/hooks/useCompanyIntelligence";
import { Loader2, Share2, Info } from "lucide-react";

export const Route = createFileRoute("/_dashboard/network")({
  component: GlobalNetwork,
});

function GlobalNetwork() {
  const { data: companies, loading } = useCompanyIntelligence();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Mapping Ecosystem Neurons...</p>
      </div>
    );
  }

  // For the global view, we'll center it on a prominent company or just show a high-level view
  // In a real app, we might have an RPC for "all_relationships"
  const targetCompany = companies?.[0];

  return (
    <div className="h-[calc(100vh-160px)] w-full flex flex-col gap-6">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-[var(--foreground)] uppercase tracking-tight">Nexus <span className="text-[var(--primary)]">Network</span></h1>
          <p className="text-[10px] text-[var(--muted)] uppercase tracking-[0.4em] font-black">Global Ecosystem Topology</p>
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl flex items-center gap-3">
             <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
             <span className="text-[9px] font-bold text-[var(--foreground)] uppercase tracking-widest">Live Sync: 143 Nodes</span>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {targetCompany && (
          <NexusGraph 
            companyId={targetCompany.company_id} 
            companyName={targetCompany.name || "Unknown"} 
          />
        )}
      </div>

      <div className="grid grid-cols-3 gap-6">
         <div className="p-6 bg-[var(--surface)] border border-[var(--border)] rounded-3xl space-y-3">
            <Share2 className="h-4 w-4 text-[var(--primary)]" />
            <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]">Node Connectivity</h4>
            <p className="text-[10px] text-[var(--muted)] leading-relaxed">Analyzing skill-vector overlap between product and service hubs.</p>
         </div>
         <div className="p-6 bg-[var(--surface)] border border-[var(--border)] rounded-3xl space-y-3">
            <Info className="h-4 w-4 text-[var(--primary)]" />
            <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]">Similarity Logic</h4>
            <p className="text-[10px] text-[var(--muted)] leading-relaxed">Powered by Euclidean distance mapping across 12 proficiency axes.</p>
         </div>
         <div className="p-6 bg-[var(--surface)] border border-[var(--border)] rounded-3xl space-y-3">
            <Loader2 className="h-4 w-4 text-[var(--primary)]" />
            <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]">Real-time Feed</h4>
            <p className="text-[10px] text-[var(--muted)] leading-relaxed">Auto-clustering companies based on hiring velocity and tech stacks.</p>
         </div>
      </div>
    </div>
  );
}
