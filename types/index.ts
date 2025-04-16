// Common interfaces used throughout the application

export interface Course {
  id: string;
  name: string;
  description: string;
  duration: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}