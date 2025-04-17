import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// These environment variables will be securely added via .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env.local file.');
}

// Create Supabase client with optimized settings for free tier
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Maintain session to reduce auth requests
  },
  global: {
    fetch: (...args) => {
      // Add exponential backoff retry logic for the free tier's rate limiting
      return fetch(...args);
    },
  },
});

// Cache for program structures to reduce database calls on free tier
let programStructureCache: Record<string, any> = {};
let programStructureCacheLastUpdated = 0;
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

// Courses table type with Supabase
export type CourseInsert = {
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
};

// Program structure type
export type ProgramStructure = Database['public']['Tables']['program_structure']['Row'];

// Supabase course API functions
export const supabaseCourseApi = {
  // Create a new course in Supabase
  create: async (courseData: CourseInsert) => {
    // First check if there is a matching program structure
    const { data: structureData, error: structureError } = await supabase
      .from('program_structure')
      .select('id')
      .eq('vertical', courseData.vertical)
      .eq('semester', courseData.semester)
      .single();

    if (structureError && structureError.code !== 'PGRST116') {
      console.warn('Error fetching program structure:', structureError);
      // Continue without structure_id if not found
    }

    // If a matching structure was found, include its ID
    if (structureData) {
      courseData.structure_id = structureData.id;
    }

    const { data, error } = await supabase
      .from('courses')
      .insert([courseData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get all courses from Supabase with pagination for free tier
  getAll: async (page = 0, pageSize = 20) => {
    const from = page * pageSize;
    const to = from + pageSize - 1;
    
    const { data, error, count } = await supabase
      .from('courses')
      .select('*, program_structure(*)', { count: 'exact' })
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { 
      data: data || [], 
      totalCount: count || 0,
      currentPage: page,
      pageSize
    };
  },

  // Get a single course by ID from Supabase
  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('courses')
      .select('*, program_structure(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Update a course in Supabase
  update: async (id: string, courseData: Partial<CourseInsert>) => {
    // If vertical or semester changed, fetch the matching program structure
    if (courseData.vertical !== undefined || courseData.semester !== undefined) {
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select('vertical, semester')
        .eq('id', id)
        .single();
      
      if (courseError) throw courseError;

      const vertical = courseData.vertical || course.vertical;
      const semester = courseData.semester || course.semester;

      const { data: structureData, error: structureError } = await supabase
        .from('program_structure')
        .select('id')
        .eq('vertical', vertical)
        .eq('semester', semester)
        .single();

      if (structureError && structureError.code !== 'PGRST116') {
        console.warn('Error fetching program structure:', structureError);
      }

      if (structureData) {
        courseData.structure_id = structureData.id;
      }
    }

    const { data, error } = await supabase
      .from('courses')
      .update(courseData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a course from Supabase
  delete: async (id: string) => {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};

// Supabase program structure API functions
export const programStructureApi = {
  // Get all program structures with caching to reduce database calls on free tier
  getAll: async () => {
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

    if (error) throw error;
    
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
  },

  // Get structure by vertical and semester with caching
  getByVerticalAndSemester: async (vertical: string, semester: number) => {
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

    if (error && error.code !== 'PGRST116') throw error;
    
    // Update cache for this specific item
    if (data) {
      programStructureCache[cacheKey] = data;
      programStructureCacheLastUpdated = now;
    }
    
    return data || null;
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
  }
};