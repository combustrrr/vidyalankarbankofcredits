import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

// Initialize Supabase client with environment variables directly
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// JWT Secret (should be in environment variables in production)
const JWT_SECRET = process.env.JWT_SECRET || 'vidyalankar-bank-of-credits-secret-key';
// Token expiration (1 day)
const TOKEN_EXPIRATION = '1d';

// Verify password against stored hash
function verifyPassword(providedPassword: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(':');
  
  const calculatedHash = crypto
    .pbkdf2Sync(providedPassword, salt, 10000, 64, 'sha256')
    .toString('hex');
  
  return hash === calculatedHash;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests for this endpoint
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { roll_number, password } = req.body;

    // Validate required fields
    if (!roll_number || !password) {
      return res.status(400).json({ message: 'Roll number and password are required' });
    }

    // Find the student with the provided roll number
    const { data: student, error } = await supabase
      .from('students')
      .select('id, roll_number, password_hash, first_name, last_name, full_name, legal_name, division, degree, branch, semester, created_at, updated_at')
      .eq('roll_number', roll_number)
      .single();

    if (error) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify the password
    if (!verifyPassword(password, student.password_hash)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Remove password hash from the response
    const { password_hash: _, ...studentData } = student;

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: student.id,
        roll_number: student.roll_number,
        name: student.full_name 
      },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRATION }
    );

    // Return student data with JWT token
    return res.status(200).json({
      message: 'Login successful',
      student: studentData,
      token
    });
  } catch (error) {
    console.error('Unexpected error during login:', error);
    return res.status(500).json({ message: 'An unexpected error occurred' });
  }
}