import { useMemo } from 'react';
import type { PESCECompanySchema } from '@/types/intelligence';

export interface StudentProfile {
  skills: Record<string, number>; // skill_key: rating (1-10)
  interests: string[];
  gpa: number;
}

// Default student profile - will be synced with localStorage
const DEFAULT_STUDENT: StudentProfile = {
  skills: {
    react_js: 9,
    node_js: 8,
    python: 7,
    typescript: 9,
    sql: 6,
    aws: 5,
    docker: 4,
    problem_solving: 9,
    communication: 8,
  },
  interests: ['Fintech', 'SaaS', 'AI'],
  gpa: 8.5
};

export function useProfileSync() {
  const student = useMemo(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem("nexus_student_profile") : null;
    return saved ? JSON.parse(saved) : DEFAULT_STUDENT;
  }, []);

  // Logic to calculate match percentage between student and company
  const calculateMatch = (company: PESCECompanySchema) => {
    if (!company.skill_levels) return 0;

    const companySkills = company.skill_levels as Record<string, number>;
    let totalScore = 0;
    let maxPossible = 0;

    // Iterate through company's required skills
    Object.entries(companySkills).forEach(([skill, requiredLevel]) => {
      if (requiredLevel === 0) return;

      const studentLevel = student.skills[skill] || 0;
      
      // Calculate weighted score: student proficiency relative to requirement
      // If student exceeds requirement, they get full points for that skill
      const skillScore = Math.min(studentLevel / requiredLevel, 1) * requiredLevel;
      
      totalScore += skillScore;
      maxPossible += requiredLevel;
    });

    if (maxPossible === 0) return 0;
    
    // Final percentage with a small boost for shared category/interests (simplified)
    const basePercentage = (totalScore / maxPossible) * 100;
    const interestBoost = company.nature_of_company && student.interests.some((i: string) => company.nature_of_company?.includes(i)) ? 5 : 0;
    
    return Math.min(Math.round(basePercentage + interestBoost), 100);
  };

  return {
    student,
    calculateMatch
  };
}
