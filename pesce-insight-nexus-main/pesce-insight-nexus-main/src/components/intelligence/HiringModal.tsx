import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, HelpCircle, Briefcase, Info } from "lucide-react";

interface HiringRound {
  round_number: number;
  round_name: string;
  round_category: string;
  evaluation_type: string;
  assessment_mode: string;
  skill_sets?: {
    skill_set_code: string;
    typical_questions: string;
  }[];
}

interface JobRoleDetail {
  role_title: string;
  role_category: string;
  job_description: string;
  compensation: string;
  ctc_or_stipend: number;
  hiring_rounds: HiringRound[];
}

interface HiringModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyName: string;
  roles: JobRoleDetail[];
}

export function HiringModal({ isOpen, onClose, companyName, roles }: HiringModalProps) {
  // We'll focus on the first role for the timeline, or show all if nested
  const activeRole = roles?.[0];
  const rounds = activeRole?.hiring_rounds || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto glass-dark border-white/10 text-slate-white">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gold/20 text-gold">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black tracking-tight">Recruitment Journey</DialogTitle>
              <DialogDescription className="text-slate-white/60">
                Placement blueprint for {companyName}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {rounds.length > 0 ? (
          <div className="mt-6 space-y-8 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-[2px] before:bg-white/10">
            {rounds.map((round, idx) => (
              <div key={idx} className="relative pl-12">
                <div className="absolute left-0 top-1 h-9 w-9 rounded-full bg-mandya border-2 border-white/10 flex items-center justify-center z-10">
                  <span className="text-xs font-bold text-gold">{round.round_number}</span>
                </div>
                
                <div className="glass-dark border-white/5 p-4 rounded-xl space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-slate-white">{round.round_name}</h4>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <Badge variant="secondary" className="bg-white/5 text-[10px] uppercase tracking-wider h-5">
                          {round.round_category}
                        </Badge>
                        <Badge variant="outline" className="border-gold/30 text-gold text-[10px] uppercase tracking-wider h-5">
                          {round.assessment_mode}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {round.skill_sets && round.skill_sets.length > 0 && (
                    <div className="bg-black/20 rounded-lg p-3 border border-white/5">
                      <div className="flex items-center gap-2 mb-2 text-gold">
                        <Info className="h-3 w-3" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Candidate Pro-Tips</span>
                      </div>
                      {round.skill_sets.map((skill, sIdx) => (
                        <div key={sIdx} className="text-xs text-slate-white/80 leading-relaxed italic">
                          "Expect questions like: {skill.typical_questions}"
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center space-y-4">
            <HelpCircle className="h-12 w-12 text-slate-white/20 mx-auto" />
            <p className="text-slate-white/50 text-sm">No structured hiring rounds found for this node.</p>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between p-4 bg-gold/5 rounded-2xl border border-gold/10">
          <div className="text-xs">
            <div className="text-gold font-bold uppercase tracking-widest mb-1">Staging Goal</div>
            <div className="text-slate-white/70">Update your status for this placement cycle</div>
          </div>
          <Button className="bg-gold hover:bg-gold/80 text-mandya-deep font-bold rounded-xl shadow-lg shadow-gold/20">
            Direct Apply
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
