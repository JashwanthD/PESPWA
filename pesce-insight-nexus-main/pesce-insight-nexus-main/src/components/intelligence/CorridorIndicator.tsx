import { Plane, Train } from "lucide-react";

interface CorridorProps {
  locationCentrality?: string | null;
  airportCommute?: string | null;
  publicTransport?: string | null;
}

/**
 * Mandya → Bangalore → Mysore tech corridor visualisation.
 * Uses location_centrality + airport_commute_time signals.
 */
export function CorridorIndicator({ locationCentrality, airportCommute, publicTransport }: CorridorProps) {
  const loc = (locationCentrality ?? "").toLowerCase();
  const isBlr = loc.includes("bengaluru") || loc.includes("bangalore");
  const isMys = loc.includes("mysuru") || loc.includes("mysore");
  const isChennai = loc.includes("chennai");

  const node = (active: boolean, label: string, sub: string) => (
    <div className="flex flex-col items-center text-center min-w-0">
      <div
        className={`grid h-9 w-9 place-items-center rounded-full border-2 text-xs font-bold ${
          active ? "bg-gold text-mandya-deep border-gold shadow-gold" : "bg-white text-muted-foreground border-border"
        }`}
      >
        {label[0]}
      </div>
      <div className="mt-1 text-[10px] font-semibold text-mandya-deep">{label}</div>
      <div className="text-[9px] text-muted-foreground">{sub}</div>
    </div>
  );

  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-mandya-deep mb-3">
        <span>Tech Corridor</span>
        <span className="text-gold">PESCE Logistics</span>
      </div>
      <div className="flex items-center gap-2">
        {node(true, "Mandya", "PESCE")}
        <div className={`h-0.5 flex-1 ${isBlr || isMys ? "bg-gold" : "bg-border"}`} />
        {node(isMys, "Mysuru", "1.0 hr")}
        <div className={`h-0.5 flex-1 ${isBlr ? "bg-gold" : "bg-border"}`} />
        {node(isBlr, "Bengaluru", "1.5 hr")}
        {isChennai && (
          <>
            <div className="h-0.5 flex-1 bg-gold" />
            {node(true, "Chennai", "Hub")}
          </>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between text-[11px] text-mandya-deep">
        <span className="inline-flex items-center gap-1">
          <Plane className="h-3 w-3 text-gold" /> Airport: {airportCommute ?? "—"}
        </span>
        <span className="inline-flex items-center gap-1">
          <Train className="h-3 w-3 text-gold" /> Transit: {publicTransport ?? "—"}
        </span>
      </div>
    </div>
  );
}
