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
        // Get all courses with admin access
        const { data: courses, error } = await supabase
          .from('courses')
          .select(`
            *,
            universities!inner(name),
            departments(name),
            degree_programs(name),
            branches(name)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        return res.status(200).json({
          success: true,
          data: courses || []
        });

      case 'POST':
        // Create new course
        const courseData = req.body;
        
        const { data: newCourse, error: createError } = await supabase
          .from('courses')
          .insert([{
            university_id: courseData.university_id,
            course_code: courseData.course_code,
            title: courseData.title,
            course_type: courseData.course_type,
            credits: courseData.credits,
            semester: courseData.semester,
            degree: courseData.degree,
            branch: courseData.branch,
            vertical: courseData.vertical,
            basket: courseData.basket,
            type: courseData.type,
            description: courseData.description,
            is_active: true
          }])
          .select()
          .single();

        if (createError) throw createError;

        return res.status(201).json({
          success: true,
          data: newCourse,
          message: 'Course created successfully'
        });

      case 'PUT':
        // Update existing course
        const { id, ...updateData } = req.body;
        
        const { data: updatedCourse, error: updateError } = await supabase
          .from('courses')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();

        if (updateError) throw updateError;

        return res.status(200).json({
          success: true,
          data: updatedCourse,
          message: 'Course updated successfully'
        });

      case 'DELETE':
        // Soft delete course (deactivate)
        const { id: deleteId } = req.body;
        
        const { error: deleteError } = await supabase
          .from('courses')
          .update({ is_active: false })
          .eq('id', deleteId);

        if (deleteError) throw deleteError;

        return res.status(200).json({
          success: true,
          message: 'Course deactivated successfully'
        });

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Admin courses API error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
