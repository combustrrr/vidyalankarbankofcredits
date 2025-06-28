/**
 * Update Student Semester API Route (by ID)
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSupabaseClient } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';
import { parse } from 'cookie';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH' && req.method !== 'PUT') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const { semester } = req.body;

    if (!id || !semester) {
      return res.status(400).json({ 
        success: false, 
        error: 'Student ID and semester are required' 
      });
    }

    if (semester < 1 || semester > 8) {
      return res.status(400).json({ 
        success: false, 
        error: 'Valid semester (1-8) is required' 
      });
    }

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

    // Check if the student is updating their own data
    if (decoded.id !== id) {
      return res.status(403).json({ 
        success: false, 
        error: 'You can only update your own semester' 
      });
    }

    const supabase = getServerSupabaseClient();

    // Update student semester
    const { data: student, error } = await supabase
      .from('students')
      .update({ 
        semester: parseInt(semester),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Update semester error:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to update semester' 
      });
    }

    if (!student) {
      return res.status(404).json({ 
        success: false, 
        error: 'Student not found' 
      });
    }

    // Return updated student data (without password)
    const { password_hash, ...studentData } = student;

    res.status(200).json({
      success: true,
      message: 'Semester updated successfully',
      student: studentData
    });

  } catch (error) {
    console.error('Update semester error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Invalid or expired token' 
    });
  }
}
