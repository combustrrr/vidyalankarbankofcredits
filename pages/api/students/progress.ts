/**
 * Student Progress API Route
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSupabaseClient } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';
import { parse } from 'cookie';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const cookies = parse(req.headers.cookie || '');
    const token = cookies.auth_token;

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'No authentication token found' 
      });
    }

    // Verify JWT token
    const decoded = verifyToken(token);
    if (!decoded || decoded.type !== 'student') {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid authentication token' 
      });
    }

    const supabase = getServerSupabaseClient();

    // Get completed courses with course details
    const { data: completedCourses, error: completedError } = await supabase
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
      .eq('student_id', decoded.id);

    if (completedError) {
      console.error('Progress fetch error:', completedError);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch progress data' 
      });
    }

    // Calculate progress by vertical and basket
    const verticalProgress: Record<string, any> = {};
    const basketProgress: Record<string, any> = {};
    let totalCredits = 0;

    (completedCourses || []).forEach((completed) => {
      const course = completed.courses;
      if (!course) return;

      const credits = completed.credit_awarded || course.credits;
      totalCredits += credits;

      // Vertical progress
      const vertical = course.vertical;
      if (!verticalProgress[vertical]) {
        verticalProgress[vertical] = {
          completed: 0,
          required: 20, // This should come from program structure
          courses: []
        };
      }
      verticalProgress[vertical].completed += credits;
      verticalProgress[vertical].courses.push(completed);

      // Basket progress
      const basket = course.basket;
      if (!basketProgress[basket]) {
        basketProgress[basket] = {
          completed: 0,
          required: 15, // This should come from program structure
          courses: []
        };
      }
      basketProgress[basket].completed += credits;
      basketProgress[basket].courses.push(completed);
    });

    const progressData = {
      completedCourses: completedCourses || [],
      totalCredits,
      verticalProgress,
      basketProgress
    };

    res.status(200).json({
      success: true,
      progress: progressData
    });

  } catch (error) {
    console.error('Progress API error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}
