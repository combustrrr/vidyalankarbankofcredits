import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from '../../../config';
import jwt from 'jsonwebtoken';

// Initialize Supabase client
const supabaseUrl = supabaseConfig.url;
const supabaseServiceKey = supabaseConfig.serviceRoleKey;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// JWT Secret (should be in environment variables in production)
const JWT_SECRET = process.env.JWT_SECRET || 'vidyalankar-bank-of-credits-secret-key';

interface JwtPayload {
  id: string;
  roll_number: string;
  name: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET requests for this endpoint
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get token from header
    const authHeader = req.headers['student-authorization'] as string;
    const token = authHeader?.split(' ')[1]; // Format: "Bearer TOKEN"
    
    // Validate the token if it exists
    if (token) {
      try {
        // Verify the token
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        
        // Fetch the student by ID from the token
        const { data: student, error } = await supabase
          .from('students')
          .select('id, roll_number, first_name, last_name, full_name, legal_name, degree, branch, division, created_at, updated_at')
          .eq('id', decoded.id)
          .single();

        if (error) {
          return res.status(404).json({ message: 'Student not found' });
        }

        return res.status(200).json({
          message: 'Student profile retrieved successfully',
          student
        });
      } catch (jwtError) {
        return res.status(401).json({ message: 'Invalid or expired token' });
      }
    }

    // If no token, fall back to roll_number query parameter
    const { roll_number } = req.query;

    if (!roll_number) {
      return res.status(400).json({ message: 'Authentication required' });
    }

    // Fetch the student by roll number
    const { data: student, error } = await supabase
      .from('students')
      .select('id, roll_number, first_name, last_name, full_name, legal_name, degree, branch, division, created_at, updated_at')
      .eq('roll_number', roll_number)
      .single();

    if (error) {
      return res.status(404).json({ message: 'Student not found' });
    }

    return res.status(200).json({
      message: 'Student profile retrieved successfully',
      student
    });
  } catch (error) {
    console.error('Unexpected error retrieving student profile:', error);
    return res.status(500).json({ message: 'An unexpected error occurred' });
  }
}