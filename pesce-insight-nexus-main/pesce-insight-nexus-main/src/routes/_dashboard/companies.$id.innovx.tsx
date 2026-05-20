import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useCompanyById } from "@/hooks/useCompanyIntelligence";
import { ArrowLeft, Rocket, TrendingUp, Users, Cpu, Star, Zap, Layers } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_dashboard/companies/$id/innovx")({
  component: CompanyInnovX,
});

function CompanyInnovX() {
  const { id } = useParams({ from: "/_dashboard/companies/$id/innovx" });
  const { data: company, loading } = useCompanyById(Number(id));

  // Mock InnovX Data based on schema
  const trends = ["GenAI Optimization", "Zero Trust Architecture", "Quantum-Safe Crypto", "Sustainability Tech"];
  const projects = [
    { tier: "Foundational", name: "Internal AI Copilot", desc: "Automating routine developer workflows using fine-tuned Llama nodes.", icon: Layers },
    { tier: "Advanced", name: "Edge Intelligence Fabric", desc: "Distributed inference engine for low-power IoT devices in the tech corridor.", icon: Cpu },
    { tier: "Breakthrough", name: "Project Nexus-G", desc: "Next-gen global settlement network using sovereign blockchain tech.", icon: Zap },
  ];

  if (loading) return <div className="p-20 text-center animate-pulse text-zinc-500 uppercase tracking-widest font-black">Hydrating InnovX Labs...</div>;
  if (!company) return <div>Node Null.</div>;

  return (
    <div className="max-w-7xl mx-auto py-6 space-y-12 pb-24">
      <nav>
        <Link to="/companies/$id" params={{ id }} className="text-zinc-500 hover:text-white transition-colors flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to {company.short_name || company.name}
        </Link>
      </nav>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-white uppercase tracking-tight">InnovX Intelligence</h1>
        <p className="text-[10px] text-zinc-500 uppercase tracking-[0.4em] font-black">Future Roadmap / R&D Pipeline</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left: Trends & Competitors */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-3xl space-y-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-indigo-500" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Industry Trends</h3>
            </div>
            <div className="space-y-4">
              {trends.map(t => (
                <div key={t} className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-2xl group hover:border-indigo-500/30 transition-all">
                  <span className="text-xs font-bold text-white uppercase tracking-tight">{t}</span>
                  <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-3xl space-y-6">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-indigo-500" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Key Competitors</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {company.key_competitors?.split(",").map(c => (
                <span key={c} className="px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-[10px] font-bold text-zinc-500 uppercase tracking-widest hover:text-white hover:border-indigo-500/50 transition-all cursor-default">
                  {c.trim()}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Project Tiers */}
        <div className="lg:col-span-8 space-y-6">
           <div className="flex items-center gap-3 px-2">
              <Rocket className="h-5 w-5 text-indigo-500" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Student Innovation Projects</h3>
            </div>
            
            <div className="space-y-4">
              {projects.map((p, idx) => {
                const Icon = p.icon;
                return (
                  <motion.div 
                    key={p.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="group relative bg-zinc-900/40 border border-zinc-800 p-8 rounded-3xl hover:bg-zinc-800/40 hover:border-indigo-500/50 transition-all duration-300 flex flex-col sm:flex-row gap-8 items-start shadow-xl"
                  >
                    <div className="h-16 w-16 shrink-0 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                      <Icon className="h-8 w-8 text-indigo-500" />
                    </div>
                    <div className="space-y-3 flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                          p.tier === 'Foundational' ? 'text-zinc-500 border-zinc-800 bg-zinc-900' :
                          p.tier === 'Advanced' ? 'text-indigo-400 border-indigo-500/30 bg-indigo-500/5' :
                          'text-amber-500 border-amber-500/30 bg-amber-500/5'
                        }`}>
                          {p.tier}
                        </span>
                        <h4 className="text-xl font-bold text-white uppercase tracking-tight truncate">{p.name}</h4>
                      </div>
                      <p className="text-sm text-zinc-400 leading-relaxed font-medium">
                        {p.desc}
                      </p>
                    </div>
                    <div className="absolute top-8 right-8">
                       <Star className="h-4 w-4 text-zinc-800 group-hover:text-amber-500/40 transition-colors" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
        </div>
      </div>
    </div>
  );
}
