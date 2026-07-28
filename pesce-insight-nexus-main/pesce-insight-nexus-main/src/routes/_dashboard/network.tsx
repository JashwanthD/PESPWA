import { createFileRoute } from "@tanstack/react-router";
import { InterviewVault } from "@/components/intelligence/InterviewVault";

export const Route = createFileRoute("/_dashboard/network")({
  component: GlobalNetwork,
});

function GlobalNetwork() {
  return (
    <div className="max-w-7xl mx-auto py-6 space-y-6 pb-24">
      <div className="flex justify-between items-end border-b border-zinc-800 pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-[var(--foreground)] uppercase tracking-tight">
            Ecosystem <span className="text-[var(--primary)]">Network</span>
          </h1>
          <p className="text-[10px] text-[var(--muted)] uppercase tracking-[0.4em] font-black">
            Alumni Resource Network & Interview Intel Vault
          </p>
        </div>
      </div>
      
      <div className="pt-2">
        <InterviewVault />
      </div>
    </div>
  );
}
