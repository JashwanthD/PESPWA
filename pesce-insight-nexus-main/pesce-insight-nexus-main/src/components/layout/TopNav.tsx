import { Link, useLocation } from "@tanstack/react-router";
import { Activity, BarChart3, Compass, Sparkles, Swords, Briefcase, Cpu, Network } from "lucide-react";

const NAV = [
  { to: "/", label: "Dashboard", icon: BarChart3, exact: true },
  { to: "/companies", label: "Explorer", icon: Compass, exact: false },
  { to: "/network", label: "Network", icon: Network, exact: false },
  { to: "/hiring", label: "Hiring", icon: Briefcase, exact: false },
  { to: "/innovx", label: "InnovX Labs", icon: Cpu, exact: false },
  { to: "/skills", label: "Skills", icon: Swords, exact: false },
] as const;

export function TopNav() {
  const loc = useLocation();
  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4">
      <div className="glass-dark mx-auto flex max-w-[1600px] items-center justify-between gap-4 rounded-2xl px-3 py-2.5 sm:px-5">
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-gold text-mandya-deep font-black shadow-gold">
            P
          </div>
          <div className="leading-tight">
            <div className="text-[11px] uppercase tracking-[0.18em] text-primary">PESCE</div>
            <div className="text-sm font-semibold text-foreground">Placement Intelligence</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV.map((item) => {
            const active = item.exact
              ? loc.pathname === item.to
              : loc.pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition ${
                  active
                    ? "bg-primary/15 text-primary border border-primary/40"
                    : "text-muted hover:text-foreground hover:bg-foreground/5 border border-transparent"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden sm:flex items-center gap-2 rounded-full border border-gold/30 bg-mandya-deep/40 px-3 py-1">
          <span className="pulse-dot h-2 w-2 rounded-full bg-success" />
          <span className="text-xs text-slate-white/90 font-mono">LIVE</span>
        </div>
      </div>

      {/* Mobile bottom-tab fallback */}
      <nav className="md:hidden fixed bottom-3 left-3 right-3 z-50 glass-dark rounded-2xl px-2 py-2 flex justify-around">
        {NAV.map((item) => {
          const active = item.exact
            ? loc.pathname === item.to
            : loc.pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg ${
                active ? "text-primary" : "text-muted"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

export function Ticker({ items }: { items: string[] }) {
  const loop = [...items, ...items];
  return (
    <div className="glass overflow-hidden rounded-xl border border-border">
      <div className="flex items-center">
        <div className="shrink-0 bg-primary px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-primary-foreground">
          <Activity className="inline h-3 w-3 mr-1" /> Intelligence Nodes Active
        </div>
        <div className="overflow-hidden flex-1">
          <div className="ticker py-2 text-sm text-foreground">
            {loop.map((s, i) => (
              <span key={i} className="mx-6">
                <span className="text-gold mr-2">●</span>
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
