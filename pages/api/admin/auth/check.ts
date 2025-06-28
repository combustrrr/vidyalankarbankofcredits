import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { supabase } from '../../../../src/lib/supabase';

const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key';

interface CheckAuthResponse {
  success: boolean;
  message?: string;
  data?: {
    admin: {
      id: string;
      username: string;
      email: string;
      firstName: string;
      lastName: string;
      fullName: string;
      role: {
        id: string;
        roleName: string;
        roleCode: string;
      };
      permissions: string[];
      universityId?: string;
      departmentAccess?: string[];
    };
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CheckAuthResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Get admin details with current data
    const { data: admin, error: adminError } = await supabase
      .from('admins')
      .select(`
        id,
        username,
        email,
        first_name,
        last_name,
        full_name,
        university_id,
        department_access,
        is_active,
        admin_role_id,
        admin_roles!inner (
          id,
          role_name,
          role_code
        )
      `)
      .eq('id', decoded.adminId)
      .eq('is_active', true)
      .single();

    if (adminError || !admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Get current permissions (updated for new structure)
    const { data: permissions, error: permError } = await supabase
      .from('admin_permissions')
      .select('permission_code')
      .eq('admin_role_id', admin.admin_role_id)
      .eq('granted', true);

    if (permError) {
      console.error('Error fetching permissions:', permError);
      return res.status(500).json({
        success: false,
        message: 'Error fetching user permissions'
      });
    }

    // Extract role from joined data
    const adminRole = Array.isArray(admin.admin_roles) ? admin.admin_roles[0] : admin.admin_roles;

    return res.status(200).json({
      success: true,
      data: {
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          firstName: admin.first_name,
          lastName: admin.last_name,
          fullName: admin.full_name,
          role: {
            id: adminRole.id,
            roleName: adminRole.role_name,
            roleCode: adminRole.role_code
          },
          permissions: permissions?.map((p: any) => p.permission_code) || [],
          universityId: admin.university_id,
          departmentAccess: admin.department_access
        }
      }
    });

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    console.error('Auth check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
