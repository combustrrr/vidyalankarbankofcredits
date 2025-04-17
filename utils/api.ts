/**
 * Client-side API utility
 * 
 * Provides a structured interface for making API calls from the frontend
 */
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { clientConfig } from '../config';
import { ApiResponse, CourseCreationData, Course, PaginatedResult, PaginationOptions, CourseFilterOptions, Student, StudentRegistrationData, StudentLoginData } from '../types';

// Create axios instance with default config
const api = axios.create({
  baseURL: clientConfig.apiUrl,
  timeout: clientConfig.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Error handler
const handleApiError = (error: AxiosError): never => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const data = error.response.data as any;
    throw new Error(data?.error?.message || data?.message || 'Server error');
  } else if (error.request) {
    // The request was made but no response was received
    throw new Error('No response from server. Please check your network connection.');
  } else {
    // Something happened in setting up the request that triggered an Error
    throw new Error(error.message || 'Unknown error occurred');
  }
};

// API endpoints
export const courseApi = {
  // Get all courses with pagination and filtering
  getAll: async (
    options: PaginationOptions & CourseFilterOptions = {}
  ): Promise<ApiResponse<PaginatedResult<Course>>> => {
    try {
      const { page, pageSize, sortBy, sortOrder, ...filters } = options;
      
      const params = {
        page,
        pageSize,
        sortBy,
        sortOrder,
        ...filters
      };
      
      const response = await api.get('/api/courses', { params });
      return response.data;
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  },
  
  // Get a course by ID
  getById: async (id: string): Promise<ApiResponse<Course>> => {
    try {
      const response = await api.get(`/api/courses/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  },
  
  // Create a new course
  create: async (courseData: CourseCreationData): Promise<ApiResponse<Course>> => {
    try {
      const response = await api.post('/api/courses', courseData);
      return response.data;
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  },
  
  // Update a course
  update: async (id: string, courseData: Partial<CourseCreationData>): Promise<ApiResponse<Course>> => {
    try {
      const response = await api.put(`/api/courses/${id}`, courseData);
      return response.data;
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  },
  
  // Delete a course
  delete: async (id: string): Promise<ApiResponse<void>> => {
    try {
      const response = await api.delete(`/api/courses/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  },
  
  // Get recommended credits for a vertical and semester
  getRecommendedCredits: async (vertical: string, semester: number): Promise<ApiResponse<{
    vertical: string;
    semester: number;
    recommended_credits: number;
  }>> => {
    try {
      const response = await api.get(`/api/courses/vertical/${vertical}/semester/${semester}/credits`);
      return response.data;
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  }
};

// Student API endpoints
export const studentApi = {
  // Register a new student
  register: async (data: StudentRegistrationData): Promise<ApiResponse<Student>> => {
    try {
      const response = await api.post('/api/students/signup', data);
      return response.data;
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  },

  // Login a student and get JWT token
  login: async (data: StudentLoginData): Promise<{
    message: string;
    student: Student;
    token: string;
  }> => {
    try {
      const response = await api.post('/api/students/login', data);
      return response.data;
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  },
  
  // Get the current student's profile
  getProfile: async (rollNumber: string): Promise<ApiResponse<Student>> => {
    try {
      const response = await api.get(`/api/students/profile?roll_number=${rollNumber}`);
      return response.data;
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  }
};

// Admin API endpoints
export const adminApi = {
  // Get basket credits summary
  getBasketCredits: async (): Promise<{
    message: string;
    basketCredits: Array<{
      vertical: string;
      basket: string;
      total_credits: number;
    }>;
    totalCredits: number;
  }> => {
    try {
      const response = await api.get('/api/basket-credits');
      return response.data;
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  }
};

// Add request interceptor for auth tokens, etc.
api.interceptors.request.use(
  (config) => {
    // Add auth token if available (admin token)
    const adminToken = localStorage.getItem('authToken');
    if (adminToken && config.headers) {
      config.headers['Authorization'] = `Bearer ${adminToken}`;
    }
    
    // Add student token if available
    const studentToken = localStorage.getItem('studentToken');
    if (studentToken && config.headers) {
      config.headers['Student-Authorization'] = `Bearer ${studentToken}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for global error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Global error handling logic here
    return Promise.reject(error);
  }
);

export default api;