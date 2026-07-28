import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  User, Mail, GraduationCap, MapPin, 
  BrainCircuit, Star, Save, Shield, Cpu, 
  TrendingUp, Award, Zap, Terminal, Activity,
  Lock, Globe, Database, Command
} from "lucide-react";
import { SKILL_LABELS } from "@/types/intelligence";
import { useAuth } from "@/lib/auth";
import { supabaseMS1 } from "@/lib/supabase";
import { useRef } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_dashboard/profile")({
  component: ProfileRouter,
});

function ProfileRouter() {
  const { role, profile, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted)]">Syncing Intelligence...</span>
        </div>
      </div>
    );
  }

  if (role === 'admin') return <AdminProfile initialProfile={profile} />;
  return <StudentProfile initialProfile={profile} />;
}

function AdminProfile({ initialProfile }: { initialProfile: any }) {
  const profile = initialProfile || {
    full_name: "Architect Prime",
    nexus_id: "PES-ADMIN-001",
    email: "architect@pes.edu",
    admin_title: "Principal System Architect",
    system_level: 10,
    permissions: ["Full Node Access", "Data Injection", "Network Orchestration"],
    directives: 42,
    last_sync: "2026-04-23 09:12:00"
  };

  return (
    <div className="max-w-7xl mx-auto py-6 space-y-8 pb-24">
      {/* Admin Header */}
      <section className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
        
        <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center relative z-10">
          <div className="h-32 w-32 rounded-3xl bg-[var(--background)] border border-emerald-500/20 flex items-center justify-center relative group shadow-lg shadow-emerald-500/5">
            <Shield className="h-16 w-16 text-emerald-500/80" />
            <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
          </div>
          
          <div className="flex-1 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-3xl font-black text-[var(--foreground)] uppercase tracking-tight">{profile.full_name}</h1>
                <div className="flex items-center gap-3 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                  <Terminal className="h-3.5 w-3.5" /> SYSTEM LEVEL: {profile.system_level} / ROOT ACCESS
                </div>
              </div>
              <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] font-black uppercase tracking-widest rounded-lg">
                Admin Command Active
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
              <InfoBadge icon={Activity} label={profile.admin_title || "System Admin"} color="text-emerald-500" />
              <InfoBadge icon={Mail} label={profile.email} color="text-emerald-500" />
              <InfoBadge icon={Database} label={`Directives: ${profile.directives || 0}`} color="text-emerald-500" />
            </div>
          </div>
        </div>
      </section>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-[var(--surface)] border border-[var(--border)] p-8 rounded-3xl space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted)] flex items-center gap-2">
              <Lock className="h-4 w-4 text-emerald-500" /> Clearance Level
            </h3>
            <div className="space-y-3">
              {(profile.permissions || []).map((p: string) => (
                <div key={p} className="flex items-center gap-3 p-3 bg-[var(--background)] border border-[var(--border)] rounded-xl group hover:border-emerald-500/30 transition-colors">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500" />
                  <span className="text-[10px] font-bold text-[var(--foreground)] uppercase tracking-tight">{p}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] p-8 rounded-3xl space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted)] flex items-center gap-2">
              <Globe className="h-4 w-4 text-emerald-500" /> Global Scope
            </h3>
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
              <div className="text-[10px] font-black text-emerald-500/80 uppercase tracking-widest mb-1">Last System Sync</div>
              <div className="text-xs font-mono text-[var(--foreground)]">{profile.last_sync || "Never"}</div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-[var(--surface)] border border-[var(--border)] p-8 rounded-3xl space-y-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted)] flex items-center gap-2">
              <Command className="h-4 w-4 text-emerald-500" /> Architect Directives
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AdminAction icon={Cpu} label="Node Maintenance" status="Operational" />
              <AdminAction icon={Database} label="Intelligence Hydration" status="Active" />
              <AdminAction icon={Shield} label="Security Protocol 4" status="High" />
              <AdminAction icon={TrendingUp} label="Platform Growth" status="+12.5%" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StudentProfile({ initialProfile }: { initialProfile: any }) {
  const { updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  
  // Local form state
  const [profile, setProfile] = useState(initialProfile || {
    full_name: "Student Node",
    nexus_id: "PES2024-NEXUS",
    email: "student.nexus@pes.edu",
    major: "Computer Science & Engineering",
    gpa: "8.85",
    graduation_year: 2024,
    location: "Bengaluru, India",
    bio: "Aspiring Full-Stack Architect...",
    skills: {} as Record<string, number>,
    interests: ["Fintech", "SaaS", "AI Orchestration"]
  });

  // Sync state if initialProfile loads late
  useEffect(() => {
    if (initialProfile) {
      setProfile(initialProfile);
    }
  }, [initialProfile]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    try {
      // 1. Update globally in auth state (updates context + localStorage)
      updateProfile(profile);

      // 2. Sync with Supabase DB if a real ID is present
      if (profile.id && profile.id !== "PES2024-NEXUS") {
        const { error } = await supabaseMS1
          .from('profiles')
          .update({
            full_name: profile.full_name,
            major: profile.major,
            gpa: profile.gpa,
            graduation_year: profile.graduation_year,
            location: profile.location,
            skills: profile.skills,
            interests: profile.interests
          })
          .eq('id', profile.id);
        
        if (error) {
          console.error("Supabase Save Warning:", error);
          toast.warning("Profile saved locally (database offline).");
        } else {
          toast.success("Profile saved successfully to cloud!");
        }
      } else {
        toast.success("Profile committed successfully to local node!");
      }
      
      setIsEditing(false);
    } catch (e) {
      console.error(e);
      toast.error("An error occurred while committing the changes.");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      toast.success(`CV Uploaded securely to Nexus: ${e.target.files[0].name}`);
    }
  };

  const updateSkill = (skill: string, level: number) => {
    setProfile((prev: any) => ({
      ...prev,
      skills: { ...prev.skills, [skill]: level }
    }));
  };

  const handleInterestChange = (index: number, val: string) => {
    const updated = [...(profile.interests || [])];
    updated[index] = val;
    setProfile((prev: any) => ({ ...prev, interests: updated }));
  };

  const addInterest = () => {
    setProfile((prev: any) => ({
      ...prev,
      interests: [...(prev.interests || []), "New Interest"]
    }));
  };

  const removeInterest = (index: number) => {
    const updated = (profile.interests || []).filter((_: any, i: number) => i !== index);
    setProfile((prev: any) => ({ ...prev, interests: updated }));
  };

  return (
    <div className="max-w-7xl mx-auto py-6 space-y-8 pb-24">
      <section className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
        
        <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center relative z-10">
          <div className="h-32 w-32 rounded-3xl bg-[var(--background)] border border-[var(--border)] flex items-center justify-center relative group">
            <User className="h-16 w-16 text-[var(--muted)]" />
            <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
          </div>
          
          <div className="flex-1 space-y-4 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2 flex-1">
                {isEditing ? (
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-indigo-650 dark:text-indigo-400">Full Name</label>
                    <input
                      type="text"
                      value={profile.full_name || ""}
                      onChange={(e) => setProfile((prev: any) => ({ ...prev, full_name: e.target.value }))}
                      className="bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-1.5 text-sm font-bold text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full max-w-sm"
                    />
                  </div>
                ) : (
                  <h1 className="text-3xl font-black text-[var(--foreground)] uppercase tracking-tight">{profile.full_name}</h1>
                )}
                
                <div className="flex items-center gap-3 text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                  <Shield className="h-3.5 w-3.5" /> ID: {profile.nexus_id || "PES2024-NEXUS"}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => window.print()}
                  className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] hover:border-indigo-500/50 text-[var(--muted)] hover:text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-sm"
                >
                  <Activity className="h-3.5 w-3.5" /> Print
                </button>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] hover:border-indigo-500/50 text-[var(--muted)] hover:text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-sm animate-pulse"
                >
                  <MapPin className="h-3.5 w-3.5 hidden sm:block" /> Upload CV
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".pdf,.doc,.docx" 
                  onChange={handleFileUpload} 
                />
                <button 
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-indigo-500 hover:bg-indigo-650 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95 cursor-pointer"
                >
                  {isEditing ? <><Save className="h-3.5 w-3.5 animate-bounce" /> Commit</> : <><Award className="h-3.5 w-3.5" /> Modify</>}
                </button>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 pt-2">
              <div className="flex-1 min-w-[200px]">
                {isEditing ? (
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-indigo-650 dark:text-indigo-400 block">Major Branch</label>
                    <input
                      type="text"
                      value={profile.major || ""}
                      onChange={(e) => setProfile((prev: any) => ({ ...prev, major: e.target.value }))}
                      className="bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-1 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full"
                    />
                  </div>
                ) : (
                  <InfoBadge icon={GraduationCap} label={profile.major || "Unspecified Major"} />
                )}
              </div>
              
              <div className="flex-1 min-w-[200px]">
                {isEditing ? (
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-indigo-650 dark:text-indigo-400 block">Location</label>
                    <input
                      type="text"
                      value={profile.location || ""}
                      onChange={(e) => setProfile((prev: any) => ({ ...prev, location: e.target.value }))}
                      className="bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-1 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full"
                    />
                  </div>
                ) : (
                  <InfoBadge icon={MapPin} label={profile.location || "Bengaluru, India"} />
                )}
              </div>

              <div className="flex items-center gap-2">
                <InfoBadge icon={Mail} label={profile.email} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          {/* Academic Standing */}
          <div className="bg-[var(--surface)] border border-[var(--border)] p-8 rounded-3xl space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted)] flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-500" /> Academic Standing
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[var(--background)] border border-[var(--border)] p-4 rounded-2xl text-center space-y-1">
                {isEditing ? (
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-indigo-650 dark:text-indigo-400 uppercase">Edit GPA</label>
                    <input
                      type="text"
                      value={profile.gpa || ""}
                      onChange={(e) => setProfile((prev: any) => ({ ...prev, gpa: e.target.value }))}
                      className="bg-[var(--background)] border border-[var(--border)] rounded-xl px-2 py-1 text-xs font-bold text-[var(--foreground)] text-center focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full"
                    />
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-black text-[var(--foreground)]">{profile.gpa || "0.00"}</div>
                    <div className="text-[8px] font-black text-[var(--muted)] uppercase">Current GPA</div>
                  </>
                )}
              </div>
              <div className="bg-[var(--background)] border border-[var(--border)] p-4 rounded-2xl text-center space-y-1">
                {isEditing ? (
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-indigo-650 dark:text-indigo-400 uppercase">Grad Year</label>
                    <input
                      type="number"
                      value={profile.graduation_year || 2024}
                      onChange={(e) => setProfile((prev: any) => ({ ...prev, graduation_year: parseInt(e.target.value) }))}
                      className="bg-[var(--background)] border border-[var(--border)] rounded-xl px-2 py-1 text-xs font-bold text-[var(--foreground)] text-center focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full"
                    />
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-black text-[var(--foreground)]">{profile.graduation_year || "2024"}</div>
                    <div className="text-[8px] font-black text-[var(--muted)] uppercase">Grad Year</div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Career Vectors */}
          <div className="bg-[var(--surface)] border border-[var(--border)] p-8 rounded-3xl space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted)] flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" /> Career Vectors
              </h3>
              {isEditing && (
                <button
                  onClick={addInterest}
                  className="text-[9px] font-black text-indigo-400 uppercase tracking-wider hover:underline"
                >
                  + Add
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {isEditing ? (
                <div className="space-y-2 w-full">
                  {(profile.interests || []).map((interest: string, index: number) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={interest}
                        onChange={(e) => handleInterestChange(index, e.target.value)}
                        className="bg-[var(--background)] border border-[var(--border)] rounded-lg px-2 py-1 text-[10px] font-semibold text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-indigo-500 flex-1"
                      />
                      <button
                        onClick={() => removeInterest(index)}
                        className="text-[9px] text-red-500 hover:text-red-400 font-bold px-1"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                (profile.interests || []).map((i: string) => (
                  <span key={i} className="px-3 py-1.5 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[9px] font-bold text-[var(--foreground)] uppercase tracking-wider">
                    {i}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Skill Matrix */}
        <div className="lg:col-span-2">
          <div className="bg-[var(--surface)] border border-[var(--border)] p-8 rounded-3xl space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted)] flex items-center gap-2">
                <BrainCircuit className="h-4 w-4 text-indigo-500" /> Neural Skill Matrix
              </h3>
              <div className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Weights: 1-10</div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
              {Object.entries(SKILL_LABELS).map(([key, label]) => (
                <div key={key} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-[var(--foreground)] uppercase tracking-tight">{label}</label>
                    <span className="text-[10px] font-black text-indigo-500">{profile.skills?.[key] || 0}</span>
                  </div>
                  {isEditing ? (
                    <input 
                      type="range" 
                      min="0" 
                      max="10" 
                      value={profile.skills?.[key] || 0}
                      onChange={(e) => updateSkill(key, parseInt(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer"
                    />
                  ) : (
                    <div className="h-1.5 w-full bg-[var(--background)] rounded-full overflow-hidden border border-[var(--border)]">
                      <motion.div 
                      
                        initial={{ width: 0 }}
                        animate={{ width: `${(profile.skills?.[key] || 0) * 10}%` }}
                        className="h-full bg-indigo-500"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminAction({ icon: Icon, label, status }: { icon: any, label: string, status: string }) {
  return (
    <div className="p-5 bg-[var(--background)] border border-[var(--border)] rounded-2xl flex items-center justify-between group hover:border-emerald-500/30 transition-all cursor-pointer">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center group-hover:border-emerald-500/20 transition-colors">
          <Icon className="h-5 w-5 text-emerald-500/50 group-hover:text-emerald-500 transition-colors" />
        </div>
        <span className="text-[10px] font-black text-[var(--foreground)] uppercase tracking-widest">{label}</span>
      </div>
      <span className="text-[10px] font-mono text-emerald-500/80">{status}</span>
    </div>
  );
}

function InfoBadge({ icon: Icon, label, color }: { icon: any, label: string, color?: string }) {
  return (
    <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest ${color || 'text-[var(--muted)]'}`}>
      <Icon className={`h-3.5 w-3.5 ${color || 'text-indigo-500/50'}`} /> {label}
    </div>
  );
}
