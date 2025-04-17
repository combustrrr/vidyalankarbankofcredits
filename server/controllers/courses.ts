/**
 * Courses controller
 * 
 * Handles all course-related API endpoints
 */
import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { 
  Course, 
  CourseCreationData,
  CourseFilterOptions,
  PaginationOptions,
  PaginatedResult,
  CompletedCourse
} from '../../types';
import { createApiError } from '../middleware/errorHandler';
import { programStructure, getRecommendedCredits } from '../../config';

/**
 * Get all courses with pagination and filtering
 */
export const getAllCourses = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    // Extract query parameters
    const { 
      page = 0, 
      pageSize = 20, 
      sortBy = 'created_at',
      sortOrder = 'desc',
      semester, 
      vertical, 
      basket, 
      type, 
      degree,
      branch 
    } = req.query;
    
    // Convert to numbers
    const pageNum = Number(page);
    const pageSizeNum = Number(pageSize);
    
    // Calculate range for Supabase query
    const from = pageNum * pageSizeNum;
    const to = from + pageSizeNum - 1;
    
    // Start query builder
    let query = supabase
      .from('courses')
      .select('*, program_structure(*)', { count: 'exact' });
    
    // Apply filters if provided
    if (semester) query = query.eq('semester', Number(semester));
    if (vertical) query = query.eq('vertical', vertical);
    if (basket) query = query.eq('basket', basket);
    if (type) query = query.eq('type', type);
    if (degree) query = query.eq('degree', degree);
    if (branch) query = query.eq('branch', branch);
    
    // Apply pagination and sorting
    query = query
      .order(sortBy.toString(), { ascending: sortOrder === 'asc' })
      .range(from, to);
    
    // Execute query
    const { data, error, count } = await query;
    
    if (error) {
      return next(createApiError(error.message, 500, 'DATABASE_ERROR'));
    }
    
    // Calculate pagination metadata
    const totalPages = Math.ceil((count || 0) / pageSizeNum);
    
    // Format response
    const paginatedResult: PaginatedResult<Course> = {
      data: data || [],
      totalCount: count || 0,
      currentPage: pageNum,
      pageSize: pageSizeNum,
      totalPages,
      hasNextPage: pageNum < totalPages - 1,
      hasPreviousPage: pageNum > 0
    };
    
    res.status(200).json({
      success: true,
      ...paginatedResult
    });
  } catch (err: any) {
    next(createApiError(err.message, 500));
  }
};

/**
 * Get a course by ID
 */
export const getCourseById = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('courses')
      .select('*, program_structure(*)')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return next(createApiError(`Course with ID ${id} not found`, 404, 'COURSE_NOT_FOUND'));
      }
      return next(createApiError(error.message, 500, 'DATABASE_ERROR'));
    }
    
    res.status(200).json({
      success: true,
      data
    });
  } catch (err: any) {
    next(createApiError(err.message, 500));
  }
};

/**
 * Create a new course
 */
export const createCourse = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const courseData: CourseCreationData = req.body;
    
    // Validate input
    if (!courseData.course_code || !courseData.title || !courseData.vertical) {
      return next(createApiError(
        'Missing required fields: code, title, vertical are required',
        400, 
        'VALIDATION_ERROR'
      ));
    }
    
    // Check if course code already exists
    const { data: existingCourse, error: existingError } = await supabase
      .from('courses')
      .select('course_code')
      .eq('course_code', courseData.course_code)
      .maybeSingle();
    
    if (existingError) {
      return next(createApiError(existingError.message, 500, 'DATABASE_ERROR'));
    }
    
    if (existingCourse) {
      return next(createApiError(
        `Course with code ${courseData.course_code} already exists`,
        409,
        'DUPLICATE_COURSE'
      ));
    }
    
    // Check if there is a matching program structure
    const { data: structureData, error: structureError } = await supabase
      .from('program_structure')
      .select('id')
      .eq('vertical', courseData.vertical)
      .eq('semester', courseData.semester)
      .maybeSingle();
    
    // Add structure_id if found
    let structure_id = null;
    if (structureData && !structureError) {
      structure_id = structureData.id;
    }
    
    // Create course with structure ID
    const { data, error } = await supabase
      .from('courses')
      .insert([{ ...courseData, structure_id }])
      .select()
      .single();
    
    if (error) {
      return next(createApiError(error.message, 500, 'DATABASE_ERROR'));
    }
    
    res.status(201).json({
      success: true,
      data,
      message: 'Course created successfully'
    });
  } catch (err: any) {
    next(createApiError(err.message, 500));
  }
};

/**
 * Update a course by ID
 */
export const updateCourse = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const courseData = req.body;
    
    // Ensure course exists
    const { data: existingCourse, error: checkError } = await supabase
      .from('courses')
      .select('id, vertical, semester')
      .eq('id', id)
      .single();
    
    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return next(createApiError(`Course with ID ${id} not found`, 404, 'COURSE_NOT_FOUND'));
      }
      return next(createApiError(checkError.message, 500, 'DATABASE_ERROR'));
    }
    
    // If vertical or semester changed, fetch the matching program structure
    let updateData = { ...courseData };
    if (courseData.vertical !== undefined || courseData.semester !== undefined) {
      const vertical = courseData.vertical || existingCourse.vertical;
      const semester = courseData.semester || existingCourse.semester;
      
      const { data: structureData, error: structureError } = await supabase
        .from('program_structure')
        .select('id')
        .eq('vertical', vertical)
        .eq('semester', semester)
        .maybeSingle();
      
      if (structureData && !structureError) {
        updateData.structure_id = structureData.id;
      } else {
        // Only log the error but don't change structure_id if no match found
        console.warn(`No program structure found for vertical ${vertical} and semester ${semester}`);
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
      return next(createApiError(error.message, 500, 'DATABASE_ERROR'));
    }
    
    res.status(200).json({
      success: true,
      data,
      message: 'Course updated successfully'
    });
  } catch (err: any) {
    next(createApiError(err.message, 500));
  }
};

/**
 * Delete a course by ID
 */
export const deleteCourse = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    // Ensure course exists
    const { data: existingCourse, error: checkError } = await supabase
      .from('courses')
      .select('id')
      .eq('id', id)
      .single();
    
    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return next(createApiError(`Course with ID ${id} not found`, 404, 'COURSE_NOT_FOUND'));
      }
      return next(createApiError(checkError.message, 500, 'DATABASE_ERROR'));
    }
    
    // Delete course
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id);
    
    if (error) {
      return next(createApiError(error.message, 500, 'DATABASE_ERROR'));
    }
    
    res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (err: any) {
    next(createApiError(err.message, 500));
  }
};

/**
 * Get recommended credits for a vertical and semester
 */
export const getRecommendedCreditsForVertical = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const { vertical, semester } = req.params;
    const semesterNum = Number(semester);
    
    if (!vertical || isNaN(semesterNum)) {
      return next(createApiError(
        'Vertical name and valid semester number are required',
        400,
        'VALIDATION_ERROR'
      ));
    }
    
    // First try to get from database
    const { data: structureData, error: structureError } = await supabase
      .from('program_structure')
      .select('recommended_credits')
      .eq('vertical', vertical)
      .eq('semester', semesterNum)
      .maybeSingle();
    
    // If found in database, return that value
    if (!structureError && structureData) {
      return res.status(200).json({
        success: true,
        data: {
          vertical,
          semester: semesterNum,
          recommended_credits: structureData.recommended_credits
        }
      });
    }
    
    // If not in database, fall back to configuration
    const recommendedCredits = getRecommendedCredits(vertical, semesterNum);
    
    res.status(200).json({
      success: true,
      data: {
        vertical,
        semester: semesterNum,
        recommended_credits: recommendedCredits
      },
      source: 'configuration' // Indicate this came from config, not database
    });
  } catch (err: any) {
    next(createApiError(err.message, 500));
  }
};

/**
 * Get student progress report
 */
export const getStudentProgressReport = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const { studentId } = req.query;

    if (!studentId) {
      return next(createApiError(
        'Student ID is required',
        400,
        'VALIDATION_ERROR'
      ));
    }

    // Fetch completed courses for the student
    const { data: completedCourses, error: completedCoursesError } = await supabase
      .from('completed_courses')
      .select('*, courses(*)')
      .eq('student_id', studentId);

    if (completedCoursesError) {
      return next(createApiError(completedCoursesError.message, 500, 'DATABASE_ERROR'));
    }

    // Organize completed courses by semester
    const progressReport = completedCourses.reduce((report: any, completedCourse: CompletedCourse) => {
      const { semester, courses } = completedCourse;
      if (!report[semester]) {
        report[semester] = [];
      }
      report[semester].push({
        courseCode: courses.course_code,
        courseName: courses.title,
        basket: courses.basket,
        creditsEarned: completedCourse.credit_awarded,
        completionDate: completedCourse.completed_at
      });
      return report;
    }, {});

    // Calculate total credits completed
    const totalCreditsCompleted = completedCourses.reduce((total: number, completedCourse: CompletedCourse) => {
      return total + completedCourse.credit_awarded;
    }, 0);

    // Calculate basket-wise breakdown
    const basketWiseBreakdown = completedCourses.reduce((breakdown: any, completedCourse: CompletedCourse) => {
      const { basket, credit_awarded } = completedCourse.courses;
      if (!breakdown[basket]) {
        breakdown[basket] = 0;
      }
      breakdown[basket] += credit_awarded;
      return breakdown;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        progressReport,
        totalCreditsCompleted,
        basketWiseBreakdown
      }
    });
  } catch (err: any) {
    next(createApiError(err.message, 500));
  }
};
