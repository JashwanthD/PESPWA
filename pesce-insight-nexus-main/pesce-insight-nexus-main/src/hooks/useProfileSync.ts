import { useMemo, useEffect } from 'react';
import type { PESCECompanySchema } from '@/types/intelligence';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { getScoreValue } from '@/utils/normalizers';

export interface StudentProfile {
  full_name?: string;
  nexus_id?: string;
  email?: string;
  major?: string;
  location?: string;
  skills: Record<string, number>; // skill_key: rating (1-10)
  interests: string[];
  gpa: number | string;
  graduation_year?: number;
}

export function useProfileSync() {
  const { profile, updateProfile, session } = useAuth();

  useEffect(() => {
    const channelName = `user-skills-changes-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'user_skills' },
        (payload: any) => {
          console.log('[Realtime] User skills updated:', payload.new);
          if (profile) {
            // Update the auth profile with the new skills
            // Handle both flat structure or nested JSON depending on DB schema
            const newSkills = payload.new.skills || payload.new;
            const updatedProfile = {
              ...profile,
              skills: {
                ...profile.skills,
                ...newSkills
              }
            };
            updateProfile(updatedProfile);
          }
        }
      )
      .subscribe((status: any) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Realtime] Subscribed to user_skills channel');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile, updateProfile]);

  const student = useMemo<StudentProfile>(() => {
    const defaultSkills = {
      coding: 8,
      data_structures_and_algorithms: 8,
      object_oriented_programming_and_design: 7,
      aptitude_and_problem_solving: 8,
      communication_skills: 9,
      ai_native_engineering: 6,
      devops_and_cloud: 5,
      sql_and_design: 7,
      software_engineering: 8,
      system_design_and_architecture: 6,
      computer_networking: 5,
      operating_system: 6,
    };

    if (profile) {
      const mergedSkills = { ...defaultSkills, ...(profile.skills || {}) };
      const hasAnyNonZero = Object.values(profile.skills || {}).some(val => Number(val) > 0);
      return {
        ...profile,
        skills: hasAnyNonZero ? mergedSkills : defaultSkills,
        interests: profile.interests && profile.interests.length > 0 ? profile.interests : ["Fintech", "SaaS", "AI Orchestration"],
        gpa: profile.gpa || "8.85"
      };
    }

    // Default student profile fallback
    return {
      full_name: "Jashwanth D",
      nexus_id: "PES2024-NEXUS",
      email: "jashwanth.d@pes.edu",
      major: "Computer Science & Engineering",
      gpa: "8.85",
      graduation_year: 2024,
      location: "Bengaluru, India",
      skills: defaultSkills,
      interests: ["Fintech", "SaaS", "AI Orchestration"]
    };
  }, [profile]);

  // Logic to calculate match percentage between student and company
  const calculateMatch = (company: PESCECompanySchema) => {
    if (!company.skill_levels) return 0;

    const companySkills = company.skill_levels as Record<string, any>;
    let totalScore = 0;
    let maxPossible = 0;

    // Iterate through company's required skills
    Object.entries(companySkills).forEach(([skill, rawLevel]) => {
      const requiredLevel = getScoreValue(rawLevel);
      if (requiredLevel === 0) return;

      const studentLevel = student.skills[skill] || 0;
      
      // Calculate weighted score: student proficiency relative to requirement
      // If student exceeds requirement, they get full points for that skill
      const skillScore = Math.min(studentLevel / requiredLevel, 1) * requiredLevel;
      
      totalScore += skillScore;
      maxPossible += requiredLevel;
    });

    if (maxPossible === 0) return 0;
    
    // Final percentage with a small boost for shared category/interests
    const basePercentage = (totalScore / maxPossible) * 100;
    const interestBoost = company.nature_of_company && student.interests?.some((i: string) => company.nature_of_company?.includes(i)) ? 5 : 0;
    
    return Math.min(Math.round(basePercentage + interestBoost), 100);
  };

  return {
    student,
    calculateMatch
  };
}

