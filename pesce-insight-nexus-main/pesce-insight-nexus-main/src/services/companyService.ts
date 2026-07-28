/**
 * companyService.ts — Production Supabase Integration
 * 
 * This service is the sole data authority for company intelligence.
 * It eliminates all local JSON/dummy logic and communicates directly with the
 * normalized PostgreSQL schema.
 */

import type { PESCECompanySchema, PESCESkillLevels } from "@/types/intelligence";
import { supabase } from "@/lib/supabase";
import { normalizeCompanyData, normalizeUrl } from "@/utils/normalizers";

// ─────────────────────────────────────────────────────────────
// DATA FLATTENING UTILITY
// Converts the nested Supabase join result into the flat PESCECompanySchema
// ─────────────────────────────────────────────────────────────
function flattenCompanyNode(raw: any): PESCECompanySchema {
  if (!raw) return raw;

  // Extract nested objects from joins
  const {
    company_brand_reputation,
    company_business,
    company_compensation,
    company_culture,
    company_financials,
    company_logistics,
    company_people,
    company_technologies,
    company_talent_growth,
    company_skill,
    ...base
  } = raw;

  // Flatten everything into a single object
  const flattened: any = {
    ...base,
    ...(company_brand_reputation?.[0] || company_brand_reputation || {}),
    ...(company_business?.[0] || company_business || {}),
    ...(company_compensation?.[0] || company_compensation || {}),
    ...(company_culture?.[0] || company_culture || {}),
    ...(company_financials?.[0] || company_financials || {}),
    ...(company_logistics?.[0] || company_logistics || {}),
    ...(company_people?.[0] || company_people || {}),
    ...(company_technologies?.[0] || company_technologies || {}),
    ...(company_talent_growth?.[0] || company_talent_growth || {}),
  };

  // Map skill levels if present (this usually comes from company_skill_levels join)
  if (raw.company_skill_levels) {
    const skills: PESCESkillLevels = {};
    const SKILL_KEY_MAP: Record<string, keyof PESCESkillLevels> = {
      coding: "coding",
      dsa: "data_structures_and_algorithms",
      oop: "object_oriented_programming_and_design",
      aptitude: "aptitude_and_problem_solving",
      communication: "communication_skills",
      ai_native: "ai_native_engineering",
      devops: "devops_and_cloud",
      sql: "sql_and_design",
      software_eng: "software_engineering",
      system_design: "system_design_and_architecture",
      networking: "computer_networking",
      os: "operating_system"
    };

    raw.company_skill_levels.forEach((s: any) => {
      const skillName = s.skill_set_master?.short_name?.toLowerCase();
      if (skillName) {
        const longKey = SKILL_KEY_MAP[skillName] || skillName as keyof PESCESkillLevels;
        // @ts-ignore
        skills[longKey] = s.required_level;
      }
    });
    flattened.skill_levels = skills;
  }

  // URL Normalization
  const URL_FIELDS = ["logo_url", "website_url", "linkedin_url", "ceo_linkedin_url"];
  URL_FIELDS.forEach(field => {
    if (flattened[field]) {
      // Preserve the full string (e.g. semicolon-separated logos)
      // but ensure each part is normalized if it's a single URL
      if (field === "logo_url") {
        flattened[field] = String(flattened[field]).trim();
      } else {
        flattened[field] = normalizeUrl(String(flattened[field]).split(';')[0].trim());
      }
    }
  });

  return normalizeCompanyData(flattened as PESCECompanySchema);
}

// ─────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────
// LOCAL INTEGRATION UTILITIES & PUBLIC API
// ─────────────────────────────────────────────────────────────

const norm = (s: string) => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");

async function fetchLocalCompaniesIndex(): Promise<any[]> {
  try {
    if (typeof window === "undefined") return [];
    const baseUrl = window.location.origin;
    const res = await fetch(`${baseUrl}/output/local_companies_index.json`);
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    console.warn("[Intelligence] Failed to fetch local companies index:", e);
    return [];
  }
}

async function fetchSkillMatrix(): Promise<any[]> {
  try {
    if (typeof window === "undefined") return [];
    const baseUrl = window.location.origin;
    const res = await fetch(`${baseUrl}/data/intelligence/skill_matrix.json`);
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    console.warn("[Intelligence] Failed to fetch skill matrix:", e);
    return [];
  }
}

/**
 * Autorecovery/fallback levels from skill_matrix.json helper
 */
function getLocalSkills(skillMatrix: any[], name: string, shortName: string, id: number) {
  const normName = norm(name);
  const normShort = norm(shortName);
  const skillRow = skillMatrix.find(
    (row: any) =>
      String(row.id) === String(id) ||
      norm(row.name) === normName ||
      norm(row.name) === normShort
  );

  if (!skillRow) return undefined;

  const skills: PESCESkillLevels = {};
  const SKILL_KEY_MAP: Record<string, keyof PESCESkillLevels> = {
    coding: "coding",
    dsa: "data_structures_and_algorithms",
    oop: "object_oriented_programming_and_design",
    aptitude: "aptitude_and_problem_solving",
    communication: "communication_skills",
    ai_native: "ai_native_engineering",
    devops: "devops_and_cloud",
    sql: "sql_and_design",
    software_eng: "software_engineering",
    system_design: "system_design_and_architecture",
    networking: "computer_networking",
    os: "operating_system"
  };

  Object.keys(SKILL_KEY_MAP).forEach((shortKey) => {
    const skillVal = skillRow[shortKey];
    if (skillVal !== undefined) {
      const longKey = SKILL_KEY_MAP[shortKey];
      // @ts-ignore
      skills[longKey] = skillVal;
    }
  });

  return skills;
}

/**
 * Fetches all companies for the Vault/Explorer view.
 * Performs a shallow join for Supabase, then merges local companies from the index.
 */
export async function getAllCompanies(): Promise<PESCECompanySchema[]> {
  try {
    const [dbResult, localIndex, skillMatrix] = await Promise.all([
      supabase
        .from("companies")
        .select(`
          *,
          company_culture(hiring_velocity),
          company_brand_reputation(brand_sentiment_score),
          company_skill_levels(
            required_level,
            skill_set_master(short_name)
          )
        `)
        .order("name", { ascending: true })
        .then(({ data, error }: { data: any; error: any }) => {
          if (error) throw error;
          return (data || []).map(flattenCompanyNode);
        })
        .catch((err: any) => {
          console.error("[Intelligence] Supabase getAllCompanies failed, falling back to local index only:", err);
          return [] as PESCECompanySchema[];
        }),
      fetchLocalCompaniesIndex(),
      fetchSkillMatrix()
    ]);

    // Map of existing DB companies by normalized name and short_name
    const dbMap = new Map<string, PESCECompanySchema>();
    dbResult.forEach((c: PESCECompanySchema) => {
      if (c.name) dbMap.set(norm(c.name), c);
      if (c.short_name) dbMap.set(norm(c.short_name), c);
      
      // Fallback/enrich db companies if they lack skill levels
      if (!c.skill_levels || Object.keys(c.skill_levels).length === 0) {
        c.skill_levels = getLocalSkills(skillMatrix, c.name || "", c.short_name || "", c.company_id);
      }
    });

    const merged: PESCECompanySchema[] = [...dbResult];

    localIndex.forEach((local) => {
      const normName = norm(local.name);
      const normShort = norm(local.short_name);
      const existing = dbMap.get(normName) || dbMap.get(normShort);

      const formattedLocal: PESCECompanySchema = {
        company_id: local.company_id,
        name: local.name,
        short_name: local.short_name,
        logo_url: Array.isArray(local.logo_url) ? local.logo_url.join("; ") : local.logo_url,
        category: local.category,
        employee_size: local.employee_size,
        yoy_growth_rate: local.yoy_growth_rate,
        operating_countries: Array.isArray(local.operating_countries) ? local.operating_countries.join("; ") : local.operating_countries,
        office_locations: Array.isArray(local.office_locations) ? local.office_locations.join("; ") : local.office_locations,
        skill_levels: getLocalSkills(skillMatrix, local.name || "", local.short_name || "", local.company_id)
      } as any;

      if (existing) {
        // Merge attributes, letting local take priority, but keep the database ID
        const idx = merged.findIndex(c => c.company_id === existing.company_id);
        if (idx !== -1) {
          merged[idx] = {
            ...existing,
            ...formattedLocal,
            company_id: existing.company_id
          };
        }
      } else {
        merged.push(formattedLocal);
      }
    });

    // Re-sort alphabetically by name
    return merged.sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
  } catch (error) {
    console.error("[Intelligence] getAllCompanies failure:", error);
    return [];
  }
}

/**
 * Fetches deep intelligence for a specific company dossier.
 * If local, loads from /output/*_consolidated.json. Otherwise, queries Supabase.
 */
export async function fetchIntelligenceCompanyById(id: number): Promise<PESCECompanySchema | null> {
  try {
    const localIndex = await fetchLocalCompaniesIndex();
    const localMatch = localIndex.find(c => c.company_id === id);

    if (localMatch && localMatch.filename) {
      if (typeof window !== "undefined") {
        const baseUrl = window.location.origin;
        const res = await fetch(`${baseUrl}/output/${localMatch.filename}`);
        if (res.ok) {
          const rawData = await res.json();
          
          // Normalize URLs
          const URL_FIELDS = ["logo_url", "website_url", "linkedin_url", "ceo_linkedin_url"];
          URL_FIELDS.forEach(field => {
            if (rawData[field]) {
              if (field === "logo_url") {
                rawData[field] = String(rawData[field]).trim();
              } else {
                rawData[field] = normalizeUrl(String(rawData[field]).split(';')[0].trim());
              }
            }
          });

          // Normalize company data
          const normalized = normalizeCompanyData(rawData as PESCECompanySchema);

          // Fallback/enrich skills from local skill_matrix.json
          try {
            const skillMatrixRes = await fetch(`${baseUrl}/data/intelligence/skill_matrix.json`);
            if (skillMatrixRes.ok) {
              const skillsList = await skillMatrixRes.json();
              const nameNorm = norm(normalized.name || "");
              const shortNorm = norm(normalized.short_name || "");
              const skillRow = skillsList.find((s: any) => norm(s.name) === nameNorm || norm(s.name) === shortNorm);
              
              if (skillRow) {
                const skills: PESCESkillLevels = {};
                const SKILL_KEY_MAP: Record<string, keyof PESCESkillLevels> = {
                  coding: "coding",
                  dsa: "data_structures_and_algorithms",
                  oop: "object_oriented_programming_and_design",
                  aptitude: "aptitude_and_problem_solving",
                  communication: "communication_skills",
                  ai_native: "ai_native_engineering",
                  devops: "devops_and_cloud",
                  sql: "sql_and_design",
                  software_eng: "software_engineering",
                  system_design: "system_design_and_architecture",
                  networking: "computer_networking",
                  os: "operating_system"
                };

                Object.keys(SKILL_KEY_MAP).forEach((shortKey) => {
                  const skillVal = skillRow[shortKey];
                  if (skillVal !== undefined) {
                    const longKey = SKILL_KEY_MAP[shortKey];
                    // @ts-ignore
                    skills[longKey] = skillVal;
                  }
                });
                normalized.skill_levels = skills;
              }
            }
          } catch (se) {
            console.warn("[Intelligence] Local skills enrichment skipped:", se);
          }

          return normalized;
        }
      }
    }

    // Default to Supabase query
    const { data, error } = await supabase
      .from("companies")
      .select(`
        *,
        company_brand_reputation(*),
        company_business(*),
        company_compensation(*),
        company_culture(*),
        company_financials(*),
        company_logistics(*),
        company_people(*),
        company_technologies(*),
        company_talent_growth(*),
        company_skill_levels(
          required_level,
          skill_set_master(short_name)
        )
      `)
      .eq("company_id", id)
      .single();

    if (error) throw error;
    if (!data) return null;

    const flattened = flattenCompanyNode(data);
    
    // Fallback/enrich skills from local skill_matrix.json if empty
    if (!flattened.skill_levels || Object.keys(flattened.skill_levels).length === 0) {
      try {
        if (typeof window !== "undefined") {
          const baseUrl = window.location.origin;
          const skillMatrixRes = await fetch(`${baseUrl}/data/intelligence/skill_matrix.json`);
          if (skillMatrixRes.ok) {
            const skillsList = await skillMatrixRes.json();
            const nameNorm = norm(flattened.name || "");
            const shortNorm = norm(flattened.short_name || "");
            const skillRow = skillsList.find((s: any) => norm(s.name) === nameNorm || norm(s.name) === shortNorm);
            
            if (skillRow) {
              const skills: PESCESkillLevels = {};
              const SKILL_KEY_MAP: Record<string, keyof PESCESkillLevels> = {
                coding: "coding",
                dsa: "data_structures_and_algorithms",
                oop: "object_oriented_programming_and_design",
                aptitude: "aptitude_and_problem_solving",
                communication: "communication_skills",
                ai_native: "ai_native_engineering",
                devops: "devops_and_cloud",
                sql: "sql_and_design",
                software_eng: "software_engineering",
                system_design: "system_design_and_architecture",
                networking: "computer_networking",
                os: "operating_system"
              };

              Object.keys(SKILL_KEY_MAP).forEach((shortKey) => {
                const skillVal = skillRow[shortKey];
                if (skillVal !== undefined) {
                  const longKey = SKILL_KEY_MAP[shortKey];
                  // @ts-ignore
                  skills[longKey] = skillVal;
                }
              });
              flattened.skill_levels = skills;
            }
          }
        }
      } catch (se) {
        console.warn("[Intelligence] DB company single skills enrichment skipped:", se);
      }
    }

    return flattened;
  } catch (error) {
    console.error(`[Intelligence] fetchById(${id}) failure:`, error);
    return null;
  }
}

/**
 * Compatibility wrapper for the Race & Hydrate pattern.
 */
export async function fetchAllIntelligenceCompanies(
  onUpdate?: (companies: PESCECompanySchema[]) => void
): Promise<PESCECompanySchema[]> {
  const companies = await getAllCompanies();
  if (onUpdate) onUpdate(companies);
  return companies;
}

/**
 * Fetches hiring JSON or specific job roles for a company.
 * If local, falls back to public/data/intelligence/job_roles.json.
 */
export async function fetchHiringJsonByCompanyId(id: number): Promise<any> {
  try {
    const localIndex = await fetchLocalCompaniesIndex();
    const localMatch = localIndex.find(c => c.company_id === id);

    if (localMatch) {
      if (typeof window !== "undefined") {
        const baseUrl = window.location.origin;
        const res = await fetch(`${baseUrl}/data/intelligence/job_roles.json`);
        if (res.ok) {
          const text = await res.text();
          const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);
          for (const line of lines) {
            try {
              const parsed = JSON.parse(line);
              if (norm(parsed.company_name) === norm(localMatch.name) || norm(parsed.company_name) === norm(localMatch.short_name)) {
                return parsed.job_role_details;
              }
            } catch (e) {
              // Ignore line parse errors
            }
          }
        }
      }
    }

    // Default to Supabase query
    const { data, error } = await supabase
      .from("hiring_job_role")
      .select(`
        *,
        hiring_round(*)
      `)
      .eq("hiring_company_id", id);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.warn("[Hiring] fetchHiringJson failure:", error);
    return null;
  }
}

