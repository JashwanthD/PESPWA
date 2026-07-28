/**
 * PESCECompanySchema — Flat Projection of the normalized data.
 * Used by UI components to avoid nested property access complexity.
 */
export type Maybe<T> = T | null | undefined;

export interface PESCESkillLevels {
  coding?: Maybe<number>;
  data_structures_and_algorithms?: Maybe<number>;
  object_oriented_programming_and_design?: Maybe<number>;
  aptitude_and_problem_solving?: Maybe<number>;
  communication_skills?: Maybe<number>;
  ai_native_engineering?: Maybe<number>;
  devops_and_cloud?: Maybe<number>;
  sql_and_design?: Maybe<number>;
  software_engineering?: Maybe<number>;
  system_design_and_architecture?: Maybe<number>;
  computer_networking?: Maybe<number>;
  operating_system?: Maybe<number>;
}

export type PESCECategory =
  | "Tier-1 Giant"
  | "Product Hub"
  | "Service Ecosystem"
  | "Emerging Startup";

// --- Normalized Table Interfaces ---

export interface CompanyBrandReputation {
  website_quality?: Maybe<string>;
  website_rating?: Maybe<string>;
  website_traffic_rank?: Maybe<string>;
  social_media_followers?: Maybe<string>;
  glassdoor_rating?: Maybe<string>;
  indeed_rating?: Maybe<string>;
  google_rating?: Maybe<string>;
  awards_recognitions?: Maybe<string>;
  brand_sentiment_score?: Maybe<string>;
  event_participation?: Maybe<string>;
}

export interface CompanyBusiness {
  pain_points_addressed?: Maybe<string>;
  focus_sectors?: Maybe<string>;
  offerings_description?: Maybe<string>;
  top_customers?: Maybe<string>;
  core_value_proposition?: Maybe<string>;
  unique_differentiators?: Maybe<string>;
  competitive_advantages?: Maybe<string>;
  weaknesses_gaps?: Maybe<string>;
  key_challenges_needs?: Maybe<string>;
  key_competitors?: Maybe<string>;
  market_share_percentage?: Maybe<string>;
  sales_motion?: Maybe<string>;
  customer_concentration_risk?: Maybe<string>;
  exit_strategy_history?: Maybe<string>;
  benchmark_vs_peers?: Maybe<string>;
  future_projections?: Maybe<string>;
  strategic_priorities?: Maybe<string>;
  industry_associations?: Maybe<string>;
  case_studies?: Maybe<string>;
  go_to_market_strategy?: Maybe<string>;
  innovation_roadmap?: Maybe<string>;
  product_pipeline?: Maybe<string>;
  tam?: Maybe<string>;
  sam?: Maybe<string>;
  som?: Maybe<string>;
}

export interface CompanyCompensation {
  leave_policy?: Maybe<string>;
  health_support?: Maybe<string>;
  fixed_vs_variable_pay?: Maybe<string>;
  bonus_predictability?: Maybe<string>;
  esops_incentives?: Maybe<string>;
  family_health_insurance?: Maybe<string>;
  relocation_support?: Maybe<string>;
  lifestyle_benefits?: Maybe<string>;
}

export interface CompanyCulture {
  hiring_velocity?: Maybe<string>;
  employee_turnover?: Maybe<string>;
  avg_retention_tenure?: Maybe<string>;
  diversity_metrics?: Maybe<string>;
  work_culture_summary?: Maybe<string>;
  manager_quality?: Maybe<string>;
  psychological_safety?: Maybe<string>;
  feedback_culture?: Maybe<string>;
  diversity_inclusion_score?: Maybe<string>;
  ethical_standards?: Maybe<string>;
  burnout_risk?: Maybe<string>;
  layoff_history?: Maybe<string>;
  mission_clarity?: Maybe<string>;
  sustainability_csr?: Maybe<string>;
  crisis_behavior?: Maybe<string>;
}

export interface CompanyFinancials {
  annual_revenue?: Maybe<string>;
  annual_profit?: Maybe<string>;
  revenue_mix?: Maybe<string>;
  valuation?: Maybe<string>;
  yoy_growth_rate?: Maybe<string>;
  profitability_status?: Maybe<string>;
  key_investors?: Maybe<string>;
  recent_funding_rounds?: Maybe<string>;
  total_capital_raised?: Maybe<string>;
  customer_acquisition_cost?: Maybe<string>;
  customer_lifetime_value?: Maybe<string>;
  cac_ltv_ratio?: Maybe<string>;
  churn_rate?: Maybe<string>;
  net_promoter_score?: Maybe<string>;
  burn_rate?: Maybe<string>;
  runway_months?: Maybe<string>;
  burn_multiplier?: Maybe<string>;
}

export interface CompanyLogistics {
  remote_policy_details?: Maybe<string>;
  typical_hours?: Maybe<string>;
  overtime_expectations?: Maybe<string>;
  weekend_work?: Maybe<string>;
  flexibility_level?: Maybe<string>;
  location_centrality?: Maybe<string>;
  public_transport_access?: Maybe<string>;
  cab_policy?: Maybe<string>;
  airport_commute_time?: Maybe<string>;
  office_zone_type?: Maybe<string>;
  area_safety?: Maybe<string>;
  safety_policies?: Maybe<string>;
  infrastructure_safety?: Maybe<string>;
  emergency_preparedness?: Maybe<string>;
}

export interface CompanyPeople {
  ceo_name?: Maybe<string>;
  ceo_linkedin_url?: Maybe<string>;
  key_leaders?: Maybe<string>;
  warm_intro_pathways?: Maybe<string>;
  decision_maker_access?: Maybe<string>;
  contact_person_name?: Maybe<string>;
  contact_person_title?: Maybe<string>;
  contact_person_email?: Maybe<string>;
  contact_person_phone?: Maybe<string>;
  board_members?: Maybe<string>;
}

export interface CompanyTechnologies {
  technology_partners?: Maybe<string>;
  intellectual_property?: Maybe<string>;
  r_and_d_investment?: Maybe<string>;
  ai_ml_adoption_level?: Maybe<string>;
  tech_stack?: Maybe<string>;
  cybersecurity_posture?: Maybe<string>;
  partnership_ecosystem?: Maybe<string>;
  tech_adoption_rating?: Maybe<string>;
}

export interface CompanyTalentGrowth {
  training_spend?: Maybe<string>;
  onboarding_quality?: Maybe<string>;
  learning_culture?: Maybe<string>;
  exposure_quality?: Maybe<string>;
  mentorship_availability?: Maybe<string>;
  internal_mobility?: Maybe<string>;
  promotion_clarity?: Maybe<string>;
  tools_access?: Maybe<string>;
  role_clarity?: Maybe<string>;
  early_ownership?: Maybe<string>;
  work_impact?: Maybe<string>;
  execution_thinking_balance?: Maybe<string>;
  automation_level?: Maybe<string>;
  cross_functional_exposure?: Maybe<string>;
  company_maturity?: Maybe<string>;
  brand_value?: Maybe<string>;
  client_quality?: Maybe<string>;
  exit_opportunities?: Maybe<string>;
  skill_relevance?: Maybe<string>;
  external_recognition?: Maybe<string>;
  network_strength?: Maybe<string>;
  global_exposure?: Maybe<string>;
}

/**
 * PESCECompanySchema — Flat Projection of the normalized data.
 * Used by UI components to avoid nested property access complexity.
 */
export interface PESCECompanySchema extends 
  CompanyBrandReputation, 
  CompanyBusiness, 
  CompanyCompensation, 
  CompanyCulture, 
  CompanyFinancials, 
  CompanyLogistics, 
  CompanyPeople, 
  CompanyTechnologies,
  CompanyTalentGrowth 
{
  company_id: number;
  name?: Maybe<string>;
  short_name?: Maybe<string>;
  logo_url?: Maybe<string>;
  category?: Maybe<string>;
  incorporation_year?: Maybe<string>;
  overview_text?: Maybe<string>;
  nature_of_company?: Maybe<string>;
  headquarters_address?: Maybe<string>;
  operating_countries?: Maybe<string>;
  office_count?: Maybe<string>;
  office_locations?: Maybe<string>;
  employee_size?: Maybe<string>;
  vision_statement?: Maybe<string>;
  mission_statement?: Maybe<string>;
  core_values?: Maybe<string>;
  history_timeline?: Maybe<string>;
  recent_news?: Maybe<string>;
  website_url?: Maybe<string>;
  linkedin_url?: Maybe<string>;
  twitter_handle?: Maybe<string>;
  facebook_url?: Maybe<string>;
  instagram_url?: Maybe<string>;
  primary_contact_email?: Maybe<string>;
  primary_phone_number?: Maybe<string>;
  regulatory_status?: Maybe<string>;
  legal_issues?: Maybe<string>;
  esg_ratings?: Maybe<string>;
  supply_chain_dependencies?: Maybe<string>;
  geopolitical_risks?: Maybe<string>;
  macro_risks?: Maybe<string>;
  carbon_footprint?: Maybe<string>;
  ethical_sourcing?: Maybe<string>;
  marketing_video_url?: Maybe<string>;
  customer_testimonials?: Maybe<string>;

  // Metadata / Extensions
  application_url?: Maybe<string>;
  job_role_details?: any; 
  skill_levels?: Maybe<PESCESkillLevels>;
  intelligence_score_stability?: Maybe<number>;
  intelligence_score_burnout?: Maybe<"CRITICAL" | "MODERATE" | "HEALTHY">;
  intelligence_score_growth?: Maybe<number>;
  processing_status?: Maybe<string>; 
}

/* — Helpers used by UI logic to coerce free-text fields into numbers — */
export const SCALE_MAP: Record<string, number> = {
  "very low": 1, low: 2, "below average": 3, moderate: 5, average: 5,
  "above average": 7, high: 8, "very high": 9, exceptional: 10, elite: 10,
};

export function toScore10(v: Maybe<string | number>): number {
  if (v === null || v === undefined) return 0;
  if (typeof v === "number") return Math.max(0, Math.min(10, v));
  const trimmed = v.trim().toLowerCase();
  if (!trimmed) return 0;
  // numeric "8/10", "7", "85%"
  const numMatch = trimmed.match(/(\d+(?:\.\d+)?)/);
  if (numMatch) {
    let n = parseFloat(numMatch[1]);
    if (trimmed.includes("%")) n = n / 10;
    if (n > 10) n = n / 10;
    return Math.max(0, Math.min(10, n));
  }
  return SCALE_MAP[trimmed] ?? 0;
}

export const SKILL_LABELS: Record<keyof PESCESkillLevels, string> = {
  coding: "Coding",
  data_structures_and_algorithms: "DSA",
  object_oriented_programming_and_design: "OOP & Design",
  aptitude_and_problem_solving: "Aptitude",
  communication_skills: "Communication",
  ai_native_engineering: "AI-Native Eng.",
  devops_and_cloud: "DevOps & Cloud",
  sql_and_design: "SQL & DB Design",
  software_engineering: "Software Eng.",
  system_design_and_architecture: "System Design",
  computer_networking: "Networking",
  operating_system: "Operating Systems",
};
