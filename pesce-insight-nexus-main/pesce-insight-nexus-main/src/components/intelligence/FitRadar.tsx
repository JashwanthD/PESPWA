import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { toScore10 } from "@/types/intelligence";

interface FitRadarProps {
  skillRelevance?: string | null;
  aiLevel?: string | null;
  automation?: string | null;
  exposure?: string | null;
  workImpact?: string | null;
}

/**
 * PESCE Fit Radar — visualises 5 dimensions on a 0-10 scale.
 */
export function FitRadar({ skillRelevance, aiLevel, automation, exposure, workImpact }: FitRadarProps) {
  const data = [
    { axis: "Skill Relevance", value: toScore10(skillRelevance) },
    { axis: "AI/ML Adoption", value: toScore10(aiLevel) },
    { axis: "Automation", value: toScore10(automation) },
    { axis: "Exposure", value: toScore10(exposure) },
    { axis: "Work Impact", value: toScore10(workImpact) },
  ];

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="75%">
          <PolarGrid stroke="oklch(0.27 0.14 265 / 0.2)" />
          <PolarAngleAxis
            dataKey="axis"
            tick={{ fill: "oklch(0.27 0.14 265)", fontSize: 11, fontWeight: 600 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 10]}
            tick={{ fill: "oklch(0.48 0.04 260)", fontSize: 9 }}
            stroke="oklch(0.27 0.14 265 / 0.15)"
          />
          <Radar
            name="Fit"
            dataKey="value"
            stroke="oklch(0.78 0.13 85)"
            fill="oklch(0.78 0.13 85)"
            fillOpacity={0.45}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
