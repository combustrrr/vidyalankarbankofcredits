/**
 * Basket Credits API Route - Get credit breakdown by baskets
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

    const decoded = verifyToken(token);
    if (!decoded || decoded.type !== 'student') {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid authentication token' 
      });
    }

    const supabase = getServerSupabaseClient();

    // Get student's completed courses grouped by baskets
    const { data: completedCourses, error } = await supabase
      .from('completed_courses')
      .select(`
        *,
        courses (
          id,
          course_code,
          title,
          credits,
          vertical,
          basket
        )
      `)
      .eq('student_id', decoded.id);

    if (error) {
      throw error;
    }

    // Calculate credits by baskets
    const basketCredits: Record<string, {
      vertical: string;
      basket: string;
      completed: number;
      required: number;
      courses: any[];
    }> = {};

    // Default basket requirements (this could come from database)
    const basketRequirements: Record<string, number> = {
      'Mathematics': 12,
      'Physics': 8,
      'Chemistry': 6,
      'Engineering': 15,
      'Programming': 20,
      'Core': 40,
      'Elective': 15,
      'Communication': 4,
      'Economics': 3,
      'Unknown': 0
    };

    (completedCourses || []).forEach((completed) => {
      const course = completed.courses;
      if (!course) return;

      const vertical = course.vertical || 'Unknown';
      const basket = course.basket || 'Unknown';
      const key = `${vertical}-${basket}`;
      const credits = completed.credit_awarded || course.credits || 0;

      if (!basketCredits[key]) {
        basketCredits[key] = {
          vertical,
          basket,
          completed: 0,
          required: basketRequirements[basket] || 0,
          courses: []
        };
      }

      basketCredits[key].completed += credits;
      basketCredits[key].courses.push({
        ...completed,
        course
      });
    });

    // Convert to array format
    const basketData = Object.values(basketCredits).map(basket => ({
      ...basket,
      percentage: basket.required > 0 ? Math.round((basket.completed / basket.required) * 100) : 100,
      isCompleted: basket.completed >= basket.required
    }));

    // Calculate overall statistics
    const totalCompleted = basketData.reduce((sum, basket) => sum + basket.completed, 0);
    const totalRequired = basketData.reduce((sum, basket) => sum + basket.required, 0);

    res.status(200).json({
      success: true,
      data: {
        baskets: basketData,
        totalCompleted,
        totalRequired,
        overallPercentage: totalRequired > 0 ? Math.round((totalCompleted / totalRequired) * 100) : 0,
        completedBaskets: basketData.filter(b => b.isCompleted).length,
        totalBaskets: basketData.length
      }
    });

  } catch (error) {
    console.error('Get basket credits error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch basket credits' 
    });
  }
}
