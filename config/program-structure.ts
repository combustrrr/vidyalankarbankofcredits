/**
 * Program Structure Configuration
 * 
 * Contains configuration for program structure settings based on the credit distribution table
 */

// Program verticals - these are the sub-categories from the credit distribution table
export const verticals = [
  'BSC/ESC',          // Basic Science Course (BSC/ESC)
  'ESC',              // Engineering Science
  'PCC',              // Programme Core Course
  'PEC',              // Programme Elective Course
  'MDM',              // Multidisciplinary Minor
  'OE',               // Open Elective
  'VSEC',             // Vocational and Skill Enhancement Courses
  'AEC',              // Ability Enhancement Courses
  'EEMC',             // Entrepreneurship/ Economics/ Management
  'IKS',              // Indian Knowledge System
  'VEC',              // Value Education Courses
  'RM',               // Research Methodology
  'CEP/FP',           // Comm. Engg. Project/Field Project
  'Project',          // Project
  'Internship/OJT',   // Internship/OJT
  'CC'                // Co-Curricular Courses
];

// Course baskets - these represent the semesters
export const baskets = [
  'Semester 1',
  'Semester 2',
  'Semester 3',
  'Semester 4',
  'Semester 5',
  'Semester 6',
  'Semester 7',
  'Semester 8'
];

// Degree program structure
export interface DegreeStructure {
  name: string;
  totalSemesters: number;
  totalCreditsRequired: number;
  minCreditsPerSemester: number;
  maxCreditsPerSemester: number;
}

// Degree program structures
export const degreeStructures: Record<string, DegreeStructure> = {
  'BTech': {
    name: 'Bachelor of Technology',
    totalSemesters: 8,
    totalCreditsRequired: 162, // Updated to match the credit distribution table
    minCreditsPerSemester: 16,
    maxCreditsPerSemester: 28
  },
  'MTech': {
    name: 'Master of Technology',
    totalSemesters: 4,
    totalCreditsRequired: 80,
    minCreditsPerSemester: 16,
    maxCreditsPerSemester: 24
  },
  'PhD': {
    name: 'Doctor of Philosophy',
    totalSemesters: 6,
    totalCreditsRequired: 60,
    minCreditsPerSemester: 8,
    maxCreditsPerSemester: 16
  }
};

// Program structure credit recommendations based on the provided table
export interface VerticalCreditRecommendation {
  vertical: string;
  semesterCredits: Record<number, number>;
}

// Credit distribution table from the provided data
export const creditDistributionTable = [
  { vertical: 'BSC/ESC', semester1: 6, semester2: 3, semester3: 3, semester4: 3, semester5: 0, semester6: 0, semester7: 0, semester8: 0, total: 15 },
  { vertical: 'ESC', semester1: 6, semester2: 6, semester3: 0, semester4: 0, semester5: 0, semester6: 0, semester7: 0, semester8: 0, total: 12 },
  { vertical: 'PCC', semester1: 0, semester2: 0, semester3: 9, semester4: 12, semester5: 12, semester6: 9, semester7: 3, semester8: 0, total: 45 },
  { vertical: 'PEC', semester1: 0, semester2: 0, semester3: 0, semester4: 0, semester5: 3, semester6: 6, semester7: 9, semester8: 0, total: 18 },
  { vertical: 'MDM', semester1: 0, semester2: 2, semester3: 3, semester4: 3, semester5: 3, semester6: 3, semester7: 0, semester8: 0, total: 14 },
  { vertical: 'OE', semester1: 0, semester2: 0, semester3: 0, semester4: 0, semester5: 3, semester6: 0, semester7: 5, semester8: 0, total: 8 },
  { vertical: 'VSEC', semester1: 3, semester2: 3, semester3: 2, semester4: 0, semester5: 0, semester6: 0, semester7: 0, semester8: 0, total: 8 },
  { vertical: 'AEC', semester1: 3, semester2: 1, semester3: 0, semester4: 0, semester5: 0, semester6: 0, semester7: 0, semester8: 3, total: 7 },
  { vertical: 'EEMC', semester1: 0, semester2: 0, semester3: 0, semester4: 0, semester5: 3, semester6: 3, semester7: 3, semester8: 3, total: 12 },
  { vertical: 'IKS', semester1: 0, semester2: 2, semester3: 0, semester4: 0, semester5: 0, semester6: 0, semester7: 0, semester8: 0, total: 2 },
  { vertical: 'VEC', semester1: 3, semester2: 0, semester3: 0, semester4: 0, semester5: 0, semester6: 0, semester7: 0, semester8: 0, total: 3 },
  { vertical: 'RM', semester1: 0, semester2: 0, semester3: 0, semester4: 0, semester5: 0, semester6: 0, semester7: 0, semester8: 3, total: 3 },
  { vertical: 'CEP/FP', semester1: 0, semester2: 0, semester3: 0, semester4: 0, semester5: 0, semester6: 2, semester7: 0, semester8: 0, total: 2 },
  { vertical: 'Project', semester1: 0, semester2: 0, semester3: 0, semester4: 0, semester5: 0, semester6: 0, semester7: 0, semester8: 6, total: 6 },
  { vertical: 'Internship/OJT', semester1: 0, semester2: 0, semester3: 0, semester4: 0, semester5: 2, semester6: 2, semester7: 2, semester8: 6, total: 12 },
  { vertical: 'CC', semester1: 0, semester2: 2, semester3: 2, semester4: 0, semester5: 0, semester6: 0, semester7: 0, semester8: 0, total: 4 }
];

// Calculate semester totals
export const semesterTotals = {
  semester1: creditDistributionTable.reduce((sum, item) => sum + item.semester1, 0),
  semester2: creditDistributionTable.reduce((sum, item) => sum + item.semester2, 0),
  semester3: creditDistributionTable.reduce((sum, item) => sum + item.semester3, 0),
  semester4: creditDistributionTable.reduce((sum, item) => sum + item.semester4, 0),
  semester5: creditDistributionTable.reduce((sum, item) => sum + item.semester5, 0),
  semester6: creditDistributionTable.reduce((sum, item) => sum + item.semester6, 0),
  semester7: creditDistributionTable.reduce((sum, item) => sum + item.semester7, 0),
  semester8: creditDistributionTable.reduce((sum, item) => sum + item.semester8, 0),
};

// Transformed credit recommendations based on the provided table
export const creditRecommendations: VerticalCreditRecommendation[] = creditDistributionTable.map(item => ({
  vertical: item.vertical,
  semesterCredits: {
    1: item.semester1,
    2: item.semester2,
    3: item.semester3,
    4: item.semester4,
    5: item.semester5,
    6: item.semester6,
    7: item.semester7,
    8: item.semester8
  }
}));

// Function to get recommended credits for a vertical and semester
export const getRecommendedCredits = (vertical: string, semester: number): number => {
  const recommendation = creditRecommendations.find(rec => rec.vertical === vertical);
  
  if (!recommendation || !recommendation.semesterCredits[semester]) {
    return 0; // If not found, return 0 credits
  }
  
  return recommendation.semesterCredits[semester];
};

// Function to get total credits for a semester
export const getSemesterTotalCredits = (semester: number): number => {
  const semesterKey = `semester${semester}` as keyof typeof semesterTotals;
  return semesterTotals[semesterKey] || 0;
};