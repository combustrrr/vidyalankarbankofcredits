/**
 * Main types definitions for the application
 */

// API Response Type
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
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
  structure_id?: string | null;
  created_at: string;
  completed?: boolean;
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

export interface CourseFilterOptions {
  semester?: number;
  vertical?: string;
  basket?: string;
  type?: 'Theory' | 'Practical';
  degree?: string;
  branch?: string;
}

// Program Structure Types
export interface ProgramStructure {
  id: string;
  vertical: string;
  semester: number;
  recommended_credits: number;
  created_at: string;
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

// Admin Authentication
export interface AdminAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// User and authentication related interfaces
export interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  createdAt: string;
}

export enum UserRole {
  Admin = 'admin',
  Student = 'student',
  Faculty = 'faculty'
}

// Form state interfaces
export interface FormState {
  isSubmitting: boolean;
  isSuccess: boolean;
  error: string | null;
}

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

// Completed Courses Types
export interface CompletedCourse {
  id: string;
  student_id: string;
  course_id: string;
  semester: number;
  credit_awarded: number;
  completed_at: string;
}
