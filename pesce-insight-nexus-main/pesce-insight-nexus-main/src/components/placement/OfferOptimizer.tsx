import React, { useState, useMemo } from "react";
import { 
  Calculator, TrendingUp, CheckCircle, AlertTriangle, 
  HelpCircle, Building, MapPin, Sparkles, Code 
} from "lucide-react";
import { motion } from "framer-motion";

import { useRealtimeMarket } from "@/hooks/useRealtimeMarket";

interface OfferState {
  headlineCtc: number; // in LPA
  baseSalary: number;  // in LPA
  cityTier: string;
  techStack: string;
}

export function OfferOptimizer() {
  const { cityTiers, techStacks } = useRealtimeMarket();
  
  const [offerA, setOfferA] = useState<OfferState>({
    headlineCtc: 12,
    baseSalary: 10,
    cityTier: "tier1",
    techStack: "modern"
  });

  const [offerB, setOfferB] = useState<OfferState>({
    headlineCtc: 14,
    baseSalary: 9,
    cityTier: "tier2",
    techStack: "standard"
  });

  // Calculate calculations for an offer
  const calculateOfferMetrics = (offer: OfferState) => {
    const baseAmount = offer.baseSalary * 100000;
    const monthlyBase = baseAmount / 12;
    // Estimated Monthly Take-Home = Base Salary / 12 (minus generic 20% tax deduction)
    const monthlyTakeHome = monthlyBase * 0.8;
    const livingCost = cityTiers[offer.cityTier]?.cost || 0;
    const disposableIncome = Math.max(0, monthlyTakeHome - livingCost);

    // 3-Year Projection = Base CTC (using Headline CTC for compounded overall compensation growth) compounded annually
    const growthRate = techStacks[offer.techStack]?.growth || 0;
    const year0 = offer.headlineCtc;
    const year1 = year0 * (1 + growthRate);
    const year2 = year1 * (1 + growthRate);
    const year3 = year2 * (1 + growthRate);

    return {
      monthlyTakeHome,
      livingCost,
      disposableIncome,
      trajectory: [year0, year1, year2, year3]
    };
  };

  const metricsA = useMemo(() => calculateOfferMetrics(offerA), [offerA]);
  const metricsB = useMemo(() => calculateOfferMetrics(offerB), [offerB]);

  // Determine winner
  const winningAnalysis = useMemo(() => {
    // Score based on Year 3 CTC (65% weight) + annual disposable income (35% weight)
    const scoreA = (metricsA.trajectory[3] * 100000) * 0.65 + (metricsA.disposableIncome * 12) * 0.35;
    const scoreB = (metricsB.trajectory[3] * 100000) * 0.65 + (metricsB.disposableIncome * 12) * 0.35;

    const diffPercent = Math.abs((scoreA - scoreB) / Math.max(scoreA, scoreB)) * 100;
    
    if (scoreA > scoreB) {
      return {
        winner: "A" as const,
        scoreDiff: diffPercent,
        explanation: `Offer A is the optimal long-term choice. Due to its modern tech stack (${techStacks[offerA.techStack]?.label || "selected stack"}) and higher base salary, it yields a ${diffPercent.toFixed(1)}% higher valuation when accounting for compound growth and disposable income.`
      };
    } else if (scoreB > scoreA) {
      return {
        winner: "B" as const,
        scoreDiff: diffPercent,
        explanation: `Offer B wins! Its higher Headline CTC compounded over 3 years combined with lower cost of living in ${cityTiers[offerB.cityTier]?.label || "selected location"} makes it the superior choice financially.`
      };
    } else {
      return {
        winner: "tie" as const,
        scoreDiff: 0,
        explanation: "Both offers carry equal financial and career value weight. Decide based on brand sentiment and work-life balance."
      };
    }
  }, [offerA, offerB, metricsA, metricsB]);

  // Handle slide adjustments and validate base <= headline
  const handleOfferChange = (
    target: "A" | "B",
    field: keyof OfferState,
    value: any
  ) => {
    const updateFn = target === "A" ? setOfferA : setOfferB;
    updateFn((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "headlineCtc" && next.baseSalary > next.headlineCtc) {
        next.baseSalary = next.headlineCtc;
      }
      if (field === "baseSalary" && next.baseSalary > next.headlineCtc) {
        next.headlineCtc = next.baseSalary;
      }
      return next;
    });
  };

  // Helper to format currency in INR
  const formatINR = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val);
  };

  // Custom SVG line chart plotting YoY trajectories
  const renderSVGTrajectory = () => {
    const maxVal = Math.max(...metricsA.trajectory, ...metricsB.trajectory, 10);
    const minVal = Math.min(...metricsA.trajectory, ...metricsB.trajectory, 3);
    const range = maxVal - minVal;

    const getCoords = (yearIndex: number, val: number) => {
      const x = 50 + (yearIndex * 150); // 4 points spaced 150px
      // scale y: 0 is top (height=160), so we invert
      const y = 140 - ((val - minVal) / range) * 100; 
      return { x, y };
    };

    const pointsA = metricsA.trajectory.map((val, i) => getCoords(i, val));
    const pointsB = metricsB.trajectory.map((val, i) => getCoords(i, val));

    const pathD = (points: { x: number; y: number }[]) => 
      `M ${points[0].x} ${points[0].y} ` + 
      points.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ");

    return (
      <svg className="w-full h-44 overflow-visible" viewBox="0 0 550 180">
        {/* Grids */}
        {[0, 1, 2, 3].map((i) => (
          <line 
            key={i} 
            x1={50 + i * 150} 
            y1={10} 
            x2={50 + i * 150} 
            y2={150} 
            strokeDasharray="4"
            className="stroke-[var(--border)]"
          />
        ))}
        {/* Y-axis helper grids */}
        <line x1={40} y1={140} x2={510} y2={140} className="stroke-[var(--border)]" />
        <line x1={40} y1={40} x2={510} y2={40} className="stroke-[var(--border)]" />

        {/* Labels for Years */}
        {["Current", "Year 1", "Year 2", "Year 3"].map((yLabel, i) => (
          <text 
            key={i} 
            x={50 + i * 150} 
            y={170} 
            fontSize="9" 
            fontWeight="bold" 
            textAnchor="middle"
            className="uppercase tracking-widest fill-[var(--muted)]"
          >
            {yLabel}
          </text>
        ))}

        {/* Paths */}
        <path d={pathD(pointsA)} fill="none" stroke="url(#gradientA)" strokeWidth="3" className="drop-shadow-[0_4px_8px_rgba(99,102,241,0.3)]" />
        <path d={pathD(pointsB)} fill="none" stroke="url(#gradientB)" strokeWidth="3" className="drop-shadow-[0_4px_8px_rgba(34,211,238,0.3)]" />

        {/* Points & Labels A */}
        {pointsA.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="5" fill="#6366f1" className="stroke-[var(--background)]" strokeWidth="2" />
            <text x={p.x} y={p.y - 10} fontSize="9" fontWeight="black" textAnchor="middle" className="fill-indigo-650 dark:fill-indigo-300">
              {metricsA.trajectory[i].toFixed(1)}L
            </text>
          </g>
        ))}

        {/* Points & Labels B */}
        {pointsB.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="5" fill="#22d3ee" className="stroke-[var(--background)]" strokeWidth="2" />
            <text x={p.x} y={p.y + 16} fontSize="9" fontWeight="black" textAnchor="middle" className="fill-cyan-600 dark:fill-cyan-300">
              {metricsB.trajectory[i].toFixed(1)}L
            </text>
          </g>
        ))}

        {/* Gradients */}
        <defs>
          <linearGradient id="gradientA" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>
          <linearGradient id="gradientB" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
        </defs>
      </svg>
    );
  };

  return (
    <div className="space-y-8 bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 lg:p-8 shadow-2xl relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-xl font-black text-[var(--foreground)] uppercase tracking-tight flex items-center gap-2">
            <Calculator className="h-5 w-5 text-indigo-550 dark:text-indigo-400" /> Offer Optimizer Simulator
          </h3>
          <p className="text-[10px] text-[var(--muted)] uppercase tracking-widest font-black">
            Compounded YoY Trajectory & Net Living Cost Analysis
          </p>
        </div>
        <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-605 dark:text-indigo-400 text-[9px] font-black uppercase tracking-widest rounded-full">
          Predictive AI Model Active
        </div>
      </div>

      {/* Simulator Inputs Grid */}
      <div className="grid md:grid-cols-2 gap-8 pt-4">
        {/* Offer A Panel */}
        <div className="bg-[var(--background)]/60 border border-[var(--border)] rounded-2xl p-6 space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-[var(--border)]/60">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-indigo-500" />
              <span className="text-xs font-black text-[var(--foreground)] uppercase tracking-wider">OFFER A</span>
            </div>
            <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/20">
              {offerA.headlineCtc} LPA
            </span>
          </div>

          <div className="space-y-5">
            {/* Headline CTC */}
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
                <span>Headline CTC</span>
                <span className="text-[var(--foreground)]">{offerA.headlineCtc} Lakhs</span>
              </div>
              <input
                type="range"
                min="3"
                max="50"
                step="0.5"
                value={offerA.headlineCtc}
                onChange={(e) => handleOfferChange("A", "headlineCtc", parseFloat(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer h-1 bg-[var(--border)] rounded-lg appearance-none"
              />
            </div>

            {/* Base Salary */}
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
                <span>Base Salary (Base CTC)</span>
                <span className="text-[var(--foreground)]">{offerA.baseSalary} Lakhs</span>
              </div>
              <input
                type="range"
                min="3"
                max="50"
                step="0.5"
                value={offerA.baseSalary}
                onChange={(e) => handleOfferChange("A", "baseSalary", parseFloat(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer h-1 bg-[var(--border)] rounded-lg appearance-none"
              />
            </div>

            {/* City Selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">City / Cost of Living</label>
              <select
                value={offerA.cityTier}
                onChange={(e) => handleOfferChange("A", "cityTier", e.target.value)}
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl py-2 px-3 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-indigo-500/50 cursor-pointer"
              >
                {Object.entries(cityTiers).map(([key, data]) => (
                  <option key={key} value={key} className="bg-[var(--surface)] text-[var(--foreground)]">{(data as any).label} - Cost: {formatINR((data as any).cost)}/mo</option>
                ))}
              </select>
            </div>

            {/* Tech Stack */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Tech Stack / Compounding growth</label>
              <select
                value={offerA.techStack}
                onChange={(e) => handleOfferChange("A", "techStack", e.target.value)}
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl py-2 px-3 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-indigo-500/50 cursor-pointer"
              >
                {Object.entries(techStacks).map(([key, data]) => (
                  <option key={key} value={key} className="bg-[var(--surface)] text-[var(--foreground)]">{(data as any).label} ({(data as any).desc})</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Offer B Panel */}
        <div className="bg-[var(--background)]/60 border border-[var(--border)] rounded-2xl p-6 space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-[var(--border)]/60">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-cyan-455" style={{ backgroundColor: "#22d3ee" }} />
              <span className="text-xs font-black text-[var(--foreground)] uppercase tracking-wider">OFFER B</span>
            </div>
            <span className="text-xs font-black text-cyan-605 dark:text-cyan-400 uppercase tracking-wider bg-cyan-500/5 px-2 py-0.5 rounded border border-cyan-500/20">
              {offerB.headlineCtc} LPA
            </span>
          </div>

          <div className="space-y-5">
            {/* Headline CTC */}
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
                <span>Headline CTC</span>
                <span className="text-[var(--foreground)]">{offerB.headlineCtc} Lakhs</span>
              </div>
              <input
                type="range"
                min="3"
                max="50"
                step="0.5"
                value={offerB.headlineCtc}
                onChange={(e) => handleOfferChange("B", "headlineCtc", parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer h-1 bg-[var(--border)] rounded-lg appearance-none"
              />
            </div>

            {/* Base Salary */}
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
                <span>Base Salary (Base CTC)</span>
                <span className="text-[var(--foreground)]">{offerB.baseSalary} Lakhs</span>
              </div>
              <input
                type="range"
                min="3"
                max="50"
                step="0.5"
                value={offerB.baseSalary}
                onChange={(e) => handleOfferChange("B", "baseSalary", parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer h-1 bg-[var(--border)] rounded-lg appearance-none"
              />
            </div>

            {/* City Selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">City / Cost of Living</label>
              <select
                value={offerB.cityTier}
                onChange={(e) => handleOfferChange("B", "cityTier", e.target.value)}
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl py-2 px-3 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-cyan-500/50 cursor-pointer"
              >
                {Object.entries(cityTiers).map(([key, data]) => (
                  <option key={key} value={key} className="bg-[var(--surface)] text-[var(--foreground)]">{(data as any).label} - Cost: {formatINR((data as any).cost)}/mo</option>
                ))}
              </select>
            </div>

            {/* Tech Stack */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Tech Stack / Compounding growth</label>
              <select
                value={offerB.techStack}
                onChange={(e) => handleOfferChange("B", "techStack", e.target.value)}
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl py-2 px-3 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-cyan-500/50 cursor-pointer"
              >
                {Object.entries(techStacks).map(([key, data]) => (
                  <option key={key} value={key} className="bg-[var(--surface)] text-[var(--foreground)]">{(data as any).label} ({(data as any).desc})</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Disposable Income Bars Comparison */}
      <div className="grid md:grid-cols-3 gap-6 pt-4 border-t border-[var(--border)]">
        <div className="md:col-span-2 space-y-4">
          <h4 className="text-xs font-black text-[var(--foreground)] uppercase tracking-wider">Estimated Monthly Disposable Income</h4>
          <div className="space-y-4">
            {/* Offer A Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-[var(--muted)]">
                <span className="flex items-center gap-1.5 text-[var(--muted)]"><span className="h-1.5 w-1.5 rounded-full bg-indigo-500" /> Offer A</span>
                <span className="text-indigo-600 dark:text-indigo-300 font-mono">{formatINR(metricsA.disposableIncome)}/mo</span>
              </div>
              <div className="h-4 bg-[var(--background)] border border-[var(--border)] rounded-lg overflow-hidden flex">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (metricsA.disposableIncome / 150000) * 100)}%` }}
                  className="h-full bg-gradient-to-r from-indigo-650 to-indigo-500 flex items-center justify-end px-2"
                />
              </div>
              <div className="flex justify-between text-[8px] font-mono text-[var(--muted)]/50 tracking-tighter">
                <span>Take-home: {formatINR(metricsA.monthlyTakeHome)}/mo</span>
                <span>Living cost: {formatINR(metricsA.livingCost)}/mo</span>
              </div>
            </div>

            {/* Offer B Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-[var(--muted)]">
                <span className="flex items-center gap-1.5 text-[var(--muted)]"><span className="h-1.5 w-1.5 rounded-full bg-cyan-500" /> Offer B</span>
                <span className="text-cyan-600 dark:text-cyan-300 font-mono">{formatINR(metricsB.disposableIncome)}/mo</span>
              </div>
              <div className="h-4 bg-[var(--background)] border border-[var(--border)] rounded-lg overflow-hidden flex">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (metricsB.disposableIncome / 150000) * 100)}%` }}
                  className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 flex items-center justify-end px-2"
                />
              </div>
              <div className="flex justify-between text-[8px] font-mono text-[var(--muted)]/50 tracking-tighter">
                <span>Take-home: {formatINR(metricsB.monthlyTakeHome)}/mo</span>
                <span>Living cost: {formatINR(metricsB.livingCost)}/mo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Winner Highlight Card */}
        <div className="md:col-span-1 bg-[var(--background)]/60 border border-[var(--border)] rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-6 -right-6 w-16 h-16 bg-indigo-500/10 blur-xl rounded-full" />
          <div className="space-y-3">
            <span className="text-[8px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 flex items-center gap-1 w-fit">
              <Sparkles className="h-2.5 w-2.5" /> WINNING RECOMMENDATION
            </span>
            <div className="space-y-1">
              <h4 className="text-lg font-black text-[var(--foreground)] uppercase tracking-tight flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                {winningAnalysis.winner === "tie" ? "TIE VALUE" : `OFFER ${winningAnalysis.winner}`}
              </h4>
              <p className="text-[10px] text-[var(--muted)] font-bold uppercase tracking-widest">
                {winningAnalysis.winner !== "tie" && `Delta score: +${winningAnalysis.scoreDiff.toFixed(1)}%`}
              </p>
            </div>
            <p className="text-[10px] text-[var(--muted)] leading-relaxed font-semibold">
              {winningAnalysis.explanation}
            </p>
          </div>
        </div>
      </div>

      {/* Trajectory Custom SVG Chart */}
      <div className="bg-[var(--background)]/40 border border-[var(--border)] rounded-2xl p-5 space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-xs font-black text-[var(--foreground)] uppercase tracking-wider">3-Year Projected CTC Growth Curve</h4>
          <div className="flex items-center gap-4 text-[9px] font-bold uppercase tracking-wider text-[var(--muted)]">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-indigo-500" /> Offer A ({techStacks[offerA.techStack]?.label || "Stack"})</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-cyan-500" /> Offer B ({techStacks[offerB.techStack]?.label || "Stack"})</span>
          </div>
        </div>
        <div className="w-full flex justify-center bg-[var(--background)] p-4 border border-[var(--border)] rounded-xl">
          {renderSVGTrajectory()}
        </div>
      </div>
    </div>
  );
}
