import { formatData } from "@/utils/calculators";

interface SafetyGaugeProps {
  score: number;
  runwayMonths: string | null | undefined;
  burnRate: string | null | undefined;
  status: string | null | undefined;
}

export function SafetyGauge({ score, runwayMonths, burnRate, status }: SafetyGaugeProps) {
  const angle = (score / 100) * 180;
  const color =
    score >= 70 ? "oklch(0.7 0.16 150)" : score >= 40 ? "oklch(0.78 0.15 75)" : "oklch(0.62 0.22 27)";
  const label = score >= 70 ? "Stable" : score >= 40 ? "Watch" : "Risk";

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 120" className="w-full max-w-[260px]">
        {/* track */}
        <path
          d="M20 110 A 80 80 0 0 1 180 110"
          fill="none"
          stroke="oklch(0.92 0.02 260)"
          strokeWidth="14"
          strokeLinecap="round"
        />
        {/* arc */}
        <path
          d="M20 110 A 80 80 0 0 1 180 110"
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${(angle / 180) * 251} 251`}
        />
        {/* needle */}
        <g transform={`rotate(${angle - 90} 100 110)`}>
          <line x1="100" y1="110" x2="100" y2="40" stroke="oklch(0.18 0.10 265)" strokeWidth="3" strokeLinecap="round" />
          <circle cx="100" cy="110" r="6" fill="oklch(0.78 0.13 85)" stroke="oklch(0.18 0.10 265)" strokeWidth="2" />
        </g>
        <text x="100" y="100" textAnchor="middle" className="font-bold" fill="oklch(0.18 0.05 265)" fontSize="22">
          {score}
        </text>
        <text x="100" y="118" textAnchor="middle" fill="oklch(0.48 0.04 260)" fontSize="10">
          / 100
        </text>
      </svg>
      <div className="mt-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold" style={{ borderColor: color, color }}>
        <span className="h-2 w-2 rounded-full" style={{ background: color }} />
        {label}
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2 text-[10px] w-full max-w-[260px]">
        <Mini label="Runway" value={runwayMonths ? `${runwayMonths}mo` : "—"} />
        <Mini label="Burn" value={formatData(burnRate) as string} />
        <Mini label="Status" value={formatData(status) as string} />
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-mandya/5 px-2 py-1 text-center">
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-semibold text-mandya-deep truncate">{value}</div>
    </div>
  );
}
