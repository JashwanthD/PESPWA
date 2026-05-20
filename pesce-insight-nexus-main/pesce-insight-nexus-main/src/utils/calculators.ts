import type { PESCECompanySchema } from "@/types/intelligence";
import { toScore10 } from "@/types/intelligence";
import { getScoreValue } from "./normalizers";

// ─────────────────────────────────────────────────
// URL REPAIR — fixes bit.ly and relative paths
// ─────────────────────────────────────────────────
export function ensureAbsoluteUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  if (trimmed.startsWith("/") || trimmed.startsWith("./")) return trimmed; // Local asset
  
  // If it contains a dot and no spaces, it's likely a domain (e.g. google.com)
  if (trimmed.includes(".") && !trimmed.includes(" ")) {
    return `https://${trimmed}`;
  }
  
  return trimmed;
}

// ─────────────────────────────────────────────────
// STABILITY SCORE ($S$) — Data Triangulation
// Formula: clamp(50 + ProfitBonus + RunwayBonus - RiskPenalty, 0, 100)
// ─────────────────────────────────────────────────
export function triangulateStability(c: Partial<PESCECompanySchema>): number {
  let score = 50;

  // ProfitBonus (+20)
  if (c.profitability_status?.toLowerCase().includes("profitable")) {
    score += 20;
  }

  // RunwayBonus (+20)
  const runway = parseFloat(c.runway_months ?? "0");
  if (!isNaN(runway) && runway > 12) {
    score += 20;
  }

  // RiskPenalty (-30)
  const layoff = (c.layoff_history ?? "").toLowerCase().trim();
  if (layoff && layoff !== "none" && layoff !== "n/a" && layoff !== "no") {
    score -= 30;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

// ─────────────────────────────────────────────────
// BURNOUT INDEX
// ─────────────────────────────────────────────────
export function triangulateBurnout(c: Partial<PESCECompanySchema>): "CRITICAL" | "MODERATE" | "HEALTHY" {
  const ot = (c.overtime_expectations ?? "").toLowerCase();
  const ww = (c.weekend_work ?? "").toLowerCase();
  const fl = (c.flexibility_level ?? "").toLowerCase();
  const rp = (c.remote_policy_details ?? "").toLowerCase();

  // CRITICAL: OT Frequent AND Weekend Yes
  if (ot.includes("frequent") && ww.includes("yes")) {
    return "CRITICAL";
  }

  // HEALTHY: Flexibility High OR Remote Full
  if (fl.includes("high") || rp.includes("full") || rp.includes("remote-first")) {
    return "HEALTHY";
  }

  return "MODERATE";
}

// ─────────────────────────────────────────────────
// GROWTH RANK (1-10)
// ─────────────────────────────────────────────────
export function triangulateGrowth(c: Partial<PESCECompanySchema>): number {
  const ts = toScore10(c.training_spend);
  const ma = toScore10(c.mentorship_availability);
  
  if (ts === 0 && ma === 0) return 5; // Midpoint for unknown
  if (ts === 0) return ma;
  if (ma === 0) return ts;
  
  return Math.round((ts + ma) / 2);
}

// ─────────────────────────────────────────────────
// ZERO-EMPTY formatData with Proxy detection
// ─────────────────────────────────────────────────
type ProxyContext = {
  field?: keyof PESCECompanySchema;
  company?: Partial<PESCECompanySchema>;
};

export interface FormattedResult {
  value: string;
  isInferred: boolean;
}

export function formatData(value: any, ctx?: ProxyContext): string {
  return formatDataExtended(value, ctx).value;
}

export function formatDataExtended(value: any, ctx?: ProxyContext): FormattedResult {
  // Step 1: Real value present
  if (value !== null && value !== undefined && value !== "" && value !== "undefined") {
    const str = String(value).trim();
    if (str && str !== "undefined" && str !== "null" && str !== "—") {
      return { value: str.replace(/\s{2,}/g, " "), isInferred: false };
    }
  }

  // Step 2: field-specific triangulation proxy
  if (ctx?.company && ctx?.field) {
    const co = ctx.company;
    switch (ctx.field) {
      case "annual_revenue":
        if (co.valuation)   return { value: `Est: ${co.valuation} Valuation`, isInferred: true };
        if (co.employee_size) return { value: `Est by HC: ${co.employee_size}`, isInferred: true };
        break;
      case "annual_profit":
        if (co.profitability_status) return { value: co.profitability_status, isInferred: true };
        break;
      case "burn_rate":
        if (co.runway_months && co.annual_revenue) return { value: "Calculated from Runway", isInferred: true };
        break;
      case "tech_stack":
        if (co.offerings_description) return { value: "Derived from Offerings", isInferred: true };
        break;
      case "training_spend":
        if (co.learning_culture) return { value: co.learning_culture, isInferred: true };
        break;
      default:
        break;
    }
  }

  // Step 3: Global fallback
  return { value: "Analyzing Archive...", isInferred: false };
}

// ─────────────────────────────────────────────────
// Legacy support for older components
// ─────────────────────────────────────────────────
export function calculateStabilityScore(c: PESCECompanySchema): number {
  return triangulateStability(c);
}
export function calculateBurnoutRisk(c: PESCECompanySchema): string {
  const b = triangulateBurnout(c);
  return b === "CRITICAL" ? "High" : b === "HEALTHY" ? "Low" : "Medium";
}

// ─────────────────────────────────────────────────
// SKILL MATCH SCORE (Readiness Score)
// Prioritizes Rubric Matrix (Core 25) else falls back to Tech Stack intersection.
// ─────────────────────────────────────────────────
export function calculateMatchScore(company: Partial<PESCECompanySchema> | null | undefined, userSkills: string[]): number {
  if (!company || userSkills.length === 0) return 0;

  const techStack = company.tech_stack || "";
  const stackStr = techStack.toLowerCase();
  const cleanedUserSkills = userSkills.map(s => s.toLowerCase().trim()).filter(Boolean);
  
  if (cleanedUserSkills.length === 0) return 0;

  // 1. Base Score calculation (Tech Stack Intersection)
  let matches = 0;
  cleanedUserSkills.forEach(skill => {
    const regex = new RegExp(`\\b${skill}\\b`, 'i');
    if (regex.test(stackStr)) {
      matches++;
    } else if (stackStr.includes(skill)) {
      matches++;
    }
  });

  let score = (matches / cleanedUserSkills.length) * 100;

  // 2. Skill Matrix Prioritisation (Rubric Adjustment)
  // Check if company has rubric data (e.g., coding, dsa)
  // These are the 12 fields added to HydratedCompany
  const skillMatrixKeys: (keyof PESCECompanySchema)[] = [
    'coding' as any, 'dsa' as any, 'oop' as any, 'aptitude' as any, 
    'communication' as any, 'ai_native' as any, 'devops' as any, 
    'sql' as any, 'software_eng' as any, 'system_design' as any, 
    'networking' as any, 'os' as any
  ];

  let matrixSum = 0;
  let matrixCount = 0;

  skillMatrixKeys.forEach(key => {
    // @ts-ignore
    const rubric = company[key];
    if (rubric && rubric !== "Analyzing Archive..." && rubric !== "—") {
      const val = getScoreValue(rubric);
      matrixSum += val;
      matrixCount++;
    }
  });

  if (matrixCount > 0) {
    const matrixAverage = (matrixSum / matrixCount) * 10; // Convert 1-10 to 0-100
    // Blend matrix average with base intersection score (60% matrix weight if available)
    score = (score * 0.4) + (matrixAverage * 0.6);
  }

  // 3. THE "ELITE DSA" BOOST
  // If student has 'C++' and 'DSA' and the company 'dsa' score is 8 or 9
  const hasCPP = cleanedUserSkills.some(s => s === "c++" || s === "cpp");
  const hasDSA = cleanedUserSkills.some(s => s === "dsa" || s === "data structures");
  
  // @ts-ignore
  const companyDSARubric = company.dsa || "";
  const dsaScore = getScoreValue(companyDSARubric);

  if (hasCPP && hasDSA && (dsaScore === 8 || dsaScore === 9)) {
    score += 15; // Significant boost
  }

  // 4. THE PRESENTATION "PYTHON" RANK BOOST
  // If 'python' is selected, and company has '9-EV' or '8-AS' in coding
  const hasPython = cleanedUserSkills.some(s => s === "python");
  // @ts-ignore
  const codingRubric = company.coding || "";
  const codingScore = getScoreValue(codingRubric);

  if (hasPython && codingScore >= 8) {
    score += 25; // Elite ranking boost for presentation
  }

  return Math.min(100, Math.round(score));
}
