import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { supabase } from '../../../../src/lib/supabase';

const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key';

interface LogoutResponse {
  success: boolean;
  message?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LogoutResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        
        // Invalidate all sessions for this admin
        await supabase
          .from('admin_sessions')
          .update({ is_active: false })
          .eq('admin_id', decoded.adminId);
        
      } catch (error) {
        // Token invalid or expired, but still return success
        console.log('Invalid token during logout:', error);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
