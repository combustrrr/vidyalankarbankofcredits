/**
 * Students API Routes - List and Create
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSupabaseClient } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';
import { parse } from 'cookie';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = getServerSupabaseClient();

  switch (req.method) {
    case 'GET':
      return await getStudents(req, res, supabase);
    case 'POST':
      return await createStudent(req, res, supabase);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}

async function getStudents(req: NextApiRequest, res: NextApiResponse, supabase: any) {
  try {
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

    const { 
      page = 1, 
      pageSize = 20,
      search,
      degree,
      branch,
      semester
    } = req.query;

    let query = supabase
      .from('students')
      .select('id, roll_number, first_name, last_name, full_name, degree, branch, semester, division, created_at', { count: 'exact' });

    // Apply filters
    if (search) {
      query = query.or(`roll_number.ilike.%${search}%,full_name.ilike.%${search}%`);
    }
    if (degree) query = query.eq('degree', degree);
    if (branch) query = query.eq('branch', branch);
    if (semester) query = query.eq('semester', parseInt(semester as string));

    // Apply pagination
    const offset = (parseInt(page as string) - 1) * parseInt(pageSize as string);
    query = query.range(offset, offset + parseInt(pageSize as string) - 1);

    // Order by roll number
    query = query.order('roll_number', { ascending: true });

    const { data: students, error, count } = await query;

    if (error) {
      throw error;
    }

    const totalPages = Math.ceil((count || 0) / parseInt(pageSize as string));
    const currentPage = parseInt(page as string);

    res.status(200).json({
      success: true,
      data: {
        data: students || [],
        totalCount: count || 0,
        currentPage,
        pageSize: parseInt(pageSize as string),
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1
      }
    });

  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch students' 
    });
  }
}

async function createStudent(req: NextApiRequest, res: NextApiResponse, supabase: any) {
  try {
    // This should typically be restricted to admin users
    const studentData = req.body;

    const { data: student, error } = await supabase
      .from('students')
      .insert([studentData])
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    // Return student data (without password)
    const { password_hash, ...studentResult } = student;

    res.status(201).json({
      success: true,
      data: studentResult
    });

  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create student' 
    });
  }
}
