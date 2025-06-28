/**
 * Course Completion Toggle API Route
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSupabaseClient } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';
import { parse } from 'cookie';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { courseId, completed } = req.body;

    if (!courseId || typeof completed !== 'boolean') {
      return res.status(400).json({ 
        success: false, 
        error: 'Course ID and completion status are required' 
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
    if (!decoded || decoded.type !== 'student') {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid authentication token' 
      });
    }

    const supabase = getServerSupabaseClient();

    if (completed) {
      // Add course completion
      // First check if it already exists
      const { data: existing } = await supabase
        .from('completed_courses')
        .select('id')
        .eq('student_id', decoded.id)
        .eq('course_id', courseId)
        .single();

      if (existing) {
        return res.status(409).json({ 
          success: false, 
          error: 'Course already marked as completed' 
        });
      }

      // Get course details for credit calculation
      const { data: course } = await supabase
        .from('courses')
        .select('credits, semester')
        .eq('id', courseId)
        .single();

      if (!course) {
        return res.status(404).json({ 
          success: false, 
          error: 'Course not found' 
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

      const { error: insertError } = await supabase
        .from('completed_courses')
        .insert([{
          student_id: decoded.id,
          course_id: courseId,
          academic_year_id: academicYear?.id || null,
          semester: course.semester || 1,
          credit_awarded: course.credits || 0,
          credits_earned: course.credits || 0,
          grade: 'A',
          grade_points: 10,
          total_marks: 100,
          completion_status: 'Passed'
        }]);

      if (insertError) {
        throw insertError;
      }

    } else {
      // Remove course completion
      const { error: deleteError } = await supabase
        .from('completed_courses')
        .delete()
        .eq('student_id', decoded.id)
        .eq('course_id', courseId);

      if (deleteError) {
        throw deleteError;
      }
    }

    res.status(200).json({
      success: true,
      message: completed ? 'Course marked as completed' : 'Course completion removed'
    });

  } catch (error) {
    console.error('Toggle completion error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update course completion' 
    });
  }
}
