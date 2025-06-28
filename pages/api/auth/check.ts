/**
 * Authentication Check API Route
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSupabaseClient } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';
import { parse } from 'cookie';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const cookies = parse(req.headers.cookie || '');
    const token = cookies.auth_token;

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'No authentication token found' 
      });
    }

    // Verify JWT token
    const decoded = verifyToken(token);
    if (!decoded || decoded.type !== 'student') {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid authentication token' 
      });
    }

    const supabase = getServerSupabaseClient();

    // Get current student data
    const { data: student, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', decoded.id)
      .single();

    if (error || !student) {
      return res.status(404).json({ 
        success: false, 
        error: 'Student not found' 
      });
    }

    // Return student data (without password)
    const { password_hash, ...studentData } = student;

    res.status(200).json({
      success: true,
      authenticated: true,
      student: studentData
    });

  } catch (error) {
    console.error('Auth check error:', error);
    res.status(401).json({ 
      success: false, 
      error: 'Invalid or expired token' 
    });
  }
}
