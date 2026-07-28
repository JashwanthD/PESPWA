import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { getScoreValue } from "@/utils/normalizers";
import type { PESCECompanySchema } from "@/types/intelligence";

interface BattleRadarProps {
  company: PESCECompanySchema;
}

/**
 * BattleRadar — Displays 12 axes from the skill_matrix.json.
 * Styles the polygon based on the predominant rubric tier (EV, AS, AP, CU).
 */
export function BattleRadar({ company }: BattleRadarProps) {
  // Map the 12 rubric parameters from the company object
  const skillLevels = company.skill_levels || {};

  const axes = [
    { key: "coding", label: "Coding" },
    { key: "dsa", label: "DSA" },
    { key: "oop", label: "OOP" },
    { key: "aptitude", label: "Aptitude" },
    { key: "communication", label: "Communication" },
    { key: "ai_native", label: "AI Native" },
    { key: "devops", label: "DevOps" },
    { key: "sql", label: "SQL" },
    { key: "software_eng", label: "Soft. Eng." },
    { key: "system_design", label: "Sys Design" },
    { key: "networking", label: "Networking" },
    { key: "os", label: "OS" },
  ];

  const SKILL_KEY_MAP: Record<string, string> = {
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
  const data = axes.map((axis) => {
    const longKey = SKILL_KEY_MAP[axis.key] || axis.key;
    const rawValue = 
      (company.skill_levels as any)?.[longKey] || 
      (company.skill_levels as any)?.[axis.key] || 
      (company as any)[axis.key] || 
      "";
    return {
      axis: axis.label,
      value: getScoreValue(rawValue),
      raw: rawValue,
    };
  });

  // Calculate the predominant tier for styling
  const maxScore = Math.max(...data.map((d) => d.value));
  
  let stroke = "oklch(0.63 0.04 260)"; // Muted zinc default
  let fill = "oklch(0.63 0.04 260)";
  let glow = "none";

  if (maxScore >= 9) {
    // EV (9-10): Outer glow polygon
    stroke = "oklch(0.7 0.2 20)"; // Vivid gold/orange
    fill = "oklch(0.7 0.2 20)";
    glow = "0 0 15px oklch(0.7 0.2 20 / 0.5)";
  } else if (maxScore >= 7) {
    // AS (7-8): Standard emerald polygon
    stroke = "oklch(0.72 0.17 153)"; // Emerald
    fill = "oklch(0.72 0.17 153)";
  } else if (maxScore >= 5) {
    // AP (5-6): Amber polygon
    stroke = "oklch(0.79 0.15 75)"; // Amber
    fill = "oklch(0.79 0.15 75)";
  } else {
    // CU (1-4): Muted zinc polygon
    stroke = "oklch(0.63 0.04 260)"; // Muted zinc
    fill = "oklch(0.63 0.04 260)";
  }

  return (
    <div className="h-80 w-full relative group">
      <div 
        className="absolute inset-0 rounded-full opacity-20 blur-3xl transition-all duration-700 group-hover:opacity-30" 
        style={{ backgroundColor: fill }} 
      />
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="70%">
          <PolarGrid stroke="oklch(1 0 0 / 0.1)" />
          <PolarAngleAxis
            dataKey="axis"
            tick={{ fill: "var(--muted)", fontSize: 10, fontWeight: 700, letterSpacing: "0.05em" }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 10]}
            tick={false}
            axisLine={false}
          />
          <Radar
            name="Skills"
            dataKey="value"
            stroke={stroke}
            fill={fill}
            fillOpacity={0.4}
            strokeWidth={2}
            dot={{ r: 3, fill: stroke, fillOpacity: 1 }}
            style={{ filter: glow !== "none" ? `drop-shadow(${glow})` : undefined }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
