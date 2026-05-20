import type { PESCECompanySchema } from "@/types/intelligence";
import { ensureAbsoluteUrl } from "./calculators";

/**
 * ─────────────────────────────────────────────────────────────
 * THE AUTO-CLASSIFIER & DATA NORMALIZER
 * ─────────────────────────────────────────────────────────────
 * unifies the 143 nodes into a consistent, "Zero-Dash" schema.
 * ─────────────────────────────────────────────────────────────
 */
const SERVICE_GIANTS = [
  "tcs", "infosys", "wipro", "hcl", "tech mahindra", "cognizant", 
  "accenture", "capgemini", "larsen & toubro", "l&t", "mindtree"
];

const TIER1_KEYWORDS = ["10k", "50k", "100k", "fortune 500", "blue-chip"];
const PRODUCT_KEYWORDS = ["product", "saas", "software development", "platform", "b2c", "consumer tech"];

/**
 * Defensive string check helper to prevent "TypeError: includes is not a function"
 */
export const safeIncludes = (val: any, search: string): boolean => {
  return String(val || "").toLowerCase().includes(String(search || "").toLowerCase());
};

/**
 * Normalizes a string to Title Case with special acronym handling.
 */
export function toTitleCase(str: string): string {
  if (!str || typeof str !== 'string') return str;
  // If it's a long text (sentences), don't title case the whole thing.
  if (str.split(" ").length > 5) return str; 
  
  const ACRONYMS = ["AI", "ML", "SQL", "USA", "UK", "DSA", "OOP", "PES", "PESCE"];
  
  return str.replace(/\w\S*/g, (txt) => {
    const upper = txt.toUpperCase();
    if (ACRONYMS.includes(upper)) return upper;
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

/**
 * Force https:// on links, specifically bit.ly
 */
export function normalizeUrl(url: string): string {
  if (!url) return url;
  let fixed = String(url).trim();
  if (fixed.includes('bit.ly') && !fixed.startsWith('http')) {
    fixed = 'https://' + fixed;
  }
  return fixed.replace(/^http:\/\//i, 'https://');
}

/**
 * Classifies a company into one of the 5 Bento buckets.
 */
export function classifyCompany(c: PESCECompanySchema): string {
  if (!c) return "Regular";
  const hc = String(c.employee_size || "");
  const nature = String(c.nature_of_company || "");
  const stack = String(c.tech_stack || "");
  const year = parseInt(String(c.incorporation_year || "0"));

  if (TIER1_KEYWORDS.some(k => safeIncludes(hc, k) || safeIncludes(nature, k)) || safeIncludes(hc, "10,000")) {
    return "Marquee";
  }
  if (PRODUCT_KEYWORDS.some(k => safeIncludes(nature, k) || safeIncludes(stack, k))) {
    return "Super Dream";
  }
  if (year >= 2017) return "Dream";

  return "Regular";
}

/**
 * Standardizes Revenue strings to $XX.X B/M format.
 */
export function normalizeRevenue(val: any): string | null {
  const str = String(val || "").trim();
  if (!str || str === "null" || str === "undefined") return null;
  
  // If already formatted like "$10.5 B", return it
  if (str.startsWith("$") && (str.endsWith("B") || str.endsWith("M"))) return str;

  const numMatch = str.match(/([\d.]+)/);
  if (!numMatch) return str;
  const num = parseFloat(numMatch[1]);

  const lowerStr = str.toLowerCase();
  if (lowerStr.includes("billion") || lowerStr.includes(" b")) return `$${num.toFixed(1)} B`;
  if (lowerStr.includes("million") || lowerStr.includes(" m")) return `$${num.toFixed(1)} M`;
  
  // Default to Billion for large numbers (> 100) or assume Million for small ones
  return num > 100 ? `$${num.toFixed(1)} M` : `$${num.toFixed(1)} B`;
}

/**
 * Normalizes company data according to the Zero-Dash Policy.
 */
export function normalizeCompanyData(c: PESCECompanySchema): PESCECompanySchema {
  if (!c) return {} as PESCECompanySchema;
  const normalized = { ...c };

  // 1. Auto-Classification
  // We only override if the current category is "Pending", "N/A", or empty.
  const currentCat = String(c.category || "").toLowerCase();
  if (!currentCat || currentCat === "pending" || currentCat === "n/a" || currentCat === "intelligence node") {
    normalized.category = classifyCompany(c);
  }

  // 2. Headcount Standardization
  if (normalized.employee_size) {
    const hc = String(normalized.employee_size);
    if (safeIncludes(hc, "10k") || safeIncludes(hc, "10,000")) normalized.employee_size = "10,000 - 50,000";
    else if (safeIncludes(hc, "50k") || safeIncludes(hc, "50,000")) normalized.employee_size = "50,000+";
    else if (safeIncludes(hc, "5k") || safeIncludes(hc, "5,000")) normalized.employee_size = "5,000 - 10,000";
    else if (safeIncludes(hc, "1k") || safeIncludes(hc, "1,000")) normalized.employee_size = "1,000 - 5,000";
  }

  // 3. Revenue Normalization
  if (normalized.annual_revenue) {
    normalized.annual_revenue = normalizeRevenue(normalized.annual_revenue) || normalized.annual_revenue;
  }


  // 5. Title Case Normalization
  if (normalized.name) normalized.name = toTitleCase(normalized.name);
  if (normalized.short_name) normalized.short_name = toTitleCase(normalized.short_name);
  if (normalized.category) normalized.category = toTitleCase(normalized.category);
  if (normalized.nature_of_company) normalized.nature_of_company = toTitleCase(normalized.nature_of_company);

  // 6. Zero-Dash Policy (Empty States)
  const FALLBACK = "Analyzing Archive...";
  const fields = Object.keys(normalized) as Array<keyof PESCECompanySchema>;
  fields.forEach(f => {
    // @ts-ignore
    const val = normalized[f];
    if (val === null || val === undefined || val === "" || val === "null" || val === "undefined" || val === "—") {
      // @ts-ignore
      normalized[f] = FALLBACK;
    }
  });

  return normalized;
}

/**
 * Extracts the leading number from rubric strings like '9-EV' or '4-CU'.
 * Default fallback is 3 for MS2 nodes without a rubric.
 */
export function getScoreValue(rubric: string | null | undefined): number {
  if (!rubric) return 3;
  const match = String(rubric).match(/^(\d+)/);
  if (match) {
    return parseInt(match[1], 10);
  }
  return 3;
}
