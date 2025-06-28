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
        // Get all students with admin access
        const { data: students, error } = await supabase
          .from('students')
          .select(`
            *,
            universities!inner(name),
            departments(name),
            degree_programs(name),
            branches(name)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Get student count by status for overview
        const { data: activeCount } = await supabase
          .from('students')
          .select('id', { count: 'exact' })
          .eq('is_active', true);

        const { data: totalCount } = await supabase
          .from('students')
          .select('id', { count: 'exact' });

        return res.status(200).json({
          success: true,
          data: {
            students: students || [],
            stats: {
              total: totalCount?.length || 0,
              active: activeCount?.length || 0
            }
          }
        });

      case 'POST':
        // Create new student account
        const studentData = req.body;
        
        const { data: newStudent, error: createError } = await supabase
          .from('students')
          .insert([{
            university_id: studentData.university_id,
            roll_number: studentData.roll_number,
            email: studentData.email,
            password_hash: studentData.password_hash, // Should be hashed before sending
            first_name: studentData.first_name,
            last_name: studentData.last_name,
            full_name: `${studentData.first_name} ${studentData.last_name}`,
            degree: studentData.degree,
            branch: studentData.branch,
            semester: studentData.semester,
            division: studentData.division,
            academic_year: studentData.academic_year,
            is_active: true
          }])
          .select()
          .single();

        if (createError) throw createError;

        return res.status(201).json({
          success: true,
          data: newStudent,
          message: 'Student created successfully'
        });

      case 'PUT':
        // Update student information
        const { id, ...updateData } = req.body;
        
        const { data: updatedStudent, error: updateError } = await supabase
          .from('students')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();

        if (updateError) throw updateError;

        return res.status(200).json({
          success: true,
          data: updatedStudent,
          message: 'Student updated successfully'
        });

      case 'DELETE':
        // Soft delete student (deactivate)
        const { id: deleteId } = req.body;
        
        const { error: deleteError } = await supabase
          .from('students')
          .update({ is_active: false })
          .eq('id', deleteId);

        if (deleteError) throw deleteError;

        return res.status(200).json({
          success: true,
          message: 'Student deactivated successfully'
        });

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Admin students API error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
