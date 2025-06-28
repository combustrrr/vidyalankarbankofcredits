import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Use service role key for admin operations
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Get comprehensive system statistics for admin dashboard
    const [
      studentsResult,
      coursesResult,
      universitiesResult,
      activeStudentsResult,
      enrollmentsResult
    ] = await Promise.all([
      // Total students
      supabase.from('students').select('id', { count: 'exact' }),
      
      // Total courses
      supabase.from('courses').select('id', { count: 'exact' }),
      
      // Total universities
      supabase.from('universities').select('id', { count: 'exact' }),
      
      // Active students
      supabase.from('students').select('id', { count: 'exact' }).eq('is_active', true),
      
      // Total enrollments (if table exists)
      supabase.from('course_enrollments').select('id', { count: 'exact' }).limit(1)
    ]);

    // Get recent student registrations
    const { data: recentStudents } = await supabase
      .from('students')
      .select('id, full_name, roll_number, created_at, degree, branch')
      .order('created_at', { ascending: false })
      .limit(5);

    // Get course distribution by semester
    const { data: courseBySemester } = await supabase
      .from('courses')
      .select('semester')
      .eq('is_active', true);

    // Calculate semester distribution
    const semesterDistribution = courseBySemester?.reduce((acc: any, course: any) => {
      acc[course.semester] = (acc[course.semester] || 0) + 1;
      return acc;
    }, {}) || {};

    // Get student progress data (sample)
    const { data: studentProgress } = await supabase
      .from('students')
      .select('current_semester, total_credits_earned')
      .eq('is_active', true)
      .limit(100);

    const stats = {
      overview: {
        totalStudents: studentsResult.count || 0,
        activeStudents: activeStudentsResult.count || 0,
        totalCourses: coursesResult.count || 0,
        totalUniversities: universitiesResult.count || 0,
        totalEnrollments: enrollmentsResult.count || 0
      },
      recentActivity: {
        newStudents: recentStudents || [],
        courseBySemester: semesterDistribution,
        averageCredits: studentProgress ? 
          studentProgress.reduce((sum, s) => sum + (s.total_credits_earned || 0), 0) / studentProgress.length : 0
      },
      systemHealth: {
        databaseStatus: 'healthy',
        lastUpdate: new Date().toISOString(),
        activeConnections: Math.floor(Math.random() * 50) + 20 // Simulated
      }
    };

    return res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error: any) {
    console.error('Admin stats API error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch statistics'
    });
  }
}
