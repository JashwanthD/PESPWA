import { ReactNode, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { ReactLenis } from "lenis/react";
import { useAuth } from "@/lib/auth";
import { LinearAuthScreen } from "@/components/LinearAuthScreen";
import { CommandMenu } from "@/components/CommandMenu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/components/ThemeProvider";
import { Activity, LayoutDashboard, Compass, Swords, LogOut, Network, Share2, User, Briefcase } from "lucide-react";
import { useScroll, useVelocity, useTransform, useSpring, motion } from "framer-motion";

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { role, loading } = useAuth();
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 300, mass: 0.5 });

  const scale = useTransform(smoothVelocity, [-3000, 0, 3000], [0.98, 1, 0.98], { clamp: true });
  const blur = useTransform(smoothVelocity, [-3000, -1500, 0, 1500, 3000], ["blur(4px)", "blur(2px)", "blur(0px)", "blur(2px)", "blur(4px)"], { clamp: true });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 bg-[var(--foreground)] rounded-xl animate-pulse flex items-center justify-center font-black text-xs text-[var(--background)]">
            P
          </div>
          <div className="text-[10px] uppercase tracking-[0.3em] font-black text-[var(--muted)] animate-pulse">
            Nexus Handshake...
          </div>
        </div>
      </div>
    );
  }

  if (!role) {
    return <LinearAuthScreen />;
  }

  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.2, overscroll: false }}>
      <div className="min-h-screen pb-24 md:pb-12 flex flex-col pt-12 bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
        <ParallaxMeshGrid scrollY={scrollY} />
        <HeaderTicker />
        <SidebarNav />
        <motion.main
          style={{ scale, filter: blur }}
          className="flex-1 ml-0 md:ml-[200px] p-4 lg:p-8 relative origin-top z-10"
        >
          {children}
        </motion.main>
        <MobileNav />
        <CommandMenu />
        <LensMouseFollower />
      </div>
    </ReactLenis>
  );
}

function ParallaxMeshGrid({ scrollY }: { scrollY: any }) {
  const y = useTransform(scrollY, (v: number) => `${-v * 0.3}px`);
  return (
    <motion.div
      style={{ backgroundPositionY: y }}
      className="fixed inset-0 pointer-events-none z-0 dot-grid-bg opacity-40"
    />
  );
}

function LensMouseFollower() {
  const [pos, setPos] = useState({ x: -200, y: -200 });
  const { theme } = useTheme();

  useEffect(() => {
    const onMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <motion.div
      animate={{ x: pos.x - 200, y: pos.y - 200 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed top-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none z-0 hidden md:block"
      style={{
        background: theme === "dark"
          ? "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 55%)"
          : "radial-gradient(circle, rgba(79,70,229,0.04) 0%, transparent 55%)",
        mixBlendMode: theme === "dark" ? "screen" : "multiply",
      }}
    />
  );
}

function HeaderTicker() {
  const items = [
    "TCS · Hiring: Active · Safety: 85",
    "Infosys · Hiring: Moderate · Safety: 80",
    "Wipro · Hiring: Monitor · Safety: 78",
    "HCL · Hiring: Active · Safety: 82",
    "Accenture · Hiring: High · Safety: 88",
    "Tech Mahindra · Monitor · Safety: 75",
    "IBM · Hiring: Active · Safety: 86",
    "Cognizant · Hiring: Moderate · Safety: 79",
  ];
  const loop = useMemo(() => [...items, ...items, ...items], []);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border)] h-12 flex items-center overflow-hidden transition-colors duration-300">
      <div className="shrink-0 px-4 h-full flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--muted)] border-r border-[var(--border)]">
        <span className="live-dot" />
        <span>Intel Feed</span>
      </div>
      <div className="flex-1 overflow-hidden flex items-center h-full">
        <div className="ticker flex items-center text-[11px] font-mono text-[var(--muted)]">
          {loop.map((s, i) => (
            <span key={i} className="mx-8 whitespace-nowrap">
              <span className="text-[var(--primary)] mr-2">●</span>
              {s}
            </span>
          ))}
        </div>
      </div>
      <div className="shrink-0 px-4 text-[10px] text-[var(--muted)] hidden sm:flex border-l border-[var(--border)] h-full items-center gap-1.5 font-mono">
        <kbd className="bg-[var(--surface)] border border-[var(--border)] px-1.5 py-0.5 rounded text-[9px]">⌘K</kbd>
        <span>Command</span>
      </div>
    </header>
  );
}

function SidebarNav() {
  const loc = useLocation();
  const { role, logout } = useAuth();

  const NAV = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/companies", label: "Companies", icon: Compass },
    { to: "/skills", label: "Global Skill Matrix", icon: Network },
    { to: "/network", label: "Ecosystem Network", icon: Share2 },
    { to: "/hiring", label: "Global Hiring Process", icon: Activity },
    { to: "/innovx", label: "Global INNOVX", icon: Swords },
    { to: "/placement", label: "Placement Hub", icon: Briefcase },
  ];

  return (
    <nav
      className="fixed left-0 top-12 bottom-0 w-[200px] border-r border-[var(--border)] py-4 hidden md:flex flex-col z-30 transition-colors duration-300 bg-[var(--background)]/80 backdrop-blur-xl"
    >
      <Link 
        to="/profile"
        className="mx-4 mb-6 px-3 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg flex items-center gap-2.5 shadow-sm hover:border-[var(--primary)]/50 transition-all group"
      >
        <div className="w-5 h-5 bg-[var(--primary)] rounded flex items-center justify-center text-white font-black text-[9px] shrink-0 shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
          {role?.[0].toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)] group-hover:text-[var(--primary)] transition-colors">Access Node</div>
          <div className="text-xs font-bold text-[var(--foreground)] capitalize flex items-center justify-between">
            {role}
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>
      </Link>

      <div className="px-2 flex-1">
        <ul className="space-y-0.5">
          {NAV.map((item) => {
            const active = loc.pathname === item.to || (item.to !== "/" && loc.pathname.startsWith(item.to));
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={`flex items-center gap-3 px-2 py-2 text-xs font-semibold rounded-md transition-colors border-l-2 ${
                    active
                      ? "border-[var(--primary)] text-[var(--foreground)] bg-[var(--primary)]/10"
                      : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)]"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="px-2 mt-auto space-y-4">
        <div className="px-2">
          <ThemeToggle />
        </div>
        
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2 text-xs font-black uppercase tracking-widest text-[var(--muted)] hover:text-red-400 transition-colors group"
        >
          <LogOut className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Logout
        </button>
        
        <div className="pt-2 border-t border-[var(--border)]">
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="flex items-center gap-2 px-2 py-2 text-[9px] font-bold text-[var(--muted)]/40 hover:text-red-500 transition-colors w-full rounded-md uppercase tracking-tighter"
          >
            Emergency Reset
          </button>
        </div>
      </div>
    </nav>
  );
}

function MobileNav() {
  const loc = useLocation();
  const NAV = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/placement", label: "Hub", icon: Briefcase },
    { to: "/companies", label: "Vault", icon: Compass },
    { to: "/skills", label: "Skills", icon: Network },
    { to: "/network", label: "Network", icon: Share2 },
    { to: "/profile", label: "Profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[var(--background)]/80 backdrop-blur-xl border-t border-[var(--border)] flex items-center justify-around px-2 z-50 md:hidden pb-safe">
      {NAV.map((item) => {
        const active = loc.pathname === item.to || (item.to !== "/" && loc.pathname.startsWith(item.to));
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
              active 
                ? "text-[var(--primary)] scale-110" 
                : "text-[var(--muted)]"
            }`}
          >
            <Icon className={`h-5 w-5 ${active ? "animate-pulse" : ""}`} />
            <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
