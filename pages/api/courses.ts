import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse, Course } from '../../types';
import { supabaseCourseApi } from '../../utils/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<any>>
) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET': {
        const { id } = req.query;

        if (id && typeof id === 'string') {
          // Get a single course
          const course = await supabaseCourseApi.getById(id);
          return res.status(200).json({ success: true, data: { course } });
        } else {
          // Get all courses with pagination
          const page = req.query.page ? parseInt(req.query.page as string) : 0;
          const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 20;
          
          const { data, totalCount, currentPage, pageSize: resultPageSize } = await supabaseCourseApi.getAll(page, pageSize);
          
          return res.status(200).json({ 
            success: true, 
            data: { 
              courses: data,
              pagination: {
                totalCount,
                currentPage,
                pageSize: resultPageSize,
                totalPages: Math.ceil(totalCount / resultPageSize)
              }
            } 
          });
        }
      }
      
      case 'POST': {
        // Create a new course
        const courseData = req.body;
        
        // Perform validation
        const requiredFields = ['course_code', 'title', 'type', 'credits', 'semester', 'degree', 'branch', 'vertical', 'basket'];
        const missingFields = requiredFields.filter(field => !courseData[field]);
        
        if (missingFields.length > 0) {
          return res.status(400).json({
            success: false,
            error: `Missing required fields: ${missingFields.join(', ')}`
          });
        }
        
        // Create course
        const createdCourse = await supabaseCourseApi.create(courseData);
        return res.status(201).json({ success: true, data: { course: createdCourse } });
      }
      
      case 'PUT': {
        // Update an existing course
        const { id } = req.query;
        const courseData = req.body;
        
        if (!id || typeof id !== 'string') {
          return res.status(400).json({
            success: false,
            error: 'Course ID is required'
          });
        }
        
        const updatedCourse = await supabaseCourseApi.update(id, courseData);
        return res.status(200).json({ success: true, data: { course: updatedCourse } });
      }
      
      case 'DELETE': {
        // Delete a course
        const { id } = req.query;
        
        if (!id || typeof id !== 'string') {
          return res.status(400).json({
            success: false,
            error: 'Course ID is required'
          });
        }
        
        await supabaseCourseApi.delete(id);
        return res.status(200).json({ success: true });
      }

      case 'PATCH': {
        // Handle course completion status update
        const { studentId, courseId, completed } = req.body;

        if (!studentId || !courseId || typeof completed !== 'boolean') {
          return res.status(400).json({
            success: false,
            error: 'Student ID, Course ID, and completion status are required'
          });
        }

        if (completed) {
          // Insert a row into completed_courses
          const { data: course, error: courseError } = await supabase
            .from('courses')
            .select('credits, semester')
            .eq('id', courseId)
            .single();

          if (courseError) {
            return res.status(500).json({
              success: false,
              error: 'Failed to fetch course details'
            });
          }

          const { credits, semester } = course;

          const { error: insertError } = await supabase
            .from('completed_courses')
            .insert({
              student_id: studentId,
              course_id: courseId,
              semester,
              credit_awarded: credits,
              completed_at: new Date().toISOString()
            });

          if (insertError) {
            return res.status(500).json({
              success: false,
              error: 'Failed to insert completed course'
            });
          }

          return res.status(200).json({ success: true });
        } else {
          // Delete the corresponding record from completed_courses
          const { error: deleteError } = await supabase
            .from('completed_courses')
            .delete()
            .eq('student_id', studentId)
            .eq('course_id', courseId);

          if (deleteError) {
            return res.status(500).json({
              success: false,
              error: 'Failed to delete completed course'
            });
          }

          return res.status(200).json({ success: true });
        }
      }
      
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']);
        return res.status(405).json({ 
          success: false, 
          error: `Method ${method} Not Allowed` 
        });
    }
  } catch (error: any) {
    console.error('API Error:', error);
    
    // Handle specific error cases
    if (error.code === 'PGRST116') {
      return res.status(404).json({ 
        success: false, 
        error: 'Resource not found'
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'An unexpected error occurred'
    });
  }
}
