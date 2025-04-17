import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../utils/supabase';
import jwt from 'jsonwebtoken';

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'vidyalankar-bank-of-credits-secret-key';

// Define interface for token contents
interface JwtPayload {
  id: string;
  roll_number: string;
  name: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow PATCH methods
  if (req.method !== 'PATCH' && req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Extract authentication token
  const authHeader = req.headers['student-authorization'] as string;
  const token = authHeader?.split(' ')[1]; // Format: "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    // Verify and decode the JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const studentId = decoded.id;

    // GET method to fetch completed courses for a student
    if (req.method === 'GET') {
      const { data: completedCourses, error } = await supabase
        .from('completed_courses')
        .select(`
          id,
          course_id,
          semester,
          credit_awarded,
          completed_at,
          courses:course_id (*)
        `)
        .eq('student_id', studentId);

      if (error) {
        console.error('Error fetching completed courses:', error);
        return res.status(500).json({ message: 'Failed to fetch completed courses' });
      }

      return res.status(200).json({
        success: true,
        data: completedCourses
      });
    }
    
    // PATCH method to mark a course as completed or not completed
    if (req.method === 'PATCH') {
      const { courseId, completed } = req.body;

      if (!courseId) {
        return res.status(400).json({ message: 'Course ID is required' });
      }

      // Get student's current semester for validation
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('semester')
        .eq('id', studentId)
        .single();

      if (studentError) {
        return res.status(500).json({ message: 'Failed to fetch student data' });
      }

      // If the student is marking a course as completed
      if (completed) {
        // Get course details to validate and get credit value
        const { data: course, error: courseError } = await supabase
          .from('courses')
          .select('id, semester, credits')
          .eq('id', courseId)
          .single();

        if (courseError) {
          return res.status(500).json({ message: 'Failed to fetch course data' });
        }

        // Validate that the course's semester is not greater than the student's semester
        if (course.semester > student.semester) {
          return res.status(400).json({ 
            message: 'Cannot mark a course as completed if its semester is greater than your current semester' 
          });
        }

        // Insert into completed_courses
        const { data, error: insertError } = await supabase
          .from('completed_courses')
          .insert({
            student_id: studentId,
            course_id: courseId,
            semester: course.semester,
            credit_awarded: course.credits,
            completed_at: new Date().toISOString()
          })
          .select();

        if (insertError) {
          // Handle unique constraint violations (already completed)
          if (insertError.code === '23505') {
            return res.status(400).json({ message: 'Course is already marked as completed' });
          }
          
          console.error('Error marking course as completed:', insertError);
          return res.status(500).json({ message: 'Failed to mark course as completed' });
        }

        return res.status(200).json({
          success: true,
          message: 'Course marked as completed successfully',
          data
        });
      } else {
        // If the student is unmarking a course (removing completion status)
        const { data, error: deleteError } = await supabase
          .from('completed_courses')
          .delete()
          .eq('student_id', studentId)
          .eq('course_id', courseId)
          .select();

        if (deleteError) {
          console.error('Error unmarking course completion:', deleteError);
          return res.status(500).json({ message: 'Failed to unmark course as completed' });
        }

        return res.status(200).json({
          success: true,
          message: 'Course unmarked as completed successfully',
          data
        });
      }
    }
  } catch (error) {
    console.error('Error processing course completion:', error);
    return res.status(500).json({ message: 'An unexpected error occurred' });
  }
}