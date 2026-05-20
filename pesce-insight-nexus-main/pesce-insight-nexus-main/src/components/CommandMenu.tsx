import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useRouter } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";
import { Search, LayoutDashboard, Compass, Swords, Shield, GraduationCap, LogOut, Zap, Building2, Briefcase, Cpu, User, Network, Share2 } from "lucide-react";
import { useCompanyIntelligence } from "@/hooks/useCompanyIntelligence";

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { role, login, logout } = useAuth();
  const { data: companies } = useCompanyIntelligence();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const go = (to: string) => {
    router.navigate({ to } as any);
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="cmdk-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-start justify-center pt-[15vh] px-4"
          onClick={() => setOpen(false)}
        >
          <motion.div
            key="cmdk-dialog"
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full max-w-md rounded-lg overflow-hidden shadow-2xl"
            style={{
              background: "color-mix(in srgb, var(--surface) 80%, transparent)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid var(--border)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Command label="Global Command Menu" shouldFilter>
              {/* Search input */}
              <div className="border-b border-[var(--border)] px-3 flex items-center gap-2">
                <Search className="h-4 w-4 text-[var(--muted)] shrink-0" />
                <Command.Input
                  autoFocus
                  placeholder="Search or jump to..."
                  className="w-full bg-transparent border-none py-4 text-sm outline-none text-[var(--foreground)] placeholder:text-[var(--muted)] font-medium"
                />
                <kbd
                  onClick={() => setOpen(false)}
                  className="cursor-pointer text-[10px] font-bold text-[var(--muted)] px-1.5 py-0.5 rounded border border-[var(--border)] bg-[var(--background)] font-mono tracking-widest hover:text-[var(--foreground)] transition-colors"
                >
                  ESC
                </kbd>
              </div>

              <Command.List className="max-h-[320px] overflow-y-auto p-2 scrollbar-thin" data-lenis-prevent>
                <Command.Empty className="py-8 text-center text-xs text-[var(--muted)] font-semibold uppercase tracking-widest">
                  No results found.
                </Command.Empty>

                <CommandGroup label="Navigate">
                  <CmdItem icon={LayoutDashboard} label="Dashboard"  onSelect={() => go("/")} />
                  <CmdItem icon={Compass}         label="Intelligence Vault" onSelect={() => go("/companies")} />
                  <CmdItem icon={User}            label="User Node (Profile)" onSelect={() => go("/profile")} />
                  <CmdItem icon={Network}         label="Global Skill Matrix" onSelect={() => go("/skills")} />
                  <CmdItem icon={Share2}          label="Ecosystem Network" onSelect={() => go("/network")} />
                  <CmdItem icon={Briefcase}       label="Hiring Intelligence" onSelect={() => go("/hiring")} />
                  <CmdItem icon={Swords}          label="InnovX Labs" onSelect={() => go("/innovx")} />
                </CommandGroup>

                <CommandGroup label="Access">
                  {role === "student" && (
                    <CmdItem icon={Shield} label="Switch to Admin" accent onSelect={() => { login("admin"); setOpen(false); }} />
                  )}
                  {role === "admin" && (
                    <CmdItem icon={GraduationCap} label="Switch to Student" accent onSelect={() => { login("student"); setOpen(false); }} />
                  )}
                  <CmdItem icon={LogOut} label="Sign Out" danger onSelect={() => { logout(); setOpen(false); }} />
                </CommandGroup>

                {companies && companies.length > 0 && (
                  <CommandGroup label="Intelligence Nodes">
                    {companies.map((c) => {
                      const id = c.company_id;
                      const isTrigger = id === 6001 || id === 6002;
                      return (
                        <CmdItem
                          key={id}
                          icon={isTrigger ? Zap : Building2}
                          label={isTrigger ? `[TRIGGER] ${c.short_name || c.name}` : (c.short_name || c.name || "Unknown")}
                          accent={isTrigger}
                          onSelect={() => go(`/companies/${id}`)}
                        />
                      );
                    })}
                  </CommandGroup>
                )}
              </Command.List>

              {/* Footer hint */}
              <div className="border-t border-[var(--border)] px-4 py-2 flex items-center gap-3 text-[10px] text-[var(--muted)] font-semibold uppercase tracking-widest">
                <span><kbd className="font-mono">↑↓</kbd> navigate</span>
                <span><kbd className="font-mono">↵</kbd> select</span>
                <span className="ml-auto flex items-center gap-1.5">
                  <span className="live-dot" />
                  {role} mode
                </span>
              </div>
            </Command>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CommandGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Command.Group
      heading={label}
      className="[&>[cmdk-group-heading]]:text-[10px] [&>[cmdk-group-heading]]:font-bold [&>[cmdk-group-heading]]:tracking-[0.15em] [&>[cmdk-group-heading]]:uppercase [&>[cmdk-group-heading]]:text-[var(--muted)] [&>[cmdk-group-heading]]:px-2 [&>[cmdk-group-heading]]:py-2 [&>[cmdk-group-heading]]:mb-0.5"
    >
      {children}
    </Command.Group>
  );
}

function CmdItem({
  icon: Icon, label, onSelect, accent, danger,
}: {
  icon: React.ElementType;
  label: string;
  onSelect: () => void;
  accent?: boolean;
  danger?: boolean;
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors
        aria-selected:bg-[var(--primary)]/10 aria-selected:text-[var(--primary)]
        hover:bg-[var(--border)]/60
        ${accent ? "text-[var(--primary)]" : danger ? "text-red-500" : "text-[var(--foreground)]"}`}
    >
      <Icon className="h-4 w-4 shrink-0 opacity-70" />
      {label}
    </Command.Item>
  );
}
