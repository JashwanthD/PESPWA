import { Maybe } from "./intelligence";

/**
 * PESCE Nexus Normalized Schema
 * Based on the "Anchor" architecture.
 */

export interface Company {
  company_id: number;
  name: string;
  short_name?: Maybe<string>;
  logo_url?: Maybe<string>;
  incorporation_year?: Maybe<number>;
  hq_location?: Maybe<string>;
  nature_of_company?: Maybe<string>; // Product, Service, etc.
  employee_size?: Maybe<string>;
  website_url?: Maybe<string>;
  
  // 1:1 Relations
  brand?: Maybe<CompanyBrand>;
  business?: Maybe<CompanyBusiness>;
  compensation?: Maybe<CompanyCompensation>;
  culture?: Maybe<CompanyCulture>;
  financials?: Maybe<CompanyFinancials>;
  logistics?: Maybe<CompanyLogistics>;
  people?: Maybe<CompanyPeople>;
  talent?: Maybe<CompanyTalent>;
  technology?: Maybe<CompanyTechnology>;
  
  // 1:N Relations
  skills?: CompanySkillLevel[];
  hiring_roles?: HiringJobRole[];
  innovix?: InnovixMaster;
}

export interface CompanyBrand {
  sentiment_score?: Maybe<number>;
  glassdoor_rating?: Maybe<number>;
  awards?: Maybe<string>;
  brand_value?: Maybe<string>;
}

export interface CompanyBusiness {
  sectors?: Maybe<string>;
  offerings?: Maybe<string>;
  customers?: Maybe<string>;
  revenue_model?: Maybe<string>;
}

export interface CompanyCompensation {
  fixed_pay_avg?: Maybe<number>;
  variable_pay_avg?: Maybe<number>;
  bonus_structure?: Maybe<string>;
  benefits?: Maybe<string>;
}

export interface CompanyCulture {
  work_hours?: Maybe<string>;
  flexibility_rating?: Maybe<number>;
  psychological_safety?: Maybe<number>;
  diversity_score?: Maybe<number>;
}

export interface CompanyFinancials {
  revenue?: Maybe<string>;
  profit?: Maybe<string>;
  growth_rate?: Maybe<string>;
  valuation?: Maybe<string>;
}

export interface CompanyLogistics {
  office_locations?: Maybe<string>;
  commute_time_avg?: Maybe<string>;
  cab_policy?: Maybe<string>;
}

export interface CompanyPeople {
  ceo_name?: Maybe<string>;
  leadership_quality?: Maybe<number>;
  employee_turnover?: Maybe<string>;
}

export interface CompanyTalent {
  hiring_velocity?: Maybe<string>;
  promotion_clarity?: Maybe<number>;
  mentorship_rating?: Maybe<number>;
}

export interface CompanyTechnology {
  tech_stack?: Maybe<string>;
  ai_adoption_level?: Maybe<number>;
  rd_investment?: Maybe<string>;
}

// ---- Skills System ----

export interface SkillSetMaster {
  skill_id: number;
  name: string;
  category: string;
  topics?: SkillSetTopic[];
}

export interface SkillSetTopic {
  topic_id: number;
  skill_id: number;
  name: string;
  bloom_taxonomy_level?: Maybe<number>;
}

export interface CompanySkillLevel {
  company_id: number;
  skill_id: number;
  rating: number; // 1-10
  bloom_code: string; // e.g., "9-EV"
}

// ---- Hiring System ----

export interface HiringJobRole {
  role_id: number;
  company_id: number;
  role_name: string; // e.g., "SDE-1"
  rounds?: HiringRound[];
}

export interface HiringRound {
  round_id: number;
  role_id: number;
  round_number: number;
  name: string; // e.g., "Aptitude", "Technical Round 1"
  skills_tested?: HiringSkillSet[];
  sample_questions?: Maybe<string>;
}

export interface HiringSkillSet {
  round_id: number;
  skill_id: number;
  weightage?: Maybe<number>;
}

// ---- Innovix System ----

export interface InnovixMaster {
  company_id: number;
  trends?: InnovixTrend[];
  roadmap?: InnovixRoadmap[];
  competitors?: InnovixCompetitor[];
  pillars?: InnovixPillar[];
  projects?: InnovixProject[];
}

export interface InnovixTrend {
  trend_name: string;
  impact_level: string;
}

export interface InnovixRoadmap {
  phase: string;
  milestone: string;
}

export interface InnovixCompetitor {
  name: string;
  market_share?: Maybe<string>;
}

export interface InnovixPillar {
  name: string;
  description: string;
}

export interface InnovixProject {
  tier: "Foundational" | "Advanced" | "Breakthrough";
  name: string;
  description: string;
}
