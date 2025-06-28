/**
 * Program Structure Data for Vidyalankar Credits System
 */

import { Vertical, Basket, ProgramStructure } from '@/types';

// Verticals (Academic Areas)
export const VERTICALS: Vertical[] = [
  { code: 'BSC', name: 'Basic Science' },
  { code: 'ESC', name: 'Engineering Science' },
  { code: 'PCC', name: 'Program Core Course' },
  { code: 'PEC', name: 'Program Elective Course' },
  { code: 'MDM', name: 'Multidisciplinary Minor' },
  { code: 'OE', name: 'Open Elective' },
  { code: 'VSEC', name: 'Vocational & Skill Enhancement' },
  { code: 'AEC', name: 'Ability Enhancement Course' },
  { code: 'EEMC', name: 'Entrepreneurship/Economics/Management' },
  { code: 'IKS', name: 'Indian Knowledge System' },
  { code: 'VEC', name: 'Value Education Course' },
  { code: 'CC', name: 'Co-Curricular Courses' },
  { code: 'RM', name: 'Research Methodology' },
  { code: 'CEP', name: 'Community Engineering Project' },
  { code: 'PROJ', name: 'Project' },
  { code: 'INTP', name: 'Internship/OJT' }
];

// Baskets (Course Categories within Verticals)
export const BASKETS: Basket[] = [
  // Basic Science
  { code: 'BSC', name: 'Basic Science', vertical: 'BSC' },
  { code: 'ESC', name: 'Engineering Science', vertical: 'ESC' },
  
  // Program Courses
  { code: 'PCC', name: 'Programme Core Course', vertical: 'PCC' },
  { code: 'PEC', name: 'Programme Elective Course', vertical: 'PEC' },
  
  // Multidisciplinary
  { code: 'MDM', name: 'Multidisciplinary Minor', vertical: 'MDM' },
  { code: 'OE', name: 'Open Elective', vertical: 'OE' },
  
  // Skills
  { code: 'VSEC', name: 'Vocational & Skill Enhancement Course', vertical: 'VSEC' },
  
  // Liberal Arts
  { code: 'AEC', name: 'Ability Enhancement Course', vertical: 'AEC' },
  { code: 'EEMC', name: 'Entrepreneurship/Economics/Management Course', vertical: 'EEMC' },
  { code: 'IKS', name: 'Indian Knowledge System', vertical: 'IKS' },
  { code: 'VEC', name: 'Value Education Course', vertical: 'VEC' },
  { code: 'CC', name: 'Co-Curricular Courses', vertical: 'CC' },
  
  // Research & Projects
  { code: 'RM', name: 'Research Methodology', vertical: 'RM' },
  { code: 'CEP', name: 'Community Engineering Project', vertical: 'CEP' },
  { code: 'PROJ', name: 'Project', vertical: 'PROJ' },
  { code: 'INTP', name: 'Internship/OJT', vertical: 'INTP' }
];

// Program Structure with Credit Distribution
export const PROGRAM_STRUCTURE: ProgramStructure[] = [
  // Semester 1
  { vertical: 'BSC', basket: 'BSC', semester: 1, recommended_credits: 6 },
  { vertical: 'ESC', basket: 'ESC', semester: 1, recommended_credits: 6 },
  { vertical: 'VSEC', basket: 'VSEC', semester: 1, recommended_credits: 3 },
  { vertical: 'AEC', basket: 'AEC', semester: 1, recommended_credits: 3 },
  { vertical: 'VEC', basket: 'VEC', semester: 1, recommended_credits: 3 },
  
  // Semester 2
  { vertical: 'BSC', basket: 'BSC', semester: 2, recommended_credits: 3 },
  { vertical: 'ESC', basket: 'ESC', semester: 2, recommended_credits: 6 },
  { vertical: 'VSEC', basket: 'VSEC', semester: 2, recommended_credits: 3 },
  { vertical: 'MDM', basket: 'MDM', semester: 2, recommended_credits: 2 },
  { vertical: 'AEC', basket: 'AEC', semester: 2, recommended_credits: 1 },
  { vertical: 'IKS', basket: 'IKS', semester: 2, recommended_credits: 2 },
  { vertical: 'CC', basket: 'CC', semester: 2, recommended_credits: 2 },
  
  // Semester 3
  { vertical: 'BSC', basket: 'BSC', semester: 3, recommended_credits: 3 },
  { vertical: 'PCC', basket: 'PCC', semester: 3, recommended_credits: 9 },
  { vertical: 'MDM', basket: 'MDM', semester: 3, recommended_credits: 3 },
  { vertical: 'VSEC', basket: 'VSEC', semester: 3, recommended_credits: 2 },
  { vertical: 'CC', basket: 'CC', semester: 3, recommended_credits: 2 },
  
  // Semester 4
  { vertical: 'BSC', basket: 'BSC', semester: 4, recommended_credits: 3 },
  { vertical: 'PCC', basket: 'PCC', semester: 4, recommended_credits: 12 },
  { vertical: 'MDM', basket: 'MDM', semester: 4, recommended_credits: 3 },
  
  // Semester 5
  { vertical: 'PCC', basket: 'PCC', semester: 5, recommended_credits: 12 },
  { vertical: 'PEC', basket: 'PEC', semester: 5, recommended_credits: 3 },
  { vertical: 'MDM', basket: 'MDM', semester: 5, recommended_credits: 3 },
  { vertical: 'OE', basket: 'OE', semester: 5, recommended_credits: 3 },
  { vertical: 'EEMC', basket: 'EEMC', semester: 5, recommended_credits: 3 },
  { vertical: 'INTP', basket: 'INTP', semester: 5, recommended_credits: 2 },
  
  // Semester 6
  { vertical: 'PCC', basket: 'PCC', semester: 6, recommended_credits: 9 },
  { vertical: 'PEC', basket: 'PEC', semester: 6, recommended_credits: 6 },
  { vertical: 'MDM', basket: 'MDM', semester: 6, recommended_credits: 3 },
  { vertical: 'EEMC', basket: 'EEMC', semester: 6, recommended_credits: 3 },
  { vertical: 'CEP', basket: 'CEP', semester: 6, recommended_credits: 2 },
  { vertical: 'INTP', basket: 'INTP', semester: 6, recommended_credits: 2 },
  
  // Semester 7
  { vertical: 'PCC', basket: 'PCC', semester: 7, recommended_credits: 3 },
  { vertical: 'PEC', basket: 'PEC', semester: 7, recommended_credits: 9 },
  { vertical: 'OE', basket: 'OE', semester: 7, recommended_credits: 5 },
  { vertical: 'EEMC', basket: 'EEMC', semester: 7, recommended_credits: 3 },
  { vertical: 'INTP', basket: 'INTP', semester: 7, recommended_credits: 2 },
  
  // Semester 8
  { vertical: 'AEC', basket: 'AEC', semester: 8, recommended_credits: 3 },
  { vertical: 'EEMC', basket: 'EEMC', semester: 8, recommended_credits: 3 },
  { vertical: 'RM', basket: 'RM', semester: 8, recommended_credits: 3 },
  { vertical: 'PROJ', basket: 'PROJ', semester: 8, recommended_credits: 6 },
  { vertical: 'INTP', basket: 'INTP', semester: 8, recommended_credits: 15 }
];

// Helper Functions
export function getVerticals(): Vertical[] {
  return VERTICALS;
}

export function getBasketsForVertical(verticalCode: string): Basket[] {
  return BASKETS.filter(basket => basket.vertical === verticalCode);
}

export function getRecommendedCredits(vertical: string, basket: string, semester: number): number {
  const structure = PROGRAM_STRUCTURE.find(
    s => s.vertical === vertical && s.basket === basket && s.semester === semester
  );
  return structure?.recommended_credits || 0;
}

export function getAllBaskets(): Basket[] {
  return BASKETS;
}

export function getProgramStructure(): ProgramStructure[] {
  return PROGRAM_STRUCTURE;
}

// Degree and Branch Options
export const DEGREES = [
  { code: 'BTech', name: 'Bachelor of Technology' },
  { code: 'MTech', name: 'Master of Technology' },
  { code: 'BSc', name: 'Bachelor of Science' },
  { code: 'MSc', name: 'Master of Science' }
];

export const BRANCHES = [
  { code: 'INFT', name: 'Information Technology' },
  { code: 'COMP', name: 'Computer Engineering' },
  { code: 'EXTC', name: 'Electronics & Telecommunication' },
  { code: 'MECH', name: 'Mechanical Engineering' },
  { code: 'CIVIL', name: 'Civil Engineering' },
  { code: 'ELEX', name: 'Electrical Engineering' }
];
