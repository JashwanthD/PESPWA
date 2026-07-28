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
  
  const hc = String(c.employee_size || "").toLowerCase();
  const nature = String(c.nature_of_company || "").toLowerCase();
  const cat = String(c.category || "").toLowerCase();
  const stack = String(c.tech_stack || "").toLowerCase();
  const name = String(c.name || "").toLowerCase();
  const year = parseInt(String(c.incorporation_year || "0"));

  const combinedContext = `${hc} ${nature} ${cat} ${stack} ${name}`;

  if (
    TIER1_KEYWORDS.some(k => safeIncludes(combinedContext, k)) ||
    safeIncludes(hc, "10,000") || 
    safeIncludes(combinedContext, "tech giant") ||
    safeIncludes(combinedContext, "multinational") ||
    safeIncludes(combinedContext, "large cap") ||
    safeIncludes(cat, "tier-1 giant") ||
    SERVICE_GIANTS.some(k => safeIncludes(name, k))
  ) {
    return "Marquee";
  }

  if (
    PRODUCT_KEYWORDS.some(k => safeIncludes(combinedContext, k)) ||
    safeIncludes(combinedContext, "unicorn") ||
    safeIncludes(combinedContext, "quick commerce") ||
    safeIncludes(cat, "product hub")
  ) {
    return "Super Dream";
  }

  if (
    year >= 2017 || 
    safeIncludes(combinedContext, "startup") || 
    safeIncludes(combinedContext, "mid-size") ||
    safeIncludes(cat, "service ecosystem") ||
    safeIncludes(cat, "emerging startup") ||
    safeIncludes(combinedContext, "esports")
  ) {
    return "Dream";
  }

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
  // Force categorization into one of the 4 placement tiers
  const allowedCategories = ["marquee", "super dream", "dream", "regular"];
  const currentCat = String(c.category || "").toLowerCase();
  if (!allowedCategories.includes(currentCat)) {
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
  
  // Keep category exact matches for metrics checking
  if (normalized.category) {
    const validMap: Record<string, string> = {
      "marquee": "Marquee",
      "super dream": "Super Dream",
      "dream": "Dream",
      "regular": "Regular"
    };
    normalized.category = validMap[String(normalized.category).toLowerCase()] || "Regular";
  }

  if (normalized.nature_of_company) normalized.nature_of_company = toTitleCase(normalized.nature_of_company);

  // 5.5. Careers URL Resolution (Double-Safe)
  let cleanAppUrl = normalized.application_url;
  if (!cleanAppUrl || cleanAppUrl === "null" || cleanAppUrl === "undefined" || cleanAppUrl === "—" || cleanAppUrl === "Analyzing Archive...") {
    cleanAppUrl = "";
  }

  if (!cleanAppUrl) {
    let webUrl = normalized.website_url;
    if (!webUrl || webUrl === "null" || webUrl === "undefined" || webUrl === "—" || webUrl === "Analyzing Archive...") {
      const cleanName = String(normalized.short_name || normalized.name || "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
      webUrl = cleanName ? `https://www.${cleanName}.com` : "";
    }

    if (webUrl) {
      let cleanWebUrl = webUrl.trim();
      if (!cleanWebUrl.startsWith("http")) {
        cleanWebUrl = "https://" + cleanWebUrl;
      }
      cleanWebUrl = cleanWebUrl.replace(/\/+$/, "");

      const lowerName = String(normalized.name || normalized.short_name || "").toLowerCase();
      if (lowerName.includes("google")) normalized.application_url = "https://careers.google.com";
      else if (lowerName.includes("microsoft")) normalized.application_url = "https://careers.microsoft.com";
      else if (lowerName.includes("netflix")) normalized.application_url = "https://jobs.netflix.com";
      else if (lowerName.includes("apple")) normalized.application_url = "https://www.apple.com/careers/";
      else if (lowerName.includes("amazon")) normalized.application_url = "https://amazon.jobs";
      else if (lowerName.includes("ibm")) normalized.application_url = "https://www.ibm.com/careers";
      else if (lowerName.includes("samsung")) normalized.application_url = "https://www.samsung.com/careers";
      else if (lowerName.includes("tesla")) normalized.application_url = "https://www.tesla.com/careers";
      else if (lowerName.includes("blinkit")) normalized.application_url = "https://blinkit.com/careers";
      else if (lowerName.includes("glovo")) normalized.application_url = "https://careers.glovo.com";
      else if (lowerName.includes("globant")) normalized.application_url = "https://www.globant.com/careers";
      else if (lowerName.includes("globallogic")) normalized.application_url = "https://www.globallogic.com/careers";
      else if (lowerName.includes("tcs") || lowerName.includes("tata consultancy")) normalized.application_url = "https://www.tcs.com/careers";
      else if (lowerName.includes("infosys")) normalized.application_url = "https://www.infosys.com/careers.html";
      else if (lowerName.includes("wipro")) normalized.application_url = "https://careers.wipro.com";
      else if (lowerName.includes("cognizant")) normalized.application_url = "https://careers.cognizant.com";
      else if (lowerName.includes("accenture")) normalized.application_url = "https://www.accenture.com/careers";
      else normalized.application_url = `${cleanWebUrl}/careers`;
    } else {
      normalized.application_url = "https://careers.google.com"; // ultimate fallback
    }
  } else {
    // If we have an existing URL, ensure it starts with http
    let cleanApp = String(normalized.application_url).trim();
    if (cleanApp && !cleanApp.startsWith("http")) {
      normalized.application_url = "https://" + cleanApp;
    }
  }

  // 6. Zero-Dash Policy (Empty States)
  const FALLBACK = "Analyzing Archive...";
  const fields = Object.keys(normalized) as Array<keyof PESCECompanySchema>;
  fields.forEach(f => {
    if (f === "application_url") return; // Keep careers urls clean and functioning
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
