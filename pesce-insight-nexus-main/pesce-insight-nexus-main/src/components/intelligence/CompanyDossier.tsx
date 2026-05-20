import React from "react";
import * as Tabs from "@radix-ui/react-tabs";
import * as Accordion from "@radix-ui/react-accordion";
import { 
  Globe, TrendingUp, Cpu, Briefcase, ShieldCheck, 
  ChevronDown, CheckCircle2, LayoutDashboard, LineChart,
  HardHat, Landmark, FlaskConical, Users, Presentation,
  BadgeInfo, DollarSign
} from "lucide-react";
import { motion } from "framer-motion";
import type { PESCECompanySchema } from "@/types/intelligence";
import { formatDataExtended } from "@/utils/calculators";

const SP = { type: "spring", stiffness: 300, damping: 30 } as const;

interface DossierProps {
  company: PESCECompanySchema;
  role: string | null;
}

function SectionGrid({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-[1px] flex-1 bg-gradient-to-r from-border to-transparent" />
        <h3 className="label text-zinc-900 dark:text-zinc-50 whitespace-nowrap">{title}</h3>
        <div className="h-[1px] w-8 bg-border" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {children}
      </div>
    </div>
  );
}

function DataItem({ 
  label, 
  value, 
  wide, 
  role, 
  company, 
  field 
}: { 
  label: string; 
  value: any; 
  wide?: boolean; 
  role: string | null; 
  company: Partial<PESCECompanySchema>; 
  field?: keyof PESCECompanySchema 
}) {
  const { value: formatted, isInferred } = formatDataExtended(value, { field, company });
  const isAwaiting = String(formatted).includes("Analyzing Archive") || String(formatted).includes("—");

  return (
    <div className={`intel-card p-3 flex flex-col gap-1 transition-all duration-300 hover:border-gold/20 ${wide ? "sm:col-span-2" : ""}`}>
      <div className="flex items-center justify-between">
        <span className="label text-[9px] text-zinc-500 dark:text-zinc-400">{label}</span>
        {isInferred && <span className="text-[8px] font-black uppercase text-secondary/40 tracking-widest">Inferred</span>}
      </div>
      <div className={`text-[11px] font-bold tracking-tight ${isAwaiting ? "opacity-20 italic" : "text-zinc-900 dark:text-zinc-50"}`}>
        {formatted || "—"}
      </div>
    </div>
  );
}

export function CompanyDossier({ company, role }: DossierProps) {
  if (!company) return null;

  return (
    <Tabs.Root defaultValue="strategic" className="mt-8 w-full">
      <Tabs.List className="flex gap-1 border-b border-white/5 mb-8 overflow-x-auto no-scrollbar pb-1">
        {[
          { value: "strategic",   label: "Strategic",   icon: LayoutDashboard },
          { value: "operations",  label: "Operations",  icon: FlaskConical },
          { value: "economics",   label: "Economics",   icon: Landmark },
          { value: "personnel",   label: "Personnel",   icon: Users },
          { value: "ecosystem",   label: "Ecosystem",   icon: Globe },
        ].map((t) => (
          <Tabs.Trigger
            key={t.value}
            value={t.value}
            className="flex items-center gap-2 px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary transition-all whitespace-nowrap"
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      {/* 10 SECTIONS MAPPED INTO 5 THEMATIC TABS */}
      
      {/* TAB 1: Strategic Intelligence */}
      <Tabs.Content value="strategic" className="space-y-10 focus:outline-none">
        {/* SECTION 1: OVERVIEW */}
        <SectionGrid title="01. Intelligence Overview">
          <DataItem label="Canonical Name" value={company?.name} field="name" wide role={role} company={company} />
          <DataItem label="Classification" value={company?.category} field="category" role={role} company={company} />
          <DataItem label="Maturity Stage" value={company?.company_maturity} field="company_maturity" role={role} company={company} />
          <DataItem label="Nature of Company" value={company?.nature_of_company} field="nature_of_company" role={role} company={company} />
          <DataItem label="Vision Context" value={company?.vision_statement} field="vision_statement" wide role={role} company={company} />
          <DataItem label="Mission Clarity" value={company?.mission_statement} field="mission_statement" wide role={role} company={company} />
        </SectionGrid>

        {/* SECTION 2: MARKET POSITION */}
        <SectionGrid title="02. Market Position">
          <DataItem label="TAM Analysis" value={company?.tam} field="tam" role={role} company={company} />
          <DataItem label="SAM (Segment)" value={company?.sam} field="sam" role={role} company={company} />
          <DataItem label="Market Share %" value={company?.market_share_percentage} field="market_share_percentage" role={role} company={company} />
          <DataItem label="Exit Strategy" value={company?.exit_strategy_history} field="exit_strategy_history" role={role} company={company} />
          <DataItem label="Key Competitors" value={company?.key_competitors} field="key_competitors" wide role={role} company={company} />
          <DataItem label="Sales Motion" value={company?.sales_motion} field="sales_motion" role={role} company={company} />
        </SectionGrid>
      </Tabs.Content>

      {/* TAB 2: Operational Intelligence */}
      <Tabs.Content value="operations" className="space-y-10 focus:outline-none">
        {/* SECTION 8: TECHNOLOGY & TOOLS */}
        <SectionGrid title="08. Technology & Infrastructure">
          <DataItem label="Core Tech Stack" value={company?.tech_stack} field="tech_stack" wide role={role} company={company} />
          <DataItem label="AI/ML Adoption" value={company?.ai_ml_adoption_level} field="ai_ml_adoption_level" role={role} company={company} />
          <DataItem label="Tech Adoption Rating" value={company?.tech_adoption_rating} field="tech_adoption_rating" role={role} company={company} />
          <DataItem label="Automation Level" value={company?.automation_level} field="automation_level" role={role} company={company} />
          <DataItem label="Cybersecurity" value={company?.cybersecurity_posture} field="cybersecurity_posture" role={role} company={company} />
          <DataItem label="Tooling Access" value={company?.tools_access} field="tools_access" role={role} company={company} />
        </SectionGrid>

        {/* SECTION 4: GROWTH & PROJECTIONS */}
        <SectionGrid title="04. Growth & Innovation">
          <DataItem label="Innovation Roadmap" value={company?.innovation_roadmap} field="innovation_roadmap" wide role={role} company={company} />
          <DataItem label="Product Pipeline" value={company?.product_pipeline} field="product_pipeline" wide role={role} company={company} />
          <DataItem label="R&D Investment" value={company?.r_and_d_investment} field="r_and_d_investment" role={role} company={company} />
          <DataItem label="Future Projections" value={company?.future_projections} field="future_projections" role={role} company={company} />
        </SectionGrid>
      </Tabs.Content>

      {/* TAB 3: Economics & Stability */}
      <Tabs.Content value="economics" className="space-y-10 focus:outline-none">
        {/* SECTION 7: FINANCIALS & STABILITY */}
        <SectionGrid title="07. Fiscal Intelligence">
          <DataItem label="Annual Revenue" value={company?.annual_revenue} field="annual_revenue" role={role} company={company} />
          <DataItem label="Burn Rate" value={company?.burn_rate} field="burn_rate" role={role} company={company} />
          <DataItem label="Runway (Months)" value={company?.runway_months} field="runway_months" role={role} company={company} />
          <DataItem label="Valuation" value={company?.valuation} field="valuation" role={role} company={company} />
          <DataItem label="YoY Growth Rate" value={company?.yoy_growth_rate} field="yoy_growth_rate" role={role} company={company} />
          <DataItem label="Profit Status" value={company?.profitability_status} field="profitability_status" role={role} company={company} />
        </SectionGrid>

        {/* SECTION 5: COMPENSATION & BENEFITS */}
        <SectionGrid title="05. Compensation Framework">
          <DataItem label="Fixed/Variable Split" value={company?.fixed_vs_variable_pay} field="fixed_vs_variable_pay" role={role} company={company} />
          <DataItem label="Bonus Predictability" value={company?.bonus_predictability} field="bonus_predictability" role={role} company={company} />
          <DataItem label="ESOPs / Incentives" value={company?.esops_incentives} field="esops_incentives" role={role} company={company} />
          <DataItem label="Family Insurance" value={company?.family_health_insurance} field="family_health_insurance" role={role} company={company} />
          <DataItem label="Lifestyle Benefits" value={company?.lifestyle_benefits} field="lifestyle_benefits" role={role} company={company} />
          <DataItem label="Relocation Support" value={company?.relocation_support} field="relocation_support" role={role} company={company} />
        </SectionGrid>
      </Tabs.Content>

      {/* TAB 4: Personnel & Culture */}
      <Tabs.Content value="personnel" className="space-y-10 focus:outline-none">
        {/* SECTION 3: CULTURE & WORK-LIFE */}
        <SectionGrid title="03. Cultural Density">
          <DataItem label="Culture Summary" value={company?.work_culture_summary} field="work_culture_summary" wide role={role} company={company} />
          <DataItem label="Psych. Safety" value={company?.psychological_safety} field="psychological_safety" role={role} company={company} />
          <DataItem label="Feedback Cycle" value={company?.feedback_culture} field="feedback_culture" role={role} company={company} />
          <DataItem label="Diversity Score" value={company?.diversity_inclusion_score} field="diversity_inclusion_score" role={role} company={company} />
          <DataItem label="Typical Hours" value={company?.typical_hours} field="typical_hours" role={role} company={company} />
          <DataItem label="Flexibility level" value={company?.flexibility_level} field="flexibility_level" role={role} company={company} />
        </SectionGrid>

        {/* SECTION 9: LEADERSHIP & BOARD */}
        <SectionGrid title="09. Governance & Leadership">
          <DataItem label="CEO Context" value={company?.ceo_name} field="ceo_name" role={role} company={company} />
          <DataItem label="Key Business Leaders" value={company?.key_leaders} field="key_leaders" wide role={role} company={company} />
          <DataItem label="Board / Advisors" value={company?.board_members} field="board_members" wide role={role} company={company} />
          <DataItem label="Decision Maker Access" value={company?.decision_maker_access} field="decision_maker_access" role={role} company={company} />
        </SectionGrid>
      </Tabs.Content>

      {/* TAB 5: Ecosystem & Digital */}
      <Tabs.Content value="ecosystem" className="space-y-10 focus:outline-none">
        {/* SECTION 6: LOGISTICS & INFRASTRUCTURE */}
        <SectionGrid title="06. Logistics & Office">
          <DataItem label="Headquarters" value={company?.headquarters_address} field="headquarters_address" wide role={role} company={company} />
          <DataItem label="Location Centrality" value={company?.location_centrality} field="location_centrality" role={role} company={company} />
          <DataItem label="Airport Commute" value={company?.airport_commute_time} field="airport_commute_time" role={role} company={company} />
          <DataItem label="Infrastructure Safety" value={company?.infrastructure_safety} field="infrastructure_safety" role={role} company={company} />
        </SectionGrid>

        {/* SECTION 10: BRAND & DIGITAL */}
        <SectionGrid title="10. Brand & External Sentiment">
          <DataItem label="Brand Value" value={company?.brand_value} field="brand_value" role={role} company={company} />
          <DataItem label="Glassdoor Rating" value={company?.glassdoor_rating} field="glassdoor_rating" role={role} company={company} />
          <DataItem label="Website Quality" value={company?.website_quality} field="website_quality" role={role} company={company} />
          <DataItem label="Recent News" value={company?.recent_news} field="recent_news" wide role={role} company={company} />
        </SectionGrid>
      </Tabs.Content>
    </Tabs.Root>
  );
}
