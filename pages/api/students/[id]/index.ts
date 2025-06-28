/**
 * Individual Student API Routes - Get, Update, Delete
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSupabaseClient } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';
import { parse } from 'cookie';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = getServerSupabaseClient();

  switch (req.method) {
    case 'GET':
      return await getStudent(req, res, supabase);
    case 'PUT':
      return await updateStudent(req, res, supabase);
    case 'DELETE':
      return await deleteStudent(req, res, supabase);
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}

async function getStudent(req: NextApiRequest, res: NextApiResponse, supabase: any) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Student ID is required' 
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

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid authentication token' 
      });
    }

    // Students can only access their own data
    if (decoded.type === 'student' && decoded.id !== id) {
      return res.status(403).json({ 
        success: false, 
        error: 'Access denied' 
      });
    }

    const { data: student, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ 
          success: false, 
          error: 'Student not found' 
        });
      }
      throw error;
    }

    // Return student data (without password)
    const { password_hash, ...studentData } = student;

    res.status(200).json({
      success: true,
      data: studentData
    });

  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch student' 
    });
  }
}

async function updateStudent(req: NextApiRequest, res: NextApiResponse, supabase: any) {
  try {
    const { id } = req.query;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Student ID is required' 
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

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid authentication token' 
      });
    }

    // Students can only update their own data
    if (decoded.type === 'student' && decoded.id !== id) {
      return res.status(403).json({ 
        success: false, 
        error: 'Access denied' 
      });
    }

    // Remove sensitive fields that shouldn't be updated directly
    delete updateData.password_hash;
    delete updateData.id;
    delete updateData.created_at;

    updateData.updated_at = new Date().toISOString();

    const { data: student, error } = await supabase
      .from('students')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    // Return student data (without password)
    const { password_hash, ...studentData } = student;

    res.status(200).json({
      success: true,
      data: studentData
    });

  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update student' 
    });
  }
}

async function deleteStudent(req: NextApiRequest, res: NextApiResponse, supabase: any) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Student ID is required' 
      });
    }

    // This should typically be restricted to admin users only
    const cookies = parse(req.headers.cookie || '');
    const token = cookies.auth_token;

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'No authentication token found' 
      });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.type !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        error: 'Admin access required' 
      });
    }

    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    res.status(200).json({
      success: true,
      message: 'Student deleted successfully'
    });

  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete student' 
    });
  }
}
