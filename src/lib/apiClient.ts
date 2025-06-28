/**
 * API Client for Frontend
 */

import { 
  ApiResponse, 
  Course, 
  Student, 
  CompletedCourse, 
  PaginatedResult,
  CourseCreationData,
  PaginationOptions,
  CourseFilterOptions 
} from '@/types';

// Generic API response handler
async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}`);
  }
  
  return data;
}

// Course API
export const courseApi = {
  getAll: async (options: PaginationOptions & CourseFilterOptions = {}): Promise<ApiResponse<PaginatedResult<Course>>> => {
    const params = new URLSearchParams();
    
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await fetch(`/api/courses?${params.toString()}`);
    return handleResponse<PaginatedResult<Course>>(response);
  },

  getById: async (id: string): Promise<ApiResponse<Course>> => {
    const response = await fetch(`/api/courses/${id}`);
    return handleResponse<Course>(response);
  },

  create: async (courseData: CourseCreationData): Promise<ApiResponse<Course>> => {
    const response = await fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(courseData),
    });
    return handleResponse<Course>(response);
  },

  update: async (id: string, courseData: Partial<CourseCreationData>): Promise<ApiResponse<Course>> => {
    const response = await fetch(`/api/courses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(courseData),
    });
    return handleResponse<Course>(response);
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await fetch(`/api/courses/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<void>(response);
  }
};

// Student API
export const studentApi = {
  getAll: async (options: PaginationOptions = {}): Promise<ApiResponse<PaginatedResult<Student>>> => {
    const params = new URLSearchParams();
    
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await fetch(`/api/students?${params.toString()}`);
    return handleResponse<PaginatedResult<Student>>(response);
  },

  getById: async (id: string): Promise<ApiResponse<Student>> => {
    const response = await fetch(`/api/students/${id}`);
    return handleResponse<Student>(response);
  },

  update: async (id: string, studentData: Partial<Student>): Promise<ApiResponse<Student>> => {
    const response = await fetch(`/api/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData),
    });
    return handleResponse<Student>(response);
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await fetch(`/api/students/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<void>(response);
  },

  getCompletedCourses: async (studentId: string): Promise<ApiResponse<CompletedCourse[]>> => {
    const response = await fetch(`/api/students/${studentId}/completed-courses`);
    return handleResponse<CompletedCourse[]>(response);
  },

  updateSemester: async (studentId: string, semester: number): Promise<ApiResponse<Student>> => {
    const response = await fetch(`/api/students/${studentId}/semester`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ semester }),
    });
    return handleResponse<Student>(response);
  }
};

// Course completion API
export const completionApi = {
  toggleCompletion: async (courseId: string, completed: boolean): Promise<ApiResponse<void>> => {
    const response = await fetch('/api/courses/completion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId, completed }),
      credentials: 'include'
    });
    return handleResponse<void>(response);
  }
};

// Credits API
export const creditsApi = {
  getStudentCredits: async (studentId: string): Promise<ApiResponse<any>> => {
    const response = await fetch(`/api/students/${studentId}/credits`);
    return handleResponse<any>(response);
  },

  getBasketCredits: async (): Promise<ApiResponse<any>> => {
    const response = await fetch('/api/basket-credits');
    return handleResponse<any>(response);
  }
};
