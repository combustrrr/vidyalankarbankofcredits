/**
 * Student Completed Courses API Route
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSupabaseClient } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';
import { parse } from 'cookie';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = getServerSupabaseClient();

  switch (req.method) {
    case 'GET':
      return await getCompletedCourses(req, res, supabase);
    case 'POST':
      return await addCompletedCourse(req, res, supabase);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}

async function getCompletedCourses(req: NextApiRequest, res: NextApiResponse, supabase: any) {
  try {
    const { id: studentId } = req.query;

    if (!studentId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Student ID is required' 
      });
    }

    const cookies = parse(req.headers.cookie || '');
    const token = cookies.auth_token;

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'No authentication token found' 
      });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid authentication token' 
      });
    }

    // Students can only access their own completed courses
    if (decoded.type === 'student' && decoded.id !== studentId) {
      return res.status(403).json({ 
        success: false, 
        error: 'Access denied' 
      });
    }

    const { data: completedCourses, error } = await supabase
      .from('completed_courses')
      .select(`
        *,
        courses (
          id,
          course_code,
          title,
          type,
          credits,
          semester,
          degree,
          branch,
          vertical,
          basket
        )
      `)
      .eq('student_id', studentId)
      .order('completed_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.status(200).json({
      success: true,
      data: completedCourses || []
    });

  } catch (error) {
    console.error('Get completed courses error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch completed courses' 
    });
  }
}

async function addCompletedCourse(req: NextApiRequest, res: NextApiResponse, supabase: any) {
  try {
    const { id: studentId } = req.query;
    const { courseId, semester, creditAwarded, grade, marks } = req.body;

    if (!studentId || !courseId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Student ID and Course ID are required' 
      });
    }

    const cookies = parse(req.headers.cookie || '');
    const token = cookies.auth_token;

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'No authentication token found' 
      });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid authentication token' 
      });
    }

    // Students can only add their own completed courses
    if (decoded.type === 'student' && decoded.id !== studentId) {
      return res.status(403).json({ 
        success: false, 
        error: 'Access denied' 
      });
    }

    // Check if course completion already exists
    const { data: existing } = await supabase
      .from('completed_courses')
      .select('id')
      .eq('student_id', studentId)
      .eq('course_id', courseId)
      .single();

    if (existing) {
      return res.status(409).json({ 
        success: false, 
        error: 'Course completion already recorded' 
      });
    }

    // Get the default university and academic year
    const defaultUniversityId = '550e8400-e29b-41d4-a716-446655440000';
    const { data: academicYear } = await supabase
      .from('academic_years')
      .select('id')
      .eq('university_id', defaultUniversityId)
      .eq('is_current', true)
      .single();

    const { data: completedCourse, error } = await supabase
      .from('completed_courses')
      .insert([{
        student_id: studentId,
        course_id: courseId,
        academic_year_id: academicYear?.id || null,
        semester: semester || 1,
        credit_awarded: creditAwarded || 0,
        credits_earned: creditAwarded || 0,
        grade: grade || 'A',
        total_marks: marks || 100,
        completion_status: 'Passed'
      }])
      .select(`
        *,
        courses (
          id,
          course_code,
          title,
          type,
          credits,
          semester,
          degree,
          branch,
          vertical,
          basket
        )
      `)
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({
      success: true,
      data: completedCourse
    });

  } catch (error) {
    console.error('Add completed course error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to add completed course' 
    });
  }
}
