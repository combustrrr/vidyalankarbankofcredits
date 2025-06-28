import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key';

interface LoginRequest {
  username: string;
  password: string;
}

interface AdminLoginResponse {
  success: boolean;
  message?: string;
  data?: {
    token: string;
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
  res: NextApiResponse<AdminLoginResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  const { username, password }: LoginRequest = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username and password are required'
    });
  }

  try {
    // Use service role key to bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get admin with role information
    const { data: admin, error: adminError } = await supabase
      .from('admins')
      .select(`
        id,
        username,
        email,
        password_hash,
        first_name,
        last_name,
        full_name,
        university_id,
        department_access,
        is_active,
        is_verified,
        failed_login_attempts,
        locked_until,
        admin_role_id
      `)
      .eq('username', username)
      .eq('is_active', true)
      .single();

    if (adminError || !admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Get admin role separately
    const { data: adminRole, error: roleError } = await supabase
      .from('admin_roles')
      .select('id, role_name, role_code')
      .eq('id', admin.admin_role_id)
      .single();

    if (roleError || !adminRole) {
      return res.status(500).json({
        success: false,
        message: 'Failed to load admin role'
      });
    }

    // Check if account is locked
    if (admin.locked_until && new Date(admin.locked_until) > new Date()) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked. Please try again later.'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password_hash);

    if (!isPasswordValid) {
      // Increment failed login attempts
      const newFailedAttempts = (admin.failed_login_attempts || 0) + 1;
      const shouldLock = newFailedAttempts >= 5;
      
      await supabase
        .from('admins')
        .update({
          failed_login_attempts: newFailedAttempts,
          locked_until: shouldLock ? new Date(Date.now() + 30 * 60 * 1000) : null // 30 min lock
        })
        .eq('id', admin.id);

      return res.status(401).json({
        success: false,
        message: shouldLock 
          ? 'Too many failed attempts. Account locked for 30 minutes.'
          : 'Invalid credentials'
      });
    }

    // Get admin permissions (simplified approach)
    const userPermissions: string[] = [];

    // Reset failed login attempts and update last login
    await supabase
      .from('admins')
      .update({
        failed_login_attempts: 0,
        locked_until: null,
        last_login: new Date().toISOString()
      })
      .eq('id', admin.id);

    // Create JWT token
    const token = jwt.sign(
      {
        adminId: admin.id,
        username: admin.username,
        roleCode: adminRole.role_code,
        universityId: admin.university_id
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Create session record
    const sessionToken = jwt.sign(
      { adminId: admin.id, timestamp: Date.now() },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    await supabase.rpc('create_admin_session', {
      admin_id: admin.id,
      session_token: sessionToken,
      ip_address: clientIp,
      user_agent: userAgent,
      expires_in_hours: 24
    });

    // Return success response
    return res.status(200).json({
      success: true,
      data: {
        token,
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
          permissions: userPermissions,
          universityId: admin.university_id,
          departmentAccess: admin.department_access
        }
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
