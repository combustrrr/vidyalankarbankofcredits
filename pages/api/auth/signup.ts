/**
 * Student Signup API Route
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSupabaseClient } from '@/lib/supabase';
import { hashPassword, generateToken } from '@/lib/auth';
import { serialize } from 'cookie';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { 
    roll_number, 
    full_name, 
    first_name,
    last_name,
    legal_name,
    password,
    degree,
    branch,
    division 
  } = req.body;

  // Validate required fields
  if (!roll_number || !full_name || !first_name || !last_name || !password || !degree || !branch) {
    return res.status(400).json({ 
      success: false, 
      error: 'All required fields must be provided' 
    });
  }

  try {
    const supabase = getServerSupabaseClient();

    // Check if student already exists
    const { data: existingStudent } = await supabase
      .from('students')
      .select('id')
      .eq('roll_number', roll_number)
      .single();

    if (existingStudent) {
      return res.status(409).json({ 
        success: false, 
        error: 'Student with this roll number already exists' 
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create new student
    const { data: student, error } = await supabase
      .from('students')
      .insert([{
        roll_number,
        first_name,
        last_name,
        full_name,
        legal_name,
        password_hash: passwordHash,
        degree,
        branch,
        division,
        total_credits_earned: 0,
        semester: null // Will be set after semester selection
      }])
      .select('*')
      .single();

    if (error) {
      console.error('Signup error:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to create student account' 
      });
    }

    // Generate JWT token
    const token = generateToken({
      id: student.id,
      roll_number: student.roll_number,
      name: student.full_name,
      type: 'student'
    });

    // Set secure cookie
    const cookie = serialize('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    res.setHeader('Set-Cookie', cookie);

    // Return student data (without password)
    const { password_hash, ...studentData } = student;

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      student: studentData
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}
