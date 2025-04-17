import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from '../../../config';
import crypto from 'crypto';

// Initialize Supabase client
const supabaseUrl = supabaseConfig.url;
const supabaseServiceKey = supabaseConfig.serviceRoleKey;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Create a secure password hash
function hashPassword(password: string): string {
  // Generate a random salt
  const salt = crypto.randomBytes(16).toString('hex');
  
  // Hash the password with the salt using SHA-256
  const hash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, 'sha256')
    .toString('hex');
  
  // Return the salt and hash combined
  return `${salt}:${hash}`;
}

// Type for the request body
interface SignupRequestBody {
  roll_number: string;
  password: string;
  first_name: string;
  last_name: string;
  full_name: string;
  legal_name: string;
  degree: string;
  branch: string;
  division: string;
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
    const {
      roll_number,
      password,
      first_name,
      last_name,
      full_name,
      legal_name,
      degree,
      branch,
      division
    } = req.body as SignupRequestBody;

    // Validate required fields
    if (!roll_number || !password || !first_name || !last_name || !full_name || !legal_name || !division) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate that division is one of the allowed values
    if (!['A', 'B', 'C'].includes(division)) {
      return res.status(400).json({ message: 'Division must be one of: A, B, C' });
    }

    // Check if student with this roll number already exists
    const { data: existingStudent, error: checkError } = await supabase
      .from('students')
      .select('roll_number')
      .eq('roll_number', roll_number)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 means no rows returned, which is what we want
      return res.status(500).json({ message: 'Error checking for existing student' });
    }

    if (existingStudent) {
      return res.status(409).json({ message: 'A student with this roll number already exists' });
    }

    // Hash the password before storing
    const hashedPassword = hashPassword(password);

    // Insert the new student
    const { data: newStudent, error: insertError } = await supabase
      .from('students')
      .insert([
        {
          roll_number,
          password_hash: hashedPassword,
          first_name,
          last_name,
          full_name,
          legal_name,
          degree: degree || 'B.Tech', // Use default if not provided
          branch: branch || 'INFT',   // Use default if not provided
          division
        }
      ])
      .select('id, roll_number, first_name, last_name, full_name, division, degree, branch')
      .single();

    if (insertError) {
      console.error('Error creating student:', insertError);
      return res.status(500).json({ message: 'Failed to create student account' });
    }

    // Return the new student data (excluding password)
    return res.status(201).json({
      message: 'Student account created successfully',
      student: newStudent
    });
  } catch (error) {
    console.error('Unexpected error during signup:', error);
    return res.status(500).json({ message: 'An unexpected error occurred' });
  }
}