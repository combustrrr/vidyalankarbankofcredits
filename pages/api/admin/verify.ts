import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

interface VerifyResponse {
  success: boolean;
  message: string;
  data?: any;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VerifyResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    // Use service role key to bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if admin tables exist and have data
    const { data: roles, error: rolesError } = await supabase
      .from('admin_roles')
      .select('role_name, role_code')
      .order('role_code');

    if (rolesError) {
      return res.status(500).json({
        success: false,
        message: 'Admin roles table not found or inaccessible',
        data: { error: rolesError.message }
      });
    }

    const { data: permissions, error: permError } = await supabase
      .from('admin_permissions')
      .select('permission_name, permission_code')
      .order('permission_code');

    if (permError) {
      return res.status(500).json({
        success: false,
        message: 'Admin permissions table not found or inaccessible',
        data: { error: permError.message }
      });
    }

    const { data: admin, error: adminError } = await supabase
      .from('admins')
      .select('username, email, full_name, is_active')
      .eq('username', 'superadmin')
      .single();

    if (adminError) {
      return res.status(500).json({
        success: false,
        message: 'Superadmin user not found',
        data: { error: adminError.message }
      });
    }

    // Get all admin users for verification
    const { data: allAdmins, error: allAdminsError } = await supabase
      .from('admins')
      .select(`
        username,
        email,
        full_name,
        is_active,
        admin_roles (role_name, role_code)
      `)
      .order('username');

    return res.status(200).json({
      success: true,
      message: 'Admin system verification successful',
      data: {
        totalRoles: roles?.length || 0,
        totalPermissions: permissions?.length || 0,
        superAdmin: admin ? 'Found' : 'Not found',
        adminDetails: admin,
        roles: roles || [],
        permissions: permissions || [],
        adminUsers: allAdmins || []
      }
    });

  } catch (error) {
    console.error('Admin verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during verification'
    });
  }
}
