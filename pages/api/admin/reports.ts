import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Use service role key for admin operations
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    switch (req.method) {
      case 'GET':
        const { type } = req.query;
        
        if (type === 'student-progress') {
          // Student Progress Report
          const { data: progressData } = await supabase
            .from('students')
            .select(`
              id, roll_number, full_name, degree, branch, current_semester,
              total_credits_earned, cgpa
            `)
            .eq('is_active', true)
            .order('total_credits_earned', { ascending: false });

          return res.status(200).json({
            success: true,
            data: {
              type: 'student_progress',
              students: progressData || [],
              summary: {
                totalStudents: progressData?.length || 0,
                averageCredits: progressData ? 
                  progressData.reduce((sum, s) => sum + (s.total_credits_earned || 0), 0) / progressData.length : 0,
                averageCGPA: progressData ? 
                  progressData.reduce((sum, s) => sum + (s.cgpa || 0), 0) / progressData.length : 0
              }
            }
          });
          
        } else if (type === 'course-analytics') {
          // Course Analytics Report
          const { data: courseData } = await supabase
            .from('courses')
            .select('id, course_code, title, credits, semester, degree, branch, vertical, basket, is_active')
            .order('semester', { ascending: true });

          // Group by semester and vertical
          const analytics = courseData?.reduce((acc: any, course: any) => {
            const semKey = `semester_${course.semester}`;
            if (!acc[semKey]) acc[semKey] = { semester: course.semester, courses: [], totalCredits: 0 };
            acc[semKey].courses.push(course);
            acc[semKey].totalCredits += course.credits || 0;
            return acc;
          }, {}) || {};

          return res.status(200).json({
            success: true,
            data: {
              type: 'course_analytics',
              analytics: Object.values(analytics),
              summary: {
                totalCourses: courseData?.length || 0,
                activeCourses: courseData?.filter(c => c.is_active).length || 0,
                totalCreditsOffered: courseData?.reduce((sum, c) => sum + (c.credits || 0), 0) || 0
              }
            }
          });
          
        } else if (type === 'enrollment-stats') {
          // Enrollment Statistics
          const { data: enrollmentData } = await supabase
            .from('course_enrollments')
            .select(`
              id, course_id, student_id, enrollment_status,
              courses!inner(course_code, title, semester),
              students!inner(roll_number, degree, branch)
            `)
            .limit(1000);

          const enrollmentStats = enrollmentData?.reduce((acc: any, enrollment: any) => {
            const status = enrollment.enrollment_status || 'enrolled';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
          }, {}) || {};

          return res.status(200).json({
            success: true,
            data: {
              type: 'enrollment_stats',
              enrollments: enrollmentData || [],
              stats: enrollmentStats,
              summary: {
                totalEnrollments: enrollmentData?.length || 0,
                activeEnrollments: enrollmentData?.filter(e => e.enrollment_status === 'enrolled').length || 0
              }
            }
          });
          
        } else {
          // Default: Combined reports overview
          const [students, courses, enrollments] = await Promise.all([
            supabase.from('students').select('id', { count: 'exact' }).eq('is_active', true),
            supabase.from('courses').select('id', { count: 'exact' }).eq('is_active', true),
            supabase.from('course_enrollments').select('id', { count: 'exact' }).limit(1)
          ]);

          return res.status(200).json({
            success: true,
            data: {
              type: 'overview',
              summary: {
                activeStudents: students.count || 0,
                activeCourses: courses.count || 0,
                totalEnrollments: enrollments.count || 0
              },
              availableReports: [
                { type: 'student-progress', name: 'Student Progress Report' },
                { type: 'course-analytics', name: 'Course Analytics' },
                { type: 'enrollment-stats', name: 'Enrollment Statistics' }
              ]
            }
          });
        }

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Admin reports API error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
