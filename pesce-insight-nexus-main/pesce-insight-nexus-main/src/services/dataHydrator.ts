/**
 * MASTER PENTAGRAM HYDRATOR  —  src/services/dataHydrator.ts
 *
 * Sources:
 *  1. main_163.json       — 163 intelligence parameters per company (NDJSON)
 *  2. short_schema.json   — Canonical id/name/logo headers (NDJSON)
 *  3. hiring_rounds.json  — Hiring process details per company (NDJSON)
 *  4. innovx_data.json    — Innovation roadmap per company (NDJSON)
 *  5. job_roles.json      — Active job openings per company (NDJSON)
 *
 * Linkage Strategy:
 *  - short_schema provides the canonical company_id ↔ short_name bridge.
 *  - main_163, job_roles, innovx_data, hiring_rounds link by company_name
 *    (matched against short_schema.short_name, case-insensitive).
 *
 * Output: HydratedCompany[] — one record per company_id, ready to
 *         overlay on top of any Supabase row via company_id.
 */

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

import {
  triangulateStability,
  triangulateBurnout,
  triangulateGrowth,
  formatDataExtended,
} from "@/utils/calculators";
import { normalizeCompanyData } from "@/utils/normalizers";
import type { PESCECompanySchema } from "@/types/intelligence";

export interface InnovxData {
  innovx_master: Record<string, any>;
  industry_trends: any[];
  innovation_roadmap: any[];
  competitive_landscape: any[];
  strategic_pillars: any[];
  innovx_projects: any[];
}

export interface HydratedCompany {
  /** DB-compatible company_id from short_schema */
  company_id: number;
  /** Canonical short_name (e.g. "Wint Wealth") */
  short_name: string;

  // ---- 163-column intelligence fields (snake_case) ----
  name: string | null;
  logo_url: string | null;
  category: string | null;
  incorporation_year: string | null;
  overview_text: string | null;
  nature_of_company: string | null;
  headquarters_address: string | null;
  operating_countries: string | null;
  office_count: string | null;
  office_locations: string | null;
  employee_size: string | null;
  vision_statement: string | null;
  mission_statement: string | null;
  core_values: string | null;
  recent_news: string | null;
  website_url: string | null;
  linkedin_url: string | null;
  twitter_handle: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  primary_contact_email: string | null;
  primary_phone_number: string | null;
  regulatory_status: string | null;
  legal_issues: string | null;
  esg_ratings: string | null;
  supply_chain_dependencies: string | null;
  geopolitical_risks: string | null;
  macro_risks: string | null;
  carbon_footprint: string | null;
  ethical_sourcing: string | null;
  marketing_video_url: string | null;
  customer_testimonials: string | null;
  website_quality: string | null;
  website_rating: string | null;
  website_traffic_rank: string | null;
  social_media_followers: string | null;
  glassdoor_rating: string | null;
  indeed_rating: string | null;
  google_rating: string | null;
  awards_recognitions: string | null;
  brand_sentiment_score: string | null;
  event_participation: string | null;
  pain_points_addressed: string | null;
  focus_sectors: string | null;
  offerings_description: string | null;
  top_customers: string | null;
  core_value_proposition: string | null;
  unique_differentiators: string | null;
  competitive_advantages: string | null;
  weaknesses_gaps: string | null;
  key_challenges_needs: string | null;
  key_competitors: string | null;
  market_share_percentage: string | null;
  sales_motion: string | null;
  customer_concentration_risk: string | null;
  exit_strategy_history: string | null;
  benchmark_vs_peers: string | null;
  future_projections: string | null;
  strategic_priorities: string | null;
  industry_associations: string | null;
  case_studies: string | null;
  go_to_market_strategy: string | null;
  innovation_roadmap: string | null;
  product_pipeline: string | null;
  tam: string | null;
  sam: string | null;
  som: string | null;
  leave_policy: string | null;
  health_support: string | null;
  fixed_vs_variable_pay: string | null;
  bonus_predictability: string | null;
  esops_incentives: string | null;
  family_health_insurance: string | null;
  relocation_support: string | null;
  lifestyle_benefits: string | null;
  hiring_velocity: string | null;
  employee_turnover: string | null;
  avg_retention_tenure: string | null;
  diversity_metrics: string | null;
  work_culture_summary: string | null;
  manager_quality: string | null;
  psychological_safety: string | null;
  feedback_culture: string | null;
  diversity_inclusion_score: string | null;
  ethical_standards: string | null;
  burnout_risk: string | null;
  layoff_history: string | null;
  mission_clarity: string | null;
  sustainability_csr: string | null;
  crisis_behavior: string | null;
  annual_revenue: string | null;
  annual_profit: string | null;
  revenue_mix: string | null;
  valuation: string | null;
  yoy_growth_rate: string | null;
  profitability_status: string | null;
  key_investors: string | null;
  recent_funding_rounds: string | null;
  total_capital_raised: string | null;
  customer_acquisition_cost: string | null;
  customer_lifetime_value: string | null;
  cac_ltv_ratio: string | null;
  churn_rate: string | null;
  net_promoter_score: string | null;
  burn_rate: string | null;
  runway_months: string | null;
  burn_multiplier: string | null;
  remote_policy_details: string | null;
  typical_hours: string | null;
  overtime_expectations: string | null;
  weekend_work: string | null;
  flexibility_level: string | null;
  location_centrality: string | null;
  public_transport_access: string | null;
  cab_policy: string | null;
  airport_commute_time: string | null;
  office_zone_type: string | null;
  area_safety: string | null;
  safety_policies: string | null;
  infrastructure_safety: string | null;
  emergency_preparedness: string | null;
  ceo_name: string | null;
  ceo_linkedin_url: string | null;
  key_leaders: string | null;
  warm_intro_pathways: string | null;
  decision_maker_access: string | null;
  contact_person_name: string | null;
  contact_person_title: string | null;
  contact_person_email: string | null;
  contact_person_phone: string | null;
  board_members: string | null;
  training_spend: string | null;
  onboarding_quality: string | null;
  learning_culture: string | null;
  exposure_quality: string | null;
  mentorship_availability: string | null;
  internal_mobility: string | null;
  promotion_clarity: string | null;
  tools_access: string | null;
  role_clarity: string | null;
  early_ownership: string | null;
  work_impact: string | null;
  execution_thinking_balance: string | null;
  automation_level: string | null;
  cross_functional_exposure: string | null;
  company_maturity: string | null;
  brand_value: string | null;
  client_quality: string | null;
  exit_opportunities: string | null;
  skill_relevance: string | null;
  external_recognition: string | null;
  network_strength: string | null;
  global_exposure: string | null;
  technology_partners: string | null;
  intellectual_property: string | null;
  r_and_d_investment: string | null;
  ai_ml_adoption_level: string | null;
  tech_stack: string | null;
  cybersecurity_posture: string | null;
  partnership_ecosystem: string | null;
  tech_adoption_rating: string | null;

  // ---- Pentagram extensions ----
  /** job_roles.json → array of active job openings */
  activeRoles: any[];
  /** hiring_rounds.json → structured hiring process */
  hiringRounds: any[];
  /** innovx_data.json → full innovation intelligence block */
  innovx: InnovxData | null;

  // ---- Intelligence Engine Scores ----
  intelligence_score_stability: number | null;
  intelligence_score_burnout: "CRITICAL" | "MODERATE" | "HEALTHY" | null;
  intelligence_score_growth: number | null;
  inferred_fields: string[];

  // ---- Skill Matrix (Core 25) ----
  coding: string | null;
  dsa: string | null;
  oop: string | null;
  aptitude: string | null;
  communication: string | null;
  ai_native: string | null;
  devops: string | null;
  sql: string | null;
  software_eng: string | null;
  system_design: string | null;
  networking: string | null;
  os: string | null;
}

// ─────────────────────────────────────────────────────────────
// NDJSON parser — handles files with multiple root-level objects
// (i.e. concatenated JSON objects NOT wrapped in an array).
// ─────────────────────────────────────────────────────────────
function parseNDJSON(text: string): any[] {
  const results: any[] = [];
  const trimmed = text.trim();

  // Fast path: valid JSON array
  if (trimmed.startsWith("[")) {
    try {
      return JSON.parse(trimmed);
    } catch {
      // fall through
    }
  }

  // Streaming depth-counting split for NDJSON
  let depth = 0;
  let start = -1;
  let inString = false;
  let escape = false;

  for (let i = 0; i < trimmed.length; i++) {
    const ch = trimmed[i];

    if (escape) {
      escape = false;
      continue;
    }
    if (ch === "\\") {
      escape = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    if (ch === "{") {
      if (depth === 0) start = i;
      depth++;
    } else if (ch === "}") {
      depth--;
      if (depth === 0 && start !== -1) {
        try {
          results.push(JSON.parse(trimmed.slice(start, i + 1)));
        } catch (e) {
          console.warn("[Hydrator] Failed to parse NDJSON object:", e);
        }
        start = -1;
      }
    }
  }

  return results;
}

// ─────────────────────────────────────────────────────────────
// Key remapping — main_163.json uses human-readable keys.
// Map them to our snake_case schema.
// ─────────────────────────────────────────────────────────────
const KEY_MAP: Record<string, string> = {
  "Company Name": "name",
  "Short Name": "short_name",
  "Logo": "logo_url",
  "Category": "category",
  "Year of Incorporation": "incorporation_year",
  "Overview of the Company": "overview_text",
  "Nature of Company": "nature_of_company",
  "Company Headquarters": "headquarters_address",
  "Countries Operating In": "operating_countries",
  "Number of Offices": "office_count",
  "Office Locations": "office_locations",
  "Employee Size": "employee_size",
  "Vision": "vision_statement",
  "Mission": "mission_statement",
  "Values": "core_values",
  "Recent News": "recent_news",
  "Website URL": "website_url",
  "LinkedIn Profile URL": "linkedin_url",
  "Twitter (X) Handle": "twitter_handle",
  "Facebook Page URL": "facebook_url",
  "Instagram Page URL": "instagram_url",
  "Company Contact Email": "primary_contact_email",
  "Company Phone Number": "primary_phone_number",
  "Regulatory & Compliance Status": "regulatory_status",
  "Legal Issues / Controversies": "legal_issues",
  "ESG Practices or Ratings": "esg_ratings",
  "Supply Chain Dependencies": "supply_chain_dependencies",
  "Geopolitical Risks": "geopolitical_risks",
  "Macro Risks": "macro_risks",
  "Carbon Footprint/Env Impact": "carbon_footprint",
  "Ethical Sourcing Practices": "ethical_sourcing",
  "Marketing Videos": "marketing_video_url",
  "Customer testimonial": "customer_testimonials",
  "Website Quality": "website_quality",
  "Website Rating": "website_rating",
  "Website Traffic Rank": "website_traffic_rank",
  "Social Media Followers": "social_media_followers",
  "Glassdoor Rating": "glassdoor_rating",
  "Indeed Rating": "indeed_rating",
  "Google Reviews Rating": "google_rating",
  "Awards & Recognitions": "awards_recognitions",
  "Brand Sentiment Score": "brand_sentiment_score",
  "Event Participation": "event_participation",
  "Pain Points Addressed": "pain_points_addressed",
  "Focus Sectors / Industries": "focus_sectors",
  "Services / Products": "offerings_description",
  "Top Customers": "top_customers",
  "Core Value Proposition": "core_value_proposition",
  "Unique Differentiators": "unique_differentiators",
  "Competitive Advantages": "competitive_advantages",
  "Weaknesses / Gaps": "weaknesses_gaps",
  "Key Challenges": "key_challenges_needs",
  "Key Competitors": "key_competitors",
  "Market Share (%)": "market_share_percentage",
  "Sales Motion": "sales_motion",
  "Customer Concentration Risk": "customer_concentration_risk",
  "Exit Strategy": "exit_strategy_history",
  "Benchmark vs. Peers": "benchmark_vs_peers",
  "Future Projections": "future_projections",
  "Strategic Priorities": "strategic_priorities",
  "Industry Associations": "industry_associations",
  "Case Studies / Success": "case_studies",
  "GTM Strategy": "go_to_market_strategy",
  "Innovation Roadmap": "innovation_roadmap",
  "Product Pipeline": "product_pipeline",
  "TAM": "tam",
  "SAM": "sam",
  "SOM": "som",
  "Leave policy": "leave_policy",
  "Health support": "health_support",
  "Fixed vs variable pay": "fixed_vs_variable_pay",
  "Bonus predictability": "bonus_predictability",
  "ESOPs / Incentives": "esops_incentives",
  "Family health insurance": "family_health_insurance",
  "Relocation support": "relocation_support",
  "Lifestyle/Wellness": "lifestyle_benefits",
  "Hiring Velocity": "hiring_velocity",
  "Turnover": "employee_turnover",
  "Average Retention Tenure": "avg_retention_tenure",
  "Diversity Metrics": "diversity_metrics",
  "Work culture": "work_culture_summary",
  "Manager quality": "manager_quality",
  "Psychological safety": "psychological_safety",
  "Feedback culture": "feedback_culture",
  "Diversity & inclusion": "diversity_inclusion_score",
  "Ethical standards": "ethical_standards",
  "Burnout risk": "burnout_risk",
  "Layoff history": "layoff_history",
  "Mission clarity": "mission_clarity",
  "Sustainability/CSR": "sustainability_csr",
  "Crisis behavior": "crisis_behavior",
  "Annual Revenues": "annual_revenue",
  "Annual Profits": "annual_profit",
  "Revenue Mix": "revenue_mix",
  "Valuation": "valuation",
  "Growth Rate": "yoy_growth_rate",
  "Profitability Status": "profitability_status",
  "Key Investors / Backers": "key_investors",
  "Funding Rounds": "recent_funding_rounds",
  "Total Capital Raised": "total_capital_raised",
  "CAC": "customer_acquisition_cost",
  "CLV": "customer_lifetime_value",
  "CAC:LTV Ratio": "cac_ltv_ratio",
  "Churn Rate": "churn_rate",
  "Net Promoter Score (NPS)": "net_promoter_score",
  "Burn Rate": "burn_rate",
  "Runway": "runway_months",
  "Burn Multiplier": "burn_multiplier",
  "Remote Work Policy": "remote_policy_details",
  "Typical working hours": "typical_hours",
  "Overtime expectations": "overtime_expectations",
  "Weekend work": "weekend_work",
  "Remote/Hybrid Flexibility": "flexibility_level",
  "Central vs peripheral": "location_centrality",
  "Public transport access": "public_transport_access",
  "Cab Policy": "cab_policy",
  "Commute time from airport": "airport_commute_time",
  "Office zone type": "office_zone_type",
  "Area safety": "area_safety",
  "Company safety policies": "safety_policies",
  "Office infrastructure safety": "infrastructure_safety",
  "Emergency preparedness": "emergency_preparedness",
  "CEO Name": "ceo_name",
  "CEO LinkedIn URL": "ceo_linkedin_url",
  "Key Business Leaders": "key_leaders",
  "Warm Intro Pathways": "warm_intro_pathways",
  "Decision Accessibility": "decision_maker_access",
  "Primary Contact Name": "contact_person_name",
  "Primary Contact Title": "contact_person_title",
  "Primary Contact Email": "contact_person_email",
  "Primary Contact Phone": "contact_person_phone",
  "Board / Advisors": "board_members",
  "Training/Development Spend": "training_spend",
  "Onboarding Quality": "onboarding_quality",
  "Learning culture": "learning_culture",
  "Exposure quality": "exposure_quality",
  "Mentorship availability": "mentorship_availability",
  "Internal mobility": "internal_mobility",
  "Promotion clarity": "promotion_clarity",
  "Tools / Tech Access": "tools_access",
  "Role clarity": "role_clarity",
  "Early ownership": "early_ownership",
  "Work impact": "work_impact",
  "Execution vs Thinking": "execution_thinking_balance",
  "Automation level": "automation_level",
  "Cross-functional exposure": "cross_functional_exposure",
  "Company maturity": "company_maturity",
  "Brand value": "brand_value",
  "Client quality": "client_quality",
  "Exit opportunities": "exit_opportunities",
  "Skill relevance": "skill_relevance",
  "External recognition": "external_recognition",
  "Network strength": "network_strength",
  "Global exposure": "global_exposure",
  "Technology Partners": "technology_partners",
  "Intellectual Property": "intellectual_property",
  "R&D Investment": "r_and_d_investment",
  "AI/ML Adoption Level": "ai_ml_adoption_level",
  "Tech Stack / Tools": "tech_stack",
  "Cybersecurity Posture": "cybersecurity_posture",
  "Partnership Ecosystem": "partnership_ecosystem",
  "Tech Adoption Rating": "tech_adoption_rating",
};

function remapKeys(raw: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(raw)) {
    const mapped = KEY_MAP[k];
    if (mapped) {
      out[mapped] = v;
    } else if (k === "company_id") {
      out.company_id = v; // preserve the ID
    }
    // Silently drop unmapped keys (duplicates like "Layoff history (dup)")
  }
  return out;
}

// ─────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────
// URL Resolution — fixes ERR_INVALID_URL in SSR/Node environments
// ─────────────────────────────────────────────────────────────
function getAbsoluteUrl(path: string): string {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:8080";
  return baseUrl + path;
}

// Fetch helper
// ─────────────────────────────────────────────────────────────
async function fetchNDJSON(path: string): Promise<any[]> {
  try {
    // 1. SSR GUARD: Prevent fetching during server-side execution
    if (typeof window === "undefined") {
      console.log(`[Hydrator] SSR Context: Skipping fetch for ${path}`);
      return [];
    }

    // 2. PATH RESOLUTION: Ensure we use a fully qualified URL
    const baseUrl = window.location.origin;
    const url = path.startsWith("http") ? path : `${baseUrl}${path}`;
    
    console.log(`[Hydrator] 🛰 Fetching: ${url}`);
    
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
    
    const text = await res.text();
    // Support both NDJSON (line-separated) and standard JSON arrays
    const trimmed = text.trim();
    if (trimmed.startsWith("[")) {
      return JSON.parse(trimmed);
    }
    return trimmed.split("\n").filter(Boolean).map(line => {
      try {
        return JSON.parse(line);
      } catch (e) {
        console.warn("[Hydrator] Malformed line skipped:", line.slice(0, 50));
        return null;
      }
    }).filter(Boolean);
  } catch (error) {
    console.error(`[Hydrator] ❌ Failed to fetch ${path}:`, error);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────
// Normalise company_name for fuzzy matching
// ─────────────────────────────────────────────────────────────
function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// ─────────────────────────────────────────────────────────────
// Hydrator state & Intelligence Vault
// ─────────────────────────────────────────────────────────────
interface IntelligenceVault {
  intelById: Map<number, Record<string, any>>;
  jobsByName: Map<string, any[]>;
  hiringByName: Map<string, any[]>;
  innovxByName: Map<string, InnovxData>;
  skillMatrixById: Map<number, Record<string, any>>;
  skillMatrixByName: Map<string, Record<string, any>>;
  nameToId: Map<string, number>;
}

let _cachedHydrated: Map<number, HydratedCompany> | null = null;
let _initPromise: Promise<Map<number, HydratedCompany>> | null = null;
let _hiringCorePromise: Promise<{ hiring: any[], schema: any[] }> | null = null;

let _vault: IntelligenceVault | null = null;

/**
 * High-speed fetch for Hiring portal core data.
 */
export async function getHiringCoreData() {
  if (_hiringCorePromise) return _hiringCorePromise;
  
  _hiringCorePromise = (async () => {
    const BASE = "/data/intelligence";
    const [schema, hiring] = await Promise.all([
      fetchNDJSON(`${BASE}/short_schema.json`),
      fetchNDJSON(`${BASE}/hiring_rounds.json`),
    ]);
    return { schema, hiring };
  })();
  
  return _hiringCorePromise;
}

/**
 * Initialize the Pentagram Hydrator.
 * Fetches all 5 JSON sources in parallel, deep-merges them by company_id,
 * and caches the result for instant subsequent reads.
 */
export async function initHydrator(): Promise<Map<number, HydratedCompany>> {
  if (_cachedHydrated) return _cachedHydrated;
  if (_initPromise) return _initPromise;

  _initPromise = (async () => {
    const BASE = "/data/intelligence";

    console.log("[Hydrator] 🚀 Prioritizing Core Hydration (Schema + Hiring)...");
    const { schema: schemaRows, hiring: hiringRows } = await getHiringCoreData();

    console.log("[Hydrator] 📦 Synchronizing Intelligence Pentagram (Main, Hiring, InnovX, SkillSync, SkillMatrix)...");
    const [mainRows, innovxRows, jobRoleRows, skillMatrixRows] =
      await Promise.all([
        fetchNDJSON(`${BASE}/main_163.json`),
        fetchNDJSON(`${BASE}/innovx_data.json`),
        fetchNDJSON(`${BASE}/job_roles.json`), // Treated as Skill Sync source
        fetchNDJSON(`${BASE}/skill_matrix.json`),
      ]);

    console.log(
      `[Hydrator] ✅ Loaded — main163:${mainRows.length} schema:${schemaRows.length} hiring:${hiringRows.length} innovx:${innovxRows.length} jobRoles:${jobRoleRows.length}`
    );
    console.log(`[Hydrator] 🔗 Indexing: 25 Master Nodes from schema will be created even if intelligence data is sparse (${mainRows.length} found).`);
    console.log(`[Hydrator] 🚀 Modal Data Ready: Hiring(${hiringRows.length}), InnovX(${innovxRows.length})`);

    // ── Build bridge: short_name → company_id (from short_schema) ──
    const nameToId = new Map<string, number>();
    const idToSchema = new Map<number, Record<string, any>>();
    for (const row of schemaRows) {
      if (row.company_id != null) {
        idToSchema.set(row.company_id, row);
        if (row.short_name) nameToId.set(norm(row.short_name), row.company_id);
        if (row.name) nameToId.set(norm(row.name), row.company_id);
      }
    }

    // ── Index main_163 by company_id ──
    const intelByCompanyId = new Map<number, Record<string, any>>();
    for (const raw of mainRows) {
      const id = raw.company_id as number;
      if (id != null) {
        intelByCompanyId.set(id, remapKeys(raw));
      }
    }

    // ── Index job_roles by normalised company_name ──
    const jobsByName = new Map<string, any[]>();
    for (const row of jobRoleRows) {
      const key = norm(row.company_name ?? "");
      if (key) jobsByName.set(key, row.job_role_details ?? []);
    }

    // ── Index hiring_rounds by normalised company_name ──
    const hiringByName = new Map<string, any[]>();
    for (const row of hiringRows) {
      const key = norm(row.company_name ?? "");
      if (key) hiringByName.set(key, row.job_role_details ?? []);
    }

    // ── Index innovx by normalised company_name ──
    const innovxByName = new Map<string, InnovxData>();
    for (const row of innovxRows) {
      const companyName =
        row.innovx_master?.company_name ?? row.company_name ?? "";
      const key = norm(companyName);
      if (key) innovxByName.set(key, row as InnovxData);
    }

    // ── Index skill_matrix by company_id and name ──
    const skillMatrixById = new Map<number, Record<string, any>>();
    const skillMatrixByName = new Map<string, Record<string, any>>();
    for (const row of skillMatrixRows) {
      if (row.id != null) {
        skillMatrixById.set(row.id, row);
      }
      if (row.name) {
        skillMatrixByName.set(norm(row.name), row);
      }
    }

    // ── Commit to Vault for Deep Stitching ──
    _vault = {
      intelById: intelByCompanyId,
      jobsByName,
      hiringByName,
      innovxByName,
      skillMatrixById: skillMatrixById,
      skillMatrixByName: skillMatrixByName,
      nameToId,
    };

    // ── Helper: resolve company_id from any name string ──
    function resolveId(rawName: string): number | null {
      const key = norm(rawName);
      return nameToId.get(key) ?? null;
    }

    // ── Helper: fuzzy resolve a name against our nameToId map ──
    function fuzzyLookup<T>(map: Map<string, T>, rawName: string): T | undefined {
      const direct = map.get(norm(rawName));
      if (direct !== undefined) return direct;
      // Try resolving via the schema bridge (short_name variants)
      const cid = nameToId.get(norm(rawName));
      if (cid != null) {
        const schema = idToSchema.get(cid);
        if (schema?.short_name) return map.get(norm(schema.short_name));
      }
      return undefined;
    }

    // ── Build the final merged map ──
    const result = new Map<number, HydratedCompany>();
    
    // Union of all possible IDs
    const allIds = new Set<number>([
      ...idToSchema.keys(),
      ...intelByCompanyId.keys()
    ]);

    for (const cid of allIds) {
      const schema = idToSchema.get(cid) ?? {};
      const intel = intelByCompanyId.get(cid) ?? {};
      const shortName = schema.short_name ?? schema.name ?? "";

      const activeRoles =
        fuzzyLookup(jobsByName, shortName) ??
        fuzzyLookup(jobsByName, schema.name ?? "") ??
        [];

      const hiringDetails =
        fuzzyLookup(hiringByName, shortName) ??
        fuzzyLookup(hiringByName, schema.name ?? "") ??
        [];

      const innovx =
        fuzzyLookup(innovxByName, shortName) ??
        fuzzyLookup(innovxByName, schema.name ?? "") ??
        null;

      const skills = 
        skillMatrixById.get(cid) ?? 
        fuzzyLookup(skillMatrixByName, shortName) ??
        fuzzyLookup(skillMatrixByName, schema.name ?? "") ??
        {};

      // Deep merge: schema (canonical) > intel (163 params)
      const merged: HydratedCompany = {
        company_id: cid,
        short_name: shortName,
        name: schema.name ?? intel.name ?? null,
        logo_url: schema.logo_url ?? intel.logo_url ?? null,
        category: schema.category ?? intel.category ?? null,
        yoy_growth_rate: schema.yoy_growth_rate ?? intel.yoy_growth_rate ?? null,
        operating_countries: schema.operating_countries ?? intel.operating_countries ?? null,
        office_locations: schema.office_locations ?? intel.office_locations ?? null,
        employee_size: schema.employee_size ?? intel.employee_size ?? null,

        // 163-column fields from main_163
        incorporation_year: intel.incorporation_year ?? null,
        overview_text: intel.overview_text ?? null,
        nature_of_company: intel.nature_of_company ?? null,
        headquarters_address: intel.headquarters_address ?? null,
        office_count: intel.office_count ?? null,
        vision_statement: intel.vision_statement ?? null,
        mission_statement: intel.mission_statement ?? null,
        core_values: intel.core_values ?? null,
        recent_news: intel.recent_news ?? null,
        website_url: intel.website_url ?? null,
        linkedin_url: intel.linkedin_url ?? null,
        twitter_handle: intel.twitter_handle ?? null,
        facebook_url: intel.facebook_url ?? null,
        instagram_url: intel.instagram_url ?? null,
        primary_contact_email: intel.primary_contact_email ?? null,
        primary_phone_number: intel.primary_phone_number ?? null,
        regulatory_status: intel.regulatory_status ?? null,
        legal_issues: intel.legal_issues ?? null,
        esg_ratings: intel.esg_ratings ?? null,
        supply_chain_dependencies: intel.supply_chain_dependencies ?? null,
        geopolitical_risks: intel.geopolitical_risks ?? null,
        macro_risks: intel.macro_risks ?? null,
        carbon_footprint: intel.carbon_footprint ?? null,
        ethical_sourcing: intel.ethical_sourcing ?? null,
        marketing_video_url: intel.marketing_video_url ?? null,
        customer_testimonials: intel.customer_testimonials ?? null,
        website_quality: intel.website_quality ?? null,
        website_rating: intel.website_rating ?? null,
        website_traffic_rank: intel.website_traffic_rank ?? null,
        social_media_followers: intel.social_media_followers ?? null,
        glassdoor_rating: intel.glassdoor_rating ?? null,
        indeed_rating: intel.indeed_rating ?? null,
        google_rating: intel.google_rating ?? null,
        awards_recognitions: intel.awards_recognitions ?? null,
        brand_sentiment_score: intel.brand_sentiment_score ?? null,
        event_participation: intel.event_participation ?? null,
        pain_points_addressed: intel.pain_points_addressed ?? null,
        focus_sectors: intel.focus_sectors ?? null,
        offerings_description: intel.offerings_description ?? null,
        top_customers: intel.top_customers ?? null,
        core_value_proposition: intel.core_value_proposition ?? null,
        unique_differentiators: intel.unique_differentiators ?? null,
        competitive_advantages: intel.competitive_advantages ?? null,
        weaknesses_gaps: intel.weaknesses_gaps ?? null,
        key_challenges_needs: intel.key_challenges_needs ?? null,
        key_competitors: intel.key_competitors ?? null,
        market_share_percentage: intel.market_share_percentage ?? null,
        sales_motion: intel.sales_motion ?? null,
        customer_concentration_risk: intel.customer_concentration_risk ?? null,
        exit_strategy_history: intel.exit_strategy_history ?? null,
        benchmark_vs_peers: intel.benchmark_vs_peers ?? null,
        future_projections: intel.future_projections ?? null,
        strategic_priorities: intel.strategic_priorities ?? null,
        industry_associations: intel.industry_associations ?? null,
        case_studies: intel.case_studies ?? null,
        go_to_market_strategy: intel.go_to_market_strategy ?? null,
        innovation_roadmap: intel.innovation_roadmap ?? null,
        product_pipeline: intel.product_pipeline ?? null,
        tam: intel.tam ?? null,
        sam: intel.sam ?? null,
        som: intel.som ?? null,
        leave_policy: intel.leave_policy ?? null,
        health_support: intel.health_support ?? null,
        fixed_vs_variable_pay: intel.fixed_vs_variable_pay ?? null,
        bonus_predictability: intel.bonus_predictability ?? null,
        esops_incentives: intel.esops_incentives ?? null,
        family_health_insurance: intel.family_health_insurance ?? null,
        relocation_support: intel.relocation_support ?? null,
        lifestyle_benefits: intel.lifestyle_benefits ?? null,
        hiring_velocity: intel.hiring_velocity ?? null,
        employee_turnover: intel.employee_turnover ?? null,
        avg_retention_tenure: intel.avg_retention_tenure ?? null,
        diversity_metrics: intel.diversity_metrics ?? null,
        work_culture_summary: intel.work_culture_summary ?? null,
        manager_quality: intel.manager_quality ?? null,
        psychological_safety: intel.psychological_safety ?? null,
        feedback_culture: intel.feedback_culture ?? null,
        diversity_inclusion_score: intel.diversity_inclusion_score ?? null,
        ethical_standards: intel.ethical_standards ?? null,
        burnout_risk: intel.burnout_risk ?? null,
        layoff_history: intel.layoff_history ?? null,
        mission_clarity: intel.mission_clarity ?? null,
        sustainability_csr: intel.sustainability_csr ?? null,
        crisis_behavior: intel.crisis_behavior ?? null,
        annual_revenue: intel.annual_revenue ?? null,
        annual_profit: intel.annual_profit ?? null,
        revenue_mix: intel.revenue_mix ?? null,
        valuation: intel.valuation ?? null,
        profitability_status: intel.profitability_status ?? null,
        key_investors: intel.key_investors ?? null,
        recent_funding_rounds: intel.recent_funding_rounds ?? null,
        total_capital_raised: intel.total_capital_raised ?? null,
        customer_acquisition_cost: intel.customer_acquisition_cost ?? null,
        customer_lifetime_value: intel.customer_lifetime_value ?? null,
        cac_ltv_ratio: intel.cac_ltv_ratio ?? null,
        churn_rate: intel.churn_rate ?? null,
        net_promoter_score: intel.net_promoter_score ?? null,
        burn_rate: intel.burn_rate ?? null,
        runway_months: intel.runway_months ?? null,
        burn_multiplier: intel.burn_multiplier ?? null,
        remote_policy_details: intel.remote_policy_details ?? null,
        typical_hours: intel.typical_hours ?? null,
        overtime_expectations: intel.overtime_expectations ?? null,
        weekend_work: intel.weekend_work ?? null,
        flexibility_level: intel.flexibility_level ?? null,
        location_centrality: intel.location_centrality ?? null,
        public_transport_access: intel.public_transport_access ?? null,
        cab_policy: intel.cab_policy ?? null,
        airport_commute_time: intel.airport_commute_time ?? null,

        // Skill Matrix
        coding: skills.coding ?? null,
        dsa: skills.dsa ?? null,
        oop: skills.oop ?? null,
        aptitude: skills.aptitude ?? null,
        communication: skills.communication ?? null,
        ai_native: skills.ai_native ?? null,
        devops: skills.devops ?? null,
        sql: skills.sql ?? null,
        software_eng: skills.software_eng ?? null,
        system_design: skills.system_design ?? null,
        networking: skills.networking ?? null,
        os: skills.os ?? null,
        office_zone_type: intel.office_zone_type ?? null,
        area_safety: intel.area_safety ?? null,
        safety_policies: intel.safety_policies ?? null,
        infrastructure_safety: intel.infrastructure_safety ?? null,
        emergency_preparedness: intel.emergency_preparedness ?? null,
        ceo_name: intel.ceo_name ?? null,
        ceo_linkedin_url: intel.ceo_linkedin_url ?? null,
        key_leaders: intel.key_leaders ?? null,
        warm_intro_pathways: intel.warm_intro_pathways ?? null,
        decision_maker_access: intel.decision_maker_access ?? null,
        contact_person_name: intel.contact_person_name ?? null,
        contact_person_title: intel.contact_person_title ?? null,
        contact_person_email: intel.contact_person_email ?? null,
        contact_person_phone: intel.contact_person_phone ?? null,
        board_members: intel.board_members ?? null,
        training_spend: intel.training_spend ?? null,
        onboarding_quality: intel.onboarding_quality ?? null,
        learning_culture: intel.learning_culture ?? null,
        exposure_quality: intel.exposure_quality ?? null,
        mentorship_availability: intel.mentorship_availability ?? null,
        internal_mobility: intel.internal_mobility ?? null,
        promotion_clarity: intel.promotion_clarity ?? null,
        tools_access: intel.tools_access ?? null,
        role_clarity: intel.role_clarity ?? null,
        early_ownership: intel.early_ownership ?? null,
        work_impact: intel.work_impact ?? null,
        execution_thinking_balance: intel.execution_thinking_balance ?? null,
        automation_level: intel.automation_level ?? null,
        cross_functional_exposure: intel.cross_functional_exposure ?? null,
        company_maturity: intel.company_maturity ?? null,
        brand_value: intel.brand_value ?? null,
        client_quality: intel.client_quality ?? null,
        exit_opportunities: intel.exit_opportunities ?? null,
        skill_relevance: intel.skill_relevance ?? null,
        external_recognition: intel.external_recognition ?? null,
        network_strength: intel.network_strength ?? null,
        global_exposure: intel.global_exposure ?? null,
        technology_partners: intel.technology_partners ?? null,
        intellectual_property: intel.intellectual_property ?? null,
        r_and_d_investment: intel.r_and_d_investment ?? null,
        ai_ml_adoption_level: intel.ai_ml_adoption_level ?? null,
        tech_stack: intel.tech_stack ?? null,
        cybersecurity_posture: intel.cybersecurity_posture ?? null,
        partnership_ecosystem: intel.partnership_ecosystem ?? null,
        tech_adoption_rating: intel.tech_adoption_rating ?? null,

        // Pentagram extensions
        activeRoles,
        hiringRounds: hiringDetails,
        innovx,

        // Default intelligence values
        intelligence_score_stability: null,
        intelligence_score_burnout: null,
        intelligence_score_growth: null,
        inferred_fields: [],
      };

      // ---- ENRICHMENT STEP (Intelligence Engine) ----
      const stability = triangulateStability(merged);
      const burnout = triangulateBurnout(merged);
      const growth = triangulateGrowth(merged);

      // Detect inferred fields (Data Triangulation)
      const inferredFields: string[] = [];
      const FIELDS_TO_CHECK: (keyof PESCECompanySchema)[] = [
        "annual_revenue", "annual_profit", "burn_rate", "tech_stack", "training_spend"
      ];
      
      for (const field of FIELDS_TO_CHECK) {
        const val = (merged as any)[field];
        const res = formatDataExtended(val, { field: field as any, company: merged as any });
        if (res.isInferred) {
          inferredFields.push(field as string);
        }
      }

      merged.intelligence_score_stability = stability;
      merged.intelligence_score_burnout = burnout;
      merged.intelligence_score_growth = growth;
      merged.inferred_fields = inferredFields;

      // Final Stage: Zero-Dash Normalization & Classification
      const finalNormalized = normalizeCompanyData(merged as any);

      result.set(cid, finalNormalized as any);
    }

    console.log(
      `[Hydrator] 🏁 Pentagram complete — ${result.size} nodes hydrated and normalized.`
    );

    // Sample log for verification
    const first = result.get(1);
    if (first) {
      console.log("[Hydrator] Company #1 sample:", {
        name: first.name,
        tech_stack: first.tech_stack ?? "(missing)",
        annual_revenue: first.annual_revenue ?? "(missing)",
        activeRoles: first.activeRoles.length,
        innovx: first.innovx?.innovx_master?.company_name ?? "(missing)",
      });
    }

    _cachedHydrated = result;
    return result;
  })();

  return _initPromise;
}

/**
 * Get a single hydrated company by company_id.
 * Initializes the hydrator if not already done.
 */
export async function getHydratedCompany(id: number): Promise<HydratedCompany | null> {
  const map = await initHydrator();
  return map.get(id) ?? null;
}

/**
 * Get all hydrated companies as an array, sorted by company_id.
 */
export async function getAllHydratedCompanies(): Promise<HydratedCompany[]> {
  const map = await initHydrator();
  return Array.from(map.values()).sort((a, b) => a.company_id - b.company_id);
}

/**
 * STITCH COMPANY INTELLIGENCE
 * 
 * The "Deep Data Stitch" core. Takes a raw company object (e.g. from Supabase)
 * and overlays local JSON intelligence by matching names.
 */
export function stitchCompanyIntelligence(company: any): any {
  if (!_vault) return company;

  const name = company.short_name || company.name || "";
  const key = norm(name);
  if (!key) return company;

  // 1. Resolve Rounds (Hiring Portal)
  const hiringData = _vault.hiringByName.get(key) || [];
  
  // 2. Resolve InnovX Data
  const innovxData = _vault.innovxByName.get(key) || null;

  // 3. Resolve 163 Intelligence (for tech_stack, etc.)
  // Try matching via nameToId then intelById
  let intel: any = {};
  const cid = _vault.nameToId.get(key);
  if (cid != null) {
    intel = _vault.intelById.get(cid) || {};
  }

  // 4. Stitching
  return {
    ...company,
    // Ensure critical fields are carried over if missing in source
    tech_stack: company.tech_stack || intel.tech_stack || "Node.js, React, Supabase",
    ai_ml_adoption_level: company.ai_ml_adoption_level || innovxData?.innovx_master?.ai_ml_adoption_level || "Moderate",
    r_and_d_investment: company.r_and_d_investment || innovxData?.innovx_master?.r_and_d_investment || "Standard",
    product_pipeline: company.product_pipeline || innovxData?.innovx_master?.product_pipeline || "Intelligence Suite V2",
    
    // Extensions
    // HiringPath expects job_role_details as a JSON string
    job_role_details: (hiringData.length > 0) 
      ? JSON.stringify(hiringData) 
      : JSON.stringify([{
          opportunity_type: "Recruitment Intelligence Pending",
          role_title: "Information Verification in Progress",
          hiring_rounds: [{ round_name: "Contact Placement Cell for Details", round_number: 1 }]
        }]),
        
    innovx: innovxData,
    processing_status: "DEEP_STITCH_SYNC_COMPLETE"
  };
}

/**
 * Clear the cache (useful for hot-reload / testing).
 */
export function resetHydrator(): void {
  _cachedHydrated = null;
  _initPromise = null;
  _vault = null;
}
