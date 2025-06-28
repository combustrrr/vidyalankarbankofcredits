import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Admin ID is required'
    });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    if (req.method === 'PATCH') {
      // Update admin user
      const { is_active, admin_role_id } = req.body;
      
      const updateData: any = {};
      if (typeof is_active === 'boolean') {
        updateData.is_active = is_active;
      }
      if (admin_role_id) {
        // Get role ID from role code
        const { data: role, error: roleError } = await supabase
          .from('admin_roles')
          .select('id')
          .eq('role_code', admin_role_id)
          .single();

        if (roleError || !role) {
          return res.status(400).json({
            success: false,
            message: 'Invalid role specified'
          });
        }
        updateData.admin_role_id = role.id;
      }

      const { data: updatedAdmin, error } = await supabase
        .from('admins')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return res.status(500).json({
          success: false,
          message: 'Error updating admin user',
          error: error.message
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Admin user updated successfully',
        admin: updatedAdmin
      });

    } else if (req.method === 'DELETE') {
      // Delete admin user (soft delete by deactivating)
      const { data: updatedAdmin, error } = await supabase
        .from('admins')
        .update({ is_active: false })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return res.status(500).json({
          success: false,
          message: 'Error deleting admin user',
          error: error.message
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Admin user deleted successfully'
      });

    } else {
      return res.status(405).json({
        success: false,
        message: 'Method not allowed'
      });
    }

  } catch (error) {
    console.error('Admin user API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
