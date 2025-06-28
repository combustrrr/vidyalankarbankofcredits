/**
 * Core Types for Vidyalankar Credits System
 */

// Student Types
export interface Student {
  id: string;
  roll_number: string;
  first_name: string;
  last_name: string;
  full_name: string;
  legal_name: string;
  degree: string;
  branch: string;
  division: string;
  semester: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface StudentRegistrationData {
  roll_number: string;
  password: string;
  first_name: string;
  last_name: string;
  full_name: string;
  legal_name: string;
  degree: string;
  branch: string;
  division: string;
}

export interface StudentLoginData {
  roll_number: string;
  password: string;
}

// Course Types
export interface Course {
  id: string;
  course_code: string;
  title: string;
  type: 'Theory' | 'Practical';
  credits: number;
  semester: number;
  degree: string;
  branch: string;
  vertical: string;
  basket: string;
  created_at: string;
}

export interface CourseCreationData {
  course_code: string;
  title: string;
  type: 'Theory' | 'Practical';
  credits: number;
  semester: number;
  degree: string;
  branch: string;
  vertical: string;
  basket: string;
}

// Completed Course Types
export interface CompletedCourse {
  id: string;
  student_id: string;
  course_id: string;
  semester: number;
  credit_awarded: number;
  completed_at: string;
  courses: Course;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Program Structure Types
export interface Vertical {
  code: string;
  name: string;
}

export interface Basket {
  code: string;
  name: string;
  vertical: string;
}

export interface ProgramStructure {
  vertical: string;
  basket: string;
  semester: number;
  recommended_credits: number;
}

// Pagination Types
export interface PaginatedResult<T> {
  data: T[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginationOptions {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Filter Options
export interface CourseFilterOptions {
  semester?: number;
  vertical?: string;
  basket?: string;
  type?: 'Theory' | 'Practical';
  degree?: string;
  branch?: string;
}
