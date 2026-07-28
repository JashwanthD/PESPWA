import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useCompanyById } from "@/hooks/useCompanyIntelligence";
import { ArrowLeft, Workflow, HelpCircle, Target, Clock, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_dashboard/companies/$id/process")({
  component: CompanyHiringProcess,
});

function CompanyHiringProcess() {
  const { id } = useParams({ from: "/_dashboard/companies/$id/process" });
  const { data: company, loading } = useCompanyById(Number(id));

  // Mock Rounds based on schema
  const rounds = [
    { id: 1, name: "Round 1: Aptitude & Online Coding", duration: "90 min", skills: ["DSA", "Aptitude", "Mental Math"], questions: "15 MCQs + 2 Medium Coding (Arrays/Strings)" },
    { id: 2, name: "Round 2: Technical Interview I", duration: "60 min", skills: ["OOP", "DBMS", "Java/Python"], questions: "Live coding on Linked Lists and SQL Joins." },
    { id: 3, name: "Round 3: Technical Interview II", duration: "60 min", skills: ["System Design", "OS", "Networking"], questions: "Design a URL shortener or rate limiter." },
    { id: 4, name: "Round 4: HR & Behavioral", duration: "30 min", skills: ["Communication", "Culture Fit"], questions: "Standard behavioral questions; past projects deep-dive." },
  ];

  if (loading) return <div className="p-20 text-center animate-pulse text-[var(--muted)] uppercase tracking-widest font-black">Decrypting Recruitment Pathway...</div>;
  if (!company) return <div>Node Null.</div>;

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8">
      <nav>
        <Link to="/companies/$id" params={{ id }} className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to {company.short_name || company.name}
        </Link>
      </nav>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-[var(--foreground)] uppercase tracking-tight">Recruitment Pathway</h1>
        <p className="text-[10px] text-[var(--muted)] uppercase tracking-[0.4em] font-black">Process Sequence / 2025-26 Cycle</p>
      </div>

      <div className="relative pl-12 space-y-12 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--border)] before:z-0">
        {rounds.map((round, idx) => (
          <motion.div 
            key={round.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="relative z-10"
          >
            {/* Timeline Node */}
            <div className="absolute -left-[53px] top-0 h-10 w-10 rounded-full bg-[var(--background)] border-4 border-[var(--border)] flex items-center justify-center text-[var(--foreground)] font-black text-xs shadow-xl animate-pulse">
              {idx + 1}
            </div>

            {/* Card */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8 space-y-6 hover:border-indigo-500/30 transition-all group">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-xl font-bold text-[var(--foreground)] uppercase tracking-tight group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors">
                  {round.name}
                </h3>
                <div className="flex items-center gap-2 text-[var(--muted)] text-[10px] font-black uppercase tracking-widest">
                  <Clock className="h-3.5 w-3.5 text-indigo-550 dark:text-indigo-400" /> {round.duration}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-indigo-550 dark:text-indigo-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Skills Evaluated</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {round.skills.map(skill => (
                      <span key={skill} className="px-2 py-1 bg-indigo-500/5 border border-indigo-500/20 rounded text-[9px] font-bold text-indigo-600 dark:text-indigo-300 uppercase tracking-widest">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-indigo-550 dark:text-indigo-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Intelligence Brief</span>
                  </div>
                  <p className="text-xs text-[var(--muted)] leading-relaxed font-medium">
                    {round.questions}
                  </p>
                </div>
              </div>

              {/* Status footer */}
              <div className="pt-4 border-t border-[var(--border)]/50 flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500/50" />
                <span className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)]/50">Standard Pattern Verified</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
