import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { startCompanyGeneration, getRunStatus, RunResponse } from "@/services/agentService";
import { Progress } from "@/components/ui/progress";

export function AddCompanyModal({ onCompanyAdded }: { onCompanyAdded?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [companyContext, setCompanyContext] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [runId, setRunId] = useState<string | null>(null);
  const [status, setStatus] = useState<RunResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (runId && isOpen) {
      intervalId = setInterval(async () => {
        try {
          const currentStatus = await getRunStatus(runId);
          setStatus(currentStatus);
          
          if (currentStatus.status === "completed" || currentStatus.status === "failed") {
            clearInterval(intervalId);
            setIsSubmitting(false);
            if (currentStatus.status === "completed" && onCompanyAdded) {
               // Add a slight delay before triggering reload so user can see 100% completion
               setTimeout(() => {
                 onCompanyAdded();
                 // Automatically close or reset state here if desired
               }, 1500);
            }
          }
        } catch (err: any) {
          setError(err.message || "Failed to fetch status");
          setIsSubmitting(false);
          clearInterval(intervalId);
        }
      }, 2000); // Poll every 2 seconds
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [runId, isOpen, onCompanyAdded]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;

    setIsSubmitting(true);
    setError(null);
    setStatus(null);
    setRunId(null);

    try {
      let parsedContext = {};
      if (companyContext.trim()) {
        try {
          parsedContext = JSON.parse(companyContext);
        } catch (e) {
          // If not valid JSON, treat as unstructured text under a 'notes' key
          parsedContext = { notes: companyContext };
        }
      }

      const response = await startCompanyGeneration({
        company_name: companyName,
        company_context: parsedContext,
      });

      setRunId(response.run_id);
      setStatus(response);
    } catch (err: any) {
      setError(err.message || "Failed to start company generation");
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && isSubmitting) {
      // Prevent closing while submitting to avoid breaking the polling silently
      return;
    }
    setIsOpen(open);
    if (!open) {
      // Reset state on close
      setCompanyName("");
      setCompanyContext("");
      setStatus(null);
      setRunId(null);
      setError(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20">
          <Plus className="mr-2 h-4 w-4" />
          Add Company
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-[var(--surface)] border-[var(--border)] text-[var(--foreground)]">
        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase tracking-tight">Add Intelligence Node</DialogTitle>
        </DialogHeader>
        
        {!runId ? (
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-[10px] uppercase tracking-widest font-black text-[var(--muted)]">Company Name</Label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Acme Corp"
                required
                className="bg-[var(--background)] border-[var(--border)] focus-visible:ring-indigo-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="companyContext" className="text-[10px] uppercase tracking-widest font-black text-[var(--muted)]">Additional Context (Optional)</Label>
              <Textarea
                id="companyContext"
                value={companyContext}
                onChange={(e) => setCompanyContext(e.target.value)}
                placeholder="Enter context as JSON or plain text..."
                className="bg-[var(--background)] border-[var(--border)] focus-visible:ring-indigo-500 min-h-[100px]"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" disabled={!companyName.trim() || isSubmitting} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
              Initialize Pipeline
            </Button>
          </form>
        ) : (
          <div className="space-y-6 mt-6 pb-4">
            <div className="flex flex-col items-center justify-center space-y-4">
              {status?.status === "completed" ? (
                <div className="h-16 w-16 bg-green-500/10 rounded-full flex items-center justify-center text-green-500">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
              ) : status?.status === "failed" ? (
                <div className="h-16 w-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500">
                  <AlertCircle className="h-8 w-8" />
                </div>
              ) : (
                <div className="h-16 w-16 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-500">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              )}
              
              <div className="text-center space-y-1">
                <h3 className="font-black text-lg uppercase tracking-tight">
                  {status?.status === "completed" ? "Pipeline Complete" 
                   : status?.status === "failed" ? "Pipeline Failed" 
                   : "Processing Pipeline..."}
                </h3>
                <p className="text-xs text-[var(--muted)] font-medium">
                  {status?.progress_stage || "Initializing..."}
                </p>
              </div>
            </div>

            <div className="space-y-2 w-full max-w-[80%] mx-auto">
              <Progress value={status?.progress_percentage || 0} className="h-2" />
              <div className="flex justify-between text-[10px] font-black uppercase text-[var(--muted)]">
                <span>{status?.progress_percentage || 0}%</span>
                <span>{status?.status}</span>
              </div>
            </div>
            
            {status?.message && (
              <div className={`p-3 rounded-lg text-sm text-center ${status.status === 'failed' ? 'bg-red-500/10 text-red-400' : 'bg-[var(--background)] text-[var(--muted)]'}`}>
                {status.message}
              </div>
            )}
            
            {(status?.status === "completed" || status?.status === "failed") && (
              <Button onClick={() => handleOpenChange(false)} variant="outline" className="w-full mt-4">
                Close
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
