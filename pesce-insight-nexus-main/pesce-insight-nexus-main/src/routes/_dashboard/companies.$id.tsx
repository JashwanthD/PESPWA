import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useCompanyData } from "@/hooks/useCompanyData";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Building2, Globe, Calendar, Users, 
  BrainCircuit, Workflow, Rocket, Shield, 
  ChevronRight, Database, Code, Briefcase, TrendingUp, 
  Share2, Target, Linkedin, Twitter, ExternalLink, 
  Mail, Phone, MapPin, Gauge, Heart, AlertTriangle, 
  Zap, Info, Medal, Trophy
} from "lucide-react";
import { ensureAbsoluteUrl } from "@/utils/calculators";
import * as Tabs from "@radix-ui/react-tabs";
import { useProfileSync } from "@/hooks/useProfileSync";
import { CompanyLogo } from "@/components/CompanyLogo";

export const Route = createFileRoute("/_dashboard/companies/$id")({
  component: CompanyDetail,
});

function CompanyDetail() {
  const { id } = useParams({ from: "/_dashboard/companies/$id" });
  const { getCompanyById, isLoading } = useCompanyData();
  const company = getCompanyById(id);
  const [activeTab, setActiveTab] = useState("overview");
  const { calculateMatch } = useProfileSync();

  const matchScore = useMemo(() => company ? calculateMatch(company) : 0, [company, calculateMatch]);

  if (isLoading || !company) {
    return (
      <div className="max-w-7xl mx-auto py-6 space-y-10 animate-pulse">
        {/* Skeleton Breadcrumbs */}
        <div className="h-4 w-48 bg-zinc-800 rounded-md" />
        
        {/* Skeleton Header Card */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-[2.5rem] p-8 lg:p-12 space-y-6">
          <div className="flex flex-col lg:flex-row gap-10 items-start">
            <div className="h-32 w-32 bg-zinc-850 rounded-3xl shrink-0" />
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-5 w-24 bg-zinc-800 rounded-full" />
                <div className="h-5 w-32 bg-zinc-850 rounded-full" />
              </div>
              <div className="h-10 w-2/3 bg-zinc-850 rounded-xl" />
              <div className="h-4 w-1/3 bg-zinc-800 rounded-md" />
            </div>
          </div>
          <div className="pt-6 border-t border-zinc-800 flex flex-col items-center justify-center py-12 gap-3 text-center">
            <div className="h-8 w-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mb-2" />
            <h3 className="text-sm font-black text-zinc-300 uppercase tracking-widest">Company Profile Syncing...</h3>
            <p className="text-xs text-zinc-500 max-w-sm uppercase tracking-wider">Retrieving decision-grade data and establishing realtime pipeline connections</p>
          </div>
        </div>
      </div>
    );
  }

  const socials = [
    { icon: Linkedin, label: "LinkedIn", url: company.linkedin_url },
    { icon: Twitter, label: "Twitter", url: company.twitter_handle ? `https://twitter.com/${company.twitter_handle.replace('@', '')}` : null },
    { icon: ExternalLink, label: "Website", url: company.website_url },
  ].filter(s => s.url);

  return (
    <div className="max-w-7xl mx-auto py-6 space-y-10">
      {/* 1. Navigation Breadcrumb */}
      <nav className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
        <Link to="/companies" className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
          <ArrowLeft className="h-3.5 w-3.5" /> Intelligence Vault
        </Link>
        <span className="text-[var(--border)]">/</span>
        <span className="text-[var(--primary)] text-[10px] font-black uppercase tracking-widest">{company.name}</span>
      </nav>

      {/* 2. Elite Header */}
      <header className="bg-[var(--surface)] border border-[var(--border)] rounded-[2.5rem] p-8 lg:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-indigo-500/[0.03] to-transparent pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row gap-10 relative z-10">
          <CompanyLogo 
            name={company.name || "?"} 
            logoUrl={company.logo_url || undefined}
            domain={company.website_url || undefined} 
            className="h-32 w-32 shrink-0 rounded-3xl shadow-2xl p-4 group-hover:scale-105 transition-transform duration-500" 
          />

          <div className="flex-1 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 bg-indigo-500/5 px-2.5 py-1 rounded-full border border-indigo-500/10">
                  {company.category || "Enterprise"}
                </span>
                <div className="flex items-center gap-1.5 text-[10px] font-black text-amber-500">
                  <Zap className="h-3 w-3" /> {matchScore}% Skill Match
                </div>
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-[var(--foreground)] uppercase tracking-tighter leading-none">
                {company.name}
              </h1>
              <p className="text-sm font-bold text-[var(--muted)] uppercase tracking-widest opacity-60">
                {company.short_name || company.name}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
              <MetaItem icon={Users} label={`${company.employee_size || "N/A"} employees`} color="text-indigo-400" />
              <MetaItem icon={TrendingUp} label={`${company.yoy_growth_rate || "Stable"} YoY Growth`} color="text-emerald-400" />
              <MetaItem icon={MapPin} label={company.headquarters_address || "TBD"} color="text-zinc-400" />
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              {socials.map((s, i) => (
                <a 
                  key={i} 
                  href={ensureAbsoluteUrl(s.url)!} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-2.5 px-5 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-indigo-500 hover:text-indigo-400 transition-all shadow-sm"
                >
                  <s.icon className="h-3.5 w-3.5" /> {s.label}
                </a>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:w-64">
            <QuickLink to={`/companies/${id}/process`} icon={Trophy} label="Hiring Rounds" variant="primary" />
            <QuickLink to={`/companies/${id}/skills`} icon={BrainCircuit} label="Hiring Skills" />
            <QuickLink to={`/companies/${id}/innovx`} icon={Rocket} label="InnovX Intelligence" />
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-[var(--border)] flex flex-wrap gap-8 items-start">
          <div className="space-y-1">
            <div className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)] mb-3">Contact Information</div>
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--foreground)] hover:text-indigo-400 transition-colors">
              <Mail className="h-3.5 w-3.5" /> <a href={`mailto:${company.primary_contact_email}`}>{company.primary_contact_email || "contact@vault.node"}</a>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col items-center space-y-4">
            {company.operating_countries && (
              <div className="space-y-1 text-center">
                <div className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)] mb-2">Operating Countries</div>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {company.operating_countries.split(',').map((c, i) => (
                    <span key={i} className="px-3 py-1 bg-[var(--background)] border border-[var(--border)] rounded-full text-[10px] font-bold text-zinc-300">{c.trim()}</span>
                  ))}
                </div>
              </div>
            )}
            {company.office_locations && (
              <div className="space-y-1 text-center">
                <div className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)] mb-2">Office Locations</div>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {company.office_locations.split(',').map((c, i) => (
                    <span key={i} className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-bold text-indigo-300">{c.trim()}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <div className="overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          <Tabs.List className="flex gap-2 p-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-fit backdrop-blur-xl">
            <TabTrigger value="overview" icon={Info} label="Overview" />
            <TabTrigger value="business" icon={Briefcase} label="Business & Market" />
            <TabTrigger value="leadership" icon={Medal} label="Leadership" />
            <TabTrigger value="financials" icon={TrendingUp} label="Financials" />
            <TabTrigger value="tech" icon={Code} label="Technology" />
            <TabTrigger value="culture" icon={Heart} label="Culture & Work Life" />
            <TabTrigger value="risk" icon={AlertTriangle} label="Risk & ESG" />
          </Tabs.List>
        </div>

        <AnimatePresence mode="wait">
          <Tabs.Content value="overview" key="overview" className="outline-none">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <DossierCard title="About the Company" icon={Info}>
                <p className="text-sm leading-relaxed text-[var(--foreground)]/80 font-medium">
                  {company.overview_text || "Decrypting foundational company intelligence..."}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Vision Statement</h4>
                    <p className="text-xs text-[var(--muted)] leading-relaxed italic">"{company.vision_statement || "To be the standard of intelligence nodes."}"</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Mission Statement</h4>
                    <p className="text-xs text-[var(--muted)] leading-relaxed italic">"{company.mission_statement || "Empowering placement ecosystems through data."}"</p>
                  </div>
                </div>
              </DossierCard>
            </motion.div>
          </Tabs.Content>

          <Tabs.Content value="business" key="business" className="outline-none">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="md:col-span-4 lg:col-span-4 space-y-6">
                <DossierCard title="Market Overview" icon={Globe}>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">TAM</h4>
                      <p className="text-sm font-bold text-[var(--foreground)]">{company.tam || "—"}</p>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">SAM</h4>
                      <p className="text-sm font-bold text-[var(--foreground)]">{company.sam || "—"}</p>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">SOM</h4>
                      <p className="text-sm font-bold text-[var(--foreground)]">{company.som || "—"}</p>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Market Share</h4>
                      <p className="text-sm font-bold text-[var(--foreground)]">{company.market_share_percentage || "—"}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Focus Sectors</h4>
                    <div className="flex flex-wrap gap-2">
                      {(company.focus_sectors || "").split(',').filter(Boolean).map((sector, i) => (
                        <span key={i} className="px-3 py-1.5 bg-[var(--background)] border border-[var(--border)] rounded-full text-xs font-bold text-zinc-300">{sector.trim()}</span>
                      ))}
                    </div>
                  </div>
                </DossierCard>
              </div>

              <div className="md:col-span-4 lg:col-span-4">
                <DossierCard title="Competitive Landscape" icon={Trophy}>
                  <div className="space-y-8">
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]">Competitive Advantages</h4>
                      <div className="flex flex-wrap gap-2">
                        {(company.competitive_advantages || "").split(',').filter(Boolean).map((adv, i) => (
                          <span key={i} className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-full text-xs font-bold">{adv.trim()}</span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]">Key Competitors</h4>
                      <div className="flex flex-wrap gap-2">
                        {(company.key_competitors || "").split(',').filter(Boolean).map((comp, i) => (
                          <span key={i} className="px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-full text-xs font-bold text-zinc-300">{comp.trim()}</span>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-[var(--border)]">
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Weaknesses</h4>
                        <div className="flex flex-wrap gap-2">
                          {(company.weaknesses_gaps || "").split(',').filter(Boolean).map((w, i) => (
                            <span key={i} className="px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-full text-xs font-bold text-[var(--muted)]">{w.trim()}</span>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Key Challenges</h4>
                        <div className="flex flex-wrap gap-2">
                          {(company.key_challenges_needs || "").split(',').filter(Boolean).map((c, i) => (
                            <span key={i} className="px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-full text-xs font-bold text-[var(--muted)]">{c.trim()}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </DossierCard>
              </div>
            </motion.div>
          </Tabs.Content>

          <Tabs.Content value="leadership" key="leadership" className="outline-none">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <DossierCard title="Executive Leadership" icon={Medal}>
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-[var(--background)] border border-[var(--border)] rounded-2xl">
                    <div className="h-12 w-12 rounded-full bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-lg font-black text-[var(--foreground)]">
                      {company.ceo_name?.[0] || "C"}
                    </div>
                    <div>
                      <div className="text-[9px] font-black uppercase tracking-widest text-indigo-400">Chief Executive Officer</div>
                      <div className="text-sm font-bold text-[var(--foreground)]">{company.ceo_name || "Confidential Node"}</div>
                    </div>
                  </div>
                  <p className="text-xs text-[var(--foreground)]/80 leading-relaxed">{company.key_leaders || "Retrieving board data..."}</p>
                </div>
              </DossierCard>
              <DossierCard title="Decision Pathways" icon={Share2}>
                <div className="space-y-4">
                  <PulseMetric label="Decision Maker Access" value={company.decision_maker_access} level="neutral" />
                  <PulseMetric label="Warm Intro" value={company.warm_intro_pathways} level="good" />
                </div>
              </DossierCard>
            </motion.div>
          </Tabs.Content>

          <Tabs.Content value="financials" key="financials" className="outline-none">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="Annual Revenue" value={company.annual_revenue || "—"} subtitle="Intelligence" />
              <StatCard title="Valuation" value={company.valuation || "—"} subtitle="Market Cap" />
              <StatCard title="Runway" value={company.runway_months || "—"} subtitle="Autonomy" />
              <div className="md:col-span-3">
                <DossierCard title="Funding Profile" icon={TrendingUp}>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Investors</h4>
                      <p className="text-xs text-[var(--foreground)]">{company.key_investors || "Proprietary"}</p>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Recent Rounds</h4>
                      <p className="text-xs text-[var(--foreground)]">{company.recent_funding_rounds || "Stable"}</p>
                    </div>
                  </div>
                </DossierCard>
              </div>
            </motion.div>
          </Tabs.Content>

          <Tabs.Content value="tech" key="tech" className="outline-none">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <DossierCard title="Engineering Stack" icon={Code}>
                <div className="flex flex-wrap gap-2">
                  {(company.tech_stack || "Node.js,React").split(',').map((t, i) => (
                    <span key={i} className="px-3 py-1 bg-[var(--background)] border border-[var(--border)] rounded-full text-[10px] font-bold text-zinc-300">{t.trim()}</span>
                  ))}
                </div>
              </DossierCard>
              <DossierCard title="R&D Profile" icon={Database}>
                <PulseMetric label="AI Adoption" value={company.ai_ml_adoption_level} level="high" />
                <PulseMetric label="IP Portfolio" value={company.intellectual_property} level="good" />
              </DossierCard>
            </motion.div>
          </Tabs.Content>

          <Tabs.Content value="culture" key="culture" className="outline-none">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <DossierCard title="Sentiment" icon={Heart}>
                <div className="text-center p-6 bg-[var(--background)] rounded-2xl border border-[var(--border)]">
                  <div className="text-4xl font-black text-indigo-400">{company.glassdoor_rating || "4.2"}</div>
                  <div className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)] mt-2">Glassdoor Rating</div>
                </div>
              </DossierCard>
              <DossierCard title="Work-Life" icon={Calendar}>
                <PulseMetric label="Typical Hours" value={company.typical_hours} level="neutral" />
                <PulseMetric label="Remote Policy" value={company.remote_policy_details} level="good" />
              </DossierCard>
            </motion.div>
          </Tabs.Content>

          <Tabs.Content value="risk" key="risk" className="outline-none">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <DossierCard title="Risk Dashboard" icon={AlertTriangle}>
                <PulseMetric label="Regulatory" value={company.regulatory_status} level="good" />
                <PulseMetric label="Geopolitical" value={company.geopolitical_risks} level="neutral" />
              </DossierCard>
              <DossierCard title="ESG Profile" icon={Globe}>
                <PulseMetric label="ESG Rating" value={company.esg_ratings} level="good" />
                <PulseMetric label="Carbon" value={company.carbon_footprint} level="neutral" />
              </DossierCard>
            </motion.div>
          </Tabs.Content>
        </AnimatePresence>
      </Tabs.Root>
    </div>
  );
}

function MetaItem({ icon: Icon, label, color }: { icon: any, label: string, color: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className={`h-8 w-8 rounded-xl bg-[var(--background)] border border-[var(--border)] flex items-center justify-center ${color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="text-xs font-bold text-[var(--foreground)] uppercase tracking-tight">{label}</div>
    </div>
  );
}

function QuickLink({ to, icon: Icon, label, variant = "default" }: { to: string, icon: any, label: string, variant?: "default" | "primary" }) {
  const styles = variant === "primary"
    ? "bg-indigo-650 dark:bg-indigo-600 border-indigo-700 dark:border-indigo-500 text-white hover:bg-indigo-750 dark:hover:bg-indigo-500/90"
    : "bg-[var(--surface)] border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--border)]/20";
    
  const iconColor = variant === "primary" ? "text-white/75 group-hover:text-white" : "text-[var(--muted)] group-hover:text-[var(--foreground)]";
  const textColor = variant === "primary" ? "text-white/90 group-hover:text-white" : "text-[var(--foreground)]/80 group-hover:text-[var(--foreground)]";
  const chevronColor = variant === "primary" ? "text-white/50 group-hover:text-white" : "text-[var(--muted)]/50 group-hover:text-[var(--foreground)]";

  return (
    <Link 
      to={to}
      className={`flex items-center justify-between gap-4 px-6 py-4 rounded-2xl group hover:scale-[1.02] transition-all border ${styles}`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`h-4 w-4 transition-colors ${iconColor}`} />
        <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${textColor}`}>{label}</span>
      </div>
      <ChevronRight className={`h-3.5 w-3.5 transition-colors ${chevronColor}`} />
    </Link>
  );
}

function TabTrigger({ value, icon: Icon, label }: { value: string, icon: any, label: string }) {
  return (
    <Tabs.Trigger
      value={value}
      className="flex items-center gap-2.5 px-6 py-3.5 text-[10px] font-black uppercase tracking-[0.15em] text-[var(--muted)] data-[state=active]:bg-[var(--background)] data-[state=active]:text-[var(--foreground)] data-[state=active]:border data-[state=active]:border-[var(--border)] rounded-xl transition-all whitespace-nowrap"
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </Tabs.Trigger>
  );
}

function DossierCard({ title, icon: Icon, children }: { title: string, icon: any, children: React.ReactNode }) {
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] p-8 rounded-[2rem] space-y-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-[var(--background)] border border-[var(--border)] flex items-center justify-center">
          <Icon className="h-4.5 w-4.5 text-[var(--foreground)] opacity-50" />
        </div>
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--foreground)]">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function StatCard({ title, value, subtitle }: { title: string, value: string, subtitle: string }) {
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] p-8 rounded-[2rem] space-y-2 shadow-sm">
      <div className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)]">{subtitle}</div>
      <div className="text-2xl font-black text-[var(--foreground)] uppercase tracking-tighter truncate">{value}</div>
      <div className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">{title}</div>
    </div>
  );
}

function PulseMetric({ label, value, level }: { label: string, value: any, level: 'good' | 'neutral' | 'high' }) {
  const colors = {
    good: 'bg-emerald-500',
    neutral: 'bg-zinc-500',
    high: 'bg-indigo-500'
  };
  return (
    <div className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-0">
      <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold text-[var(--foreground)] uppercase tracking-tight">{value || "N/A"}</span>
        <div className={`h-1.5 w-1.5 rounded-full ${colors[level]}`} />
      </div>
    </div>
  );
}
