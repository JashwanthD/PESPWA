import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { useCompanyById } from "@/hooks/useCompanyIntelligence";
import { NexusGraph } from "@/components/NexusGraph";
import { Loader2, ArrowLeft, Network } from "lucide-react";

export const Route = createFileRoute("/_dashboard/companies/$id/network")({
  component: CompanyNetwork,
});

function CompanyNetwork() {
  const { id } = useParams({ from: "/_dashboard/companies/$id/network" });
  const { data: company, loading } = useCompanyById(Number(id));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Isolating Node Cluster...</p>
      </div>
    );
  }

  if (!company) return <div>Node Not Found</div>;

  return (
    <div className="h-[calc(100vh-160px)] w-full flex flex-col gap-6">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
             <Link to="/companies/$id" params={{ id }} className="text-indigo-400 hover:underline text-[9px] font-black uppercase tracking-widest">{company.name}</Link>
             <span className="text-zinc-700">/</span>
             <span className="text-zinc-500 text-[9px] font-black uppercase tracking-widest">Network</span>
          </div>
          <h1 className="text-3xl font-black text-[var(--foreground)] uppercase tracking-tight">Node <span className="text-[var(--primary)]">Clustering</span></h1>
          <p className="text-[10px] text-[var(--muted)] uppercase tracking-[0.4em] font-black">Local Competitor Topology</p>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <NexusGraph 
          companyId={company.company_id} 
          companyName={company.name || "Unknown"} 
        />
      </div>
    </div>
  );
}
