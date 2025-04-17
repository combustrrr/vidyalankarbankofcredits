/**
 * Client-side Supabase utility
 * 
 * Provides a structured interface for interacting with Supabase
 * from the client-side with caching and error handling
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';
import { supabaseConfig } from '../config';
import { Course, CourseFilterOptions, PaginationOptions } from '../types';

// Get Supabase URL and Key from centralized config
const supabaseUrl = supabaseConfig.url || '';
const supabaseAnonKey = supabaseConfig.anonKey || '';

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env.local file.');
}

// Create Supabase client with optimized settings for free tier
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Maintain session to reduce auth requests
  },
});

// Cache for program structures to reduce database calls on free tier
let programStructureCache: Record<string, any> = {};
let programStructureCacheLastUpdated = 0;
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

// Helper function to handle Supabase errors consistently
const handleSupabaseError = (error: any, customMessage: string): never => {
  console.error(`${customMessage}:`, error);
  throw new Error(`${customMessage}: ${error.message || 'Unknown error'}`);
};

// Supabase course API functions with better error handling
export const courseApi = {
  // Get all courses with pagination and filtering
  getAll: async (
    options: PaginationOptions & CourseFilterOptions = {}
  ) => {
    try {
      const { page = 0, pageSize = 20, sortBy = 'created_at', sortOrder = 'desc', ...filters } = options;
      
      // Calculate range for pagination
      const from = page * pageSize;
      const to = from + pageSize - 1;
      
      // Start query builder
      let query = supabase
        .from('courses')
        .select('*, program_structure(*)', { count: 'exact' });
      
      // Apply filters
      if (filters.semester) query = query.eq('semester', filters.semester);
      if (filters.vertical) query = query.eq('vertical', filters.vertical);
      if (filters.basket) query = query.eq('basket', filters.basket);
      if (filters.type) query = query.eq('type', filters.type);
      if (filters.degree) query = query.eq('degree', filters.degree);
      if (filters.branch) query = query.eq('branch', filters.branch);
      
      // Apply sorting and pagination
      const { data, error, count } = await query
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range(from, to);
      
      if (error) {
        throw new Error(`Failed to fetch courses: ${error.message}`);
      }
      
      return {
        data: data || [],
        totalCount: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
        hasNextPage: to < (count || 0) - 1,
        hasPreviousPage: from > 0
      };
    } catch (error: any) {
      console.error('Error fetching courses:', error);
      throw new Error(`Unexpected error fetching courses: ${error.message}`);
    }
  },

  // Get a course by ID
  getById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*, program_structure(*)')
        .eq('id', id)
        .single();
      
      if (error) {
        throw new Error(`Failed to fetch course with ID ${id}: ${error.message}`);
      }
      
      return data;
    } catch (error: any) {
      console.error(`Error fetching course with ID ${id}:`, error);
      throw new Error(`Unexpected error fetching course with ID ${id}: ${error.message}`);
    }
  },

  // Create a new course
  create: async (courseData: Omit<Course, 'id' | 'created_at'>) => {
    try {
      // Check if there's a matching program structure
      const { data: structureData, error: structureError } = await supabase
        .from('program_structure')
        .select('id')
        .eq('vertical', courseData.vertical)
        .eq('semester', courseData.semester)
        .maybeSingle();
      
      // Set structure_id if found
      let structure_id = null;
      if (structureData && !structureError) {
        structure_id = structureData.id;
      }
      
      // Insert course with structure ID
      const { data, error } = await supabase
        .from('courses')
        .insert([{ ...courseData, structure_id }])
        .select()
        .single();
      
      if (error) {
        throw new Error(`Failed to create course: ${error.message}`);
      }
      
      return data;
    } catch (error: any) {
      console.error('Error creating course:', error);
      throw new Error(`Unexpected error creating course: ${error.message}`);
    }
  },

  // Update an existing course
  update: async (id: string, courseData: Partial<Course>) => {
    try {
      // If updating vertical or semester, fetch matching program structure
      let updateData = { ...courseData };
      
      if (courseData.vertical !== undefined || courseData.semester !== undefined) {
        // Get current course data
        const { data: currentCourse, error: fetchError } = await supabase
          .from('courses')
          .select('vertical, semester')
          .eq('id', id)
          .single();
        
        if (fetchError) {
          throw new Error(`Failed to fetch current course data for ID ${id}: ${fetchError.message}`);
        }
        
        // Use provided values or fallback to current values
        const vertical = courseData.vertical || currentCourse.vertical;
        const semester = courseData.semester || currentCourse.semester;
        
        // Fetch matching structure
        const { data: structureData, error: structureError } = await supabase
          .from('program_structure')
          .select('id')
          .eq('vertical', vertical)
          .eq('semester', semester)
          .maybeSingle();
        
        if (!structureError && structureData) {
          updateData.structure_id = structureData.id;
        }
      }
      
      // Update course
      const { data, error } = await supabase
        .from('courses')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        throw new Error(`Failed to update course with ID ${id}: ${error.message}`);
      }
      
      return data;
    } catch (error: any) {
      console.error(`Error updating course with ID ${id}:`, error);
      throw new Error(`Unexpected error updating course with ID ${id}: ${error.message}`);
    }
  },

  // Delete a course
  delete: async (id: string) => {
    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete course with ID ${id}: ${error.message}`);
      }
      
      return true;
    } catch (error: any) {
      console.error(`Error deleting course with ID ${id}:`, error);
      throw new Error(`Unexpected error deleting course with ID ${id}: ${error.message}`);
    }
  }
};

// Supabase program structure API functions with improved caching
export const programStructureApi = {
  // Get all program structures with caching to reduce database calls on free tier
  getAll: async () => {
    try {
      // Check if cache is valid
      const now = Date.now();
      if (programStructureCacheLastUpdated > 0 && 
          now - programStructureCacheLastUpdated < CACHE_TTL && 
          Object.keys(programStructureCache).length > 0) {
        // Return cached data
        return Object.values(programStructureCache);
      }

      // If cache is invalid or empty, fetch from database
      const { data, error } = await supabase
        .from('program_structure')
        .select('*')
        .order('vertical')
        .order('semester');

      if (error) {
        throw new Error(`Failed to fetch program structures: ${error.message}`);
      }
      
      // Update cache
      programStructureCache = {};
      if (data) {
        data.forEach(item => {
          const key = `${item.vertical}-${item.semester}`;
          programStructureCache[key] = item;
        });
      }
      programStructureCacheLastUpdated = now;
      
      return data || [];
    } catch (error: any) {
      console.error('Error fetching program structures:', error);
      throw new Error(`Unexpected error fetching program structures: ${error.message}`);
    }
  },

  // Get structure by vertical and semester with caching
  getByVerticalAndSemester: async (vertical: string, semester: number) => {
    try {
      // Check cache first
      const cacheKey = `${vertical}-${semester}`;
      const now = Date.now();
      
      if (programStructureCacheLastUpdated > 0 && 
          now - programStructureCacheLastUpdated < CACHE_TTL && 
          programStructureCache[cacheKey]) {
        return programStructureCache[cacheKey];
      }

      // If not in cache or cache expired, fetch from database
      const { data, error } = await supabase
        .from('program_structure')
        .select('*')
        .eq('vertical', vertical)
        .eq('semester', semester)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new Error(`Failed to fetch program structure for ${vertical} semester ${semester}: ${error.message}`);
      }
      
      // Update cache for this specific item
      if (data) {
        programStructureCache[cacheKey] = data;
        programStructureCacheLastUpdated = now;
      }
      
      return data || null;
    } catch (error: any) {
      console.error(`Error fetching program structure for ${vertical} semester ${semester}:`, error);
      throw new Error(`Unexpected error fetching program structure for ${vertical} semester ${semester}: ${error.message}`);
    }
  },

  // Get recommended credits with caching
  getRecommendedCredits: async (vertical: string, semester: number) => {
    try {
      const structure = await programStructureApi.getByVerticalAndSemester(vertical, semester);
      return structure ? structure.recommended_credits : 0;
    } catch (err) {
      console.error('Error getting recommended credits:', err);
      return 0;
    }
  },
  
  // Clear cache (useful after admin updates program structure)
  clearCache: () => {
    programStructureCache = {};
    programStructureCacheLastUpdated = 0;
    return true;
  }
};