import React, { useState } from "react";
import { AlumniResource } from "@/data/mockPlacementData";
import { useRealtimeResources } from "@/hooks/useRealtimeResources";
import { toast } from "sonner";
import { 
  BookOpen, Plus, ExternalLink, User, 
  Building, Calendar, Flame, Github, 
  Compass, HelpCircle, FileText 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function InterviewVault() {
  const { resources, addResource, isSubmitting } = useRealtimeResources();
  
  // Form State
  const [alumniName, setAlumniName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [url, setUrl] = useState("");
  const [resourceType, setResourceType] = useState<AlumniResource["resource_type"]>("leetcode");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!alumniName.trim() || !companyName.trim() || !description.trim()) {
      toast.error("Please fill in all required fields (Alumni Name, Company, and Description).");
      return;
    }

    if (resourceType !== "custom_question" && !url.trim()) {
      toast.error("Please provide a URL for this resource type.");
      return;
    }

    addResource({
      alumni_name: alumniName,
      company_name: companyName,
      resource_type: resourceType,
      url: url.trim() || null,
      description: description,
    });
    
    // Reset Form
    setAlumniName("");
    setCompanyName("");
    setUrl("");
    setDescription("");
    setResourceType("leetcode");
  };

  const getBadgeStyle = (type: AlumniResource["resource_type"]) => {
    switch (type) {
      case "leetcode":
        return {
          bg: "bg-amber-500/10 border-amber-500/20",
          text: "text-amber-600 dark:text-amber-400",
          accent: "border-amber-500/30",
          icon: Flame,
          label: "LeetCode"
        };
      case "github":
        return {
          bg: "bg-slate-400/10 border-slate-400/20",
          text: "text-slate-700 dark:text-slate-300",
          accent: "border-slate-400/30",
          icon: Github,
          label: "GitHub"
        };
      case "article":
        return {
          bg: "bg-purple-500/10 border-purple-500/20",
          text: "text-purple-600 dark:text-purple-400",
          accent: "border-purple-500/30",
          icon: FileText,
          label: "Article"
        };
      case "custom_question":
        return {
          bg: "bg-emerald-500/10 border-emerald-500/20",
          text: "text-emerald-600 dark:text-emerald-400",
          accent: "border-emerald-500/30",
          icon: HelpCircle,
          label: "Custom Q"
        };
      default:
        return {
          bg: "bg-zinc-500/10 border-zinc-500/20",
          text: "text-zinc-600 dark:text-zinc-400",
          accent: "border-zinc-500/30",
          icon: Compass,
          label: "Resource"
        };
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Form Section */}
      <div className="lg:col-span-1">
        <div className="bg-surface border border-border rounded-3xl p-6 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
          
          <div className="space-y-1">
            <h3 className="text-lg font-black text-foreground uppercase tracking-tight flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" /> Share Interview Intel
            </h3>
            <p className="text-[10px] text-muted uppercase tracking-widest font-bold">Submit questions or prep materials</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted">Your Name (Alumni)</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={alumniName}
                  onChange={(e) => setAlumniName(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl py-2.5 pl-9 pr-4 text-xs text-foreground placeholder:text-muted/40 focus:outline-none focus:ring-1 focus:ring-primary/50"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted">Target Company</label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
                <input
                  type="text"
                  placeholder="e.g. Microsoft"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl py-2.5 pl-9 pr-4 text-xs text-foreground placeholder:text-muted/40 focus:outline-none focus:ring-1 focus:ring-primary/50"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted">Resource Type</label>
              <select
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value as AlumniResource["resource_type"])}
                className="w-full bg-background border border-border rounded-xl py-2.5 px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer"
              >
                <option value="leetcode" className="bg-background text-foreground">LeetCode Discussion Link</option>
                <option value="github" className="bg-background text-foreground">GitHub Prep Repository</option>
                <option value="article" className="bg-background text-foreground">Article (Medium / Tech Blog)</option>
                <option value="custom_question" className="bg-background text-foreground">Custom Interview Question</option>
              </select>
            </div>

            {(resourceType as string) !== "custom_question" && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted">Resource URL</label>
                <div className="relative">
                  <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
                  <input
                    type="url"
                    placeholder="https://example.com/resource"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl py-2.5 pl-9 pr-4 text-xs text-foreground placeholder:text-muted/40 focus:outline-none focus:ring-1 focus:ring-primary/50"
                    required={(resourceType as string) !== "custom_question"}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted">Intel Details / Description</label>
              <textarea
                placeholder="Detail the interview rounds, questions asked, or general advice..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-xs text-foreground placeholder:text-muted/40 focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[var(--foreground)] text-[var(--background)] rounded-xl py-2 text-xs font-black uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all shadow-xl shadow-indigo-500/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="h-3 w-3 border-2 border-[var(--background)] border-t-transparent rounded-full animate-spin" />
                  Broadcasting...
                </>
              ) : (
                "Submit Intelligence"
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Grid Section */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-foreground uppercase tracking-tight flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" /> Interview Data Vault
            </h3>
            <p className="text-[10px] text-muted uppercase tracking-widest font-bold">
              {resources.length} Alumni nodes indexed
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 max-h-[640px] overflow-y-auto pr-2 scrollbar-thin">
          <AnimatePresence mode="popLayout">
            {resources.map((resource) => {
              const style = getBadgeStyle(resource.resource_type);
              const BadgeIcon = style.icon;

              return (
                <motion.div
                  key={resource.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="bg-surface border border-border rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all duration-300 hover:border-border-hover hover:-translate-y-0.5 shadow-md"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex justify-between items-start gap-2">
                      <div className="space-y-1">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[8px] font-black uppercase tracking-wider ${style.bg} ${style.text} ${style.accent}`}>
                          <BadgeIcon className="h-2.5 w-2.5" />
                          {style.label}
                        </span>
                        <h4 className="text-sm font-black text-foreground uppercase tracking-tight mt-1">{resource.company_name}</h4>
                      </div>
                      <span className="text-[9px] font-mono text-muted/60 flex items-center gap-1">
                        <Calendar className="h-2.5 w-2.5" /> {resource.date_added}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-foreground/80 leading-relaxed font-medium whitespace-pre-line line-clamp-4">
                      {resource.description}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <span className="text-[9px] text-muted font-bold uppercase tracking-widest flex items-center gap-1">
                      <User className="h-3 w-3 text-primary/50" /> By {resource.alumni_name}
                    </span>

                    {resource.url && (
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[9px] font-black uppercase tracking-widest text-primary hover:opacity-80 transition-colors flex items-center gap-1.5"
                      >
                        Source URL <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
