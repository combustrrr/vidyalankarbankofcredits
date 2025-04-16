import axios from 'axios';
import { ApiResponse, Course } from '../types';

// Base URL for API requests - now we can always use /api path
// since Next.js will proxy these requests to our Express server
const API_URL = '/api';

// Create an axios instance with default config
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API functions for courses
export const courseApi = {
  // Get all courses
  getAll: async (): Promise<Course[]> => {
    try {
      const response = await apiClient.get<ApiResponse<{ courses: Course[] }>>('/courses');
      return response.data.data?.courses || [];
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  },
  
  // Get a single course by ID
  getById: async (id: string): Promise<Course> => {
    try {
      const response = await apiClient.get<ApiResponse<{ course: Course }>>(`/courses/${id}`);
      if (!response.data.data?.course) {
        throw new Error('Course not found');
      }
      return response.data.data.course;
    } catch (error) {
      console.error(`Error fetching course with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Create a new course
  create: async (courseData: Omit<Course, 'id' | 'createdAt'>): Promise<Course> => {
    try {
      const response = await apiClient.post<ApiResponse<{ course: Course }>>('/courses', courseData);
      if (!response.data.data?.course) {
        throw new Error('Failed to create course');
      }
      return response.data.data.course;
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  }
};