import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

interface AdminUser {
  id: string;
  username: string;
  email: string;
  full_name: string;
  is_active: boolean;
  admin_roles: {
    role_name: string;
    role_code: string;
  };
  created_at: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    if (req.method === 'GET') {
      // Get all admin users
      const { data: admins, error } = await supabase
        .from('admins')
        .select(`
          id,
          username,
          email,
          full_name,
          is_active,
          created_at,
          admin_roles (
            role_name,
            role_code
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        return res.status(500).json({
          success: false,
          message: 'Error fetching admin users',
          error: error.message
        });
      }

      return res.status(200).json({
        success: true,
        admins: admins || []
      });

    } else if (req.method === 'POST') {
      // Create new admin user
      const { username, email, password, first_name, last_name, admin_role_id } = req.body;

      if (!username || !email || !password || !first_name || !last_name || !admin_role_id) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required'
        });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);

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

      // Create admin user
      const { data: newAdmin, error: createError } = await supabase
        .from('admins')
        .insert({
          username,
          email,
          password_hash: passwordHash,
          first_name,
          last_name,
          full_name: `${first_name} ${last_name}`,
          admin_role_id: role.id,
          is_active: true,
          is_verified: true
        })
        .select()
        .single();

      if (createError) {
        return res.status(500).json({
          success: false,
          message: 'Error creating admin user',
          error: createError.message
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Admin user created successfully',
        admin: newAdmin
      });

    } else {
      return res.status(405).json({
        success: false,
        message: 'Method not allowed'
      });
    }

  } catch (error) {
    console.error('Admin users API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
