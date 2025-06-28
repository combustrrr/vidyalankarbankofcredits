/**
 * Student Credits API Route
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

    // Students can only access their own credit data
    if (decoded.type === 'student' && decoded.id !== studentId) {
      return res.status(403).json({ 
        success: false, 
        error: 'Access denied' 
      });
    }

    const supabase = getServerSupabaseClient();

    // Get completed courses with course details
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
      .eq('student_id', studentId);

    if (error) {
      throw error;
    }

    // Calculate credits by different categories
    const creditsByVertical: Record<string, number> = {};
    const creditsByBasket: Record<string, number> = {};
    const creditsBySemester: Record<number, number> = {};
    let totalCredits = 0;

    (completedCourses || []).forEach((completed) => {
      const course = completed.courses;
      if (!course) return;

      const credits = completed.credit_awarded || course.credits || 0;
      totalCredits += credits;

      // By vertical
      const vertical = course.vertical || 'Unknown';
      creditsByVertical[vertical] = (creditsByVertical[vertical] || 0) + credits;

      // By basket
      const basket = course.basket || 'Unknown';
      creditsByBasket[basket] = (creditsByBasket[basket] || 0) + credits;

      // By semester
      const semester = course.semester || 1;
      creditsBySemester[semester] = (creditsBySemester[semester] || 0) + credits;
    });

    // Calculate progress percentages (based on typical requirements)
    const verticalRequirements = {
      'BSC': 28,  // Basic Science Courses
      'ESC': 20,  // Engineering Science Courses
      'PCC': 45,  // Program Core Courses
      'PEC': 15,  // Program Elective Courses
      'OE': 9,    // Open Electives
      'AEC': 4,   // Ability Enhancement Courses
      'EEMC': 3,  // Entrepreneurship/Economics/Management
      'VSEC': 2,  // Vocational & Skill Enhancement
      'MDM': 18,  // Multidisciplinary Minor
      'IKS': 2,   // Indian Knowledge System
      'VEC': 2,   // Value Education Course
      'CC': 2,    // Co-Curricular Courses
    };

    const verticalProgress = Object.keys(verticalRequirements).map(vertical => ({
      vertical,
      completed: creditsByVertical[vertical] || 0,
      required: verticalRequirements[vertical as keyof typeof verticalRequirements],
      percentage: Math.round(((creditsByVertical[vertical] || 0) / verticalRequirements[vertical as keyof typeof verticalRequirements]) * 100)
    }));

    const creditsData = {
      totalCredits,
      totalRequired: 160, // Typical BTech requirement
      completionPercentage: Math.round((totalCredits / 160) * 100),
      creditsByVertical,
      creditsByBasket,
      creditsBySemester,
      verticalProgress,
      completedCourses: completedCourses || []
    };

    res.status(200).json({
      success: true,
      data: creditsData
    });

  } catch (error) {
    console.error('Get student credits error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch student credits' 
    });
  }
}
