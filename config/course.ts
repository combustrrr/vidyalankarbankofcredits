/**
 * Course Configuration
 * 
 * Contains configuration for course-related settings
 */

// Course types
export type CourseType = 'Theory' | 'Practical';

// Credit system configuration
export const creditSystem = {
  minCreditsPerCourse: 1,
  maxCreditsPerCourse: 5,
  defaultCredits: 3,
  
  // Credit hour calculation
  theoryMultiplier: 1.0,
  practicalMultiplier: 0.5,
  
  // Credit allocation limits
  maxTheoryCourses: 8,
  maxPracticalCourses: 4,
  
  // Credit validation
  validateCredits: (credits: number): boolean => {
    return credits >= creditSystem.minCreditsPerCourse && 
           credits <= creditSystem.maxCreditsPerCourse;
  }
};

// Course degree options
export const degrees = [
  'BTech',
  'MTech',
  'BSc',
  'MSc',
  'PhD'
];

// Course branch options
export const branches = [
  'Computer Science',
  'Information Technology',
  'Electronics',
  'Mechanical',
  'Chemical',
  'Civil',
  'Electrical'
];

// Course type options
export const courseTypes: CourseType[] = [
  'Theory',
  'Practical'
];

// Course semester options
export const semesters = Array.from({ length: 8 }, (_, i) => i + 1);

// Helper functions
export const getMaxCreditsForSemester = (semester: number): number => {
  if (semester <= 2) return 20;
  if (semester <= 4) return 22;
  if (semester <= 6) return 24;
  return 26;
};