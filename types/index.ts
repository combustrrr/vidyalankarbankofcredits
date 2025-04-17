// Common interfaces used throughout the application

export interface Course {
  id: string;
  name: string;
  description?: string;
  duration?: string;
  createdAt: string;
  
  // New fields for the expanded course form
  code: string;
  title: string;
  type: string;
  credits: number;
  semester: number;
  degree: string;
  branch: string;
  vertical: string;
  basket: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}