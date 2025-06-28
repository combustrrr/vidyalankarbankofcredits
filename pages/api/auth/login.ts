/**
 * Student Login API Route
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSupabaseClient } from '@/lib/supabase';
import { verifyPassword, generateToken } from '@/lib/auth';
import { serialize } from 'cookie';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { roll_number, password } = req.body;

  if (!roll_number || !password) {
    return res.status(400).json({ 
      success: false, 
      error: 'Roll number and password are required' 
    });
  }

  try {
    const supabase = getServerSupabaseClient();

    // Find student by roll number
    const { data: student, error } = await supabase
      .from('students')
      .select('*')
      .eq('roll_number', roll_number)
      .single();

    if (error || !student) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials' 
      });
    }

    // Verify password
    const passwordValid = await verifyPassword(password, student.password_hash);
    if (!passwordValid) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials' 
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

    res.status(200).json({
      success: true,
      message: 'Login successful',
      student: studentData
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}
