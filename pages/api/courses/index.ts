/**
 * Courses API Route
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSupabaseClient } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = getServerSupabaseClient();

  switch (req.method) {
    case 'GET':
      return await getCourses(req, res, supabase);
    case 'POST':
      return await createCourse(req, res, supabase);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}

async function getCourses(req: NextApiRequest, res: NextApiResponse, supabase: any) {
  try {
    const { 
      page = 1, 
      pageSize = 20, 
      semester, 
      vertical, 
      basket, 
      type, 
      degree, 
      branch 
    } = req.query;

    let query = supabase.from('courses').select('*', { count: 'exact' });

    // Apply filters
    if (semester) query = query.eq('semester', parseInt(semester as string));
    if (vertical) query = query.eq('vertical', vertical);
    if (basket) query = query.eq('basket', basket);
    if (type) query = query.eq('type', type);
    if (degree) query = query.eq('degree', degree);
    if (branch) query = query.eq('branch', branch);

    // Apply pagination
    const offset = (parseInt(page as string) - 1) * parseInt(pageSize as string);
    query = query.range(offset, offset + parseInt(pageSize as string) - 1);

    // Order by semester and course code
    query = query.order('semester', { ascending: true })
                 .order('course_code', { ascending: true });

    const { data: courses, error, count } = await query;

    if (error) {
      throw error;
    }

    const totalPages = Math.ceil((count || 0) / parseInt(pageSize as string));
    const currentPage = parseInt(page as string);

    res.status(200).json({
      success: true,
      data: {
        data: courses || [],
        totalCount: count || 0,
        currentPage,
        pageSize: parseInt(pageSize as string),
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1
      }
    });

  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch courses' 
    });
  }
}

async function createCourse(req: NextApiRequest, res: NextApiResponse, supabase: any) {
  try {
    const courseData = req.body;

    // Validate required fields
    const requiredFields = ['course_code', 'title', 'type', 'credits', 'semester', 'vertical', 'basket'];
    const missingFields = requiredFields.filter(field => !courseData[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Set defaults
    courseData.degree = courseData.degree || 'BTech';
    courseData.branch = courseData.branch || 'INFT';

    const { data: course, error } = await supabase
      .from('courses')
      .insert([courseData])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return res.status(409).json({
          success: false,
          error: 'Course code already exists'
        });
      }
      throw error;
    }

    res.status(201).json({
      success: true,
      data: course,
      message: 'Course created successfully'
    });

  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create course' 
    });
  }
}
