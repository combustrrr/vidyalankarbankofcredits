import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

// Initialize Supabase client with environment variables directly
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Add debugging for Supabase configuration
console.log('Supabase Config Debug:', { 
  urlDefined: !!supabaseUrl,
  urlLength: supabaseUrl?.length || 0,
  serviceKeyDefined: !!supabaseServiceKey,
  serviceKeyLength: supabaseServiceKey?.length || 0
});

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables:', {
    hasUrl: !!supabaseUrl,
    hasServiceKey: !!supabaseServiceKey
  });
  throw new Error('Missing Supabase environment variables');
}

// JWT Secret for token generation
const JWT_SECRET = process.env.JWT_SECRET || 'vidyalankar-bank-of-credits-secret-key';
console.log('JWT Secret defined:', !!JWT_SECRET);

// Initialize Supabase client
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
  console.log('Signup API called with method:', req.method);
  
  // Only allow POST requests for this endpoint
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Request body received:', {
      ...req.body,
      password: req.body.password ? '[REDACTED]' : undefined
    });
    
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
      console.log('Validation failed - missing required fields');
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate that division is one of the allowed values
    if (!['A', 'B', 'C'].includes(division)) {
      console.log('Validation failed - invalid division:', division);
      return res.status(400).json({ message: 'Division must be one of: A, B, C' });
    }

    console.log('Checking if student already exists with roll number:', roll_number);
    
    // Check if student with this roll number already exists
    const { data: existingStudent, error: checkError } = await supabase
      .from('students')
      .select('roll_number')
      .eq('roll_number', roll_number)
      .single();

    if (checkError) {
      if (checkError.code !== 'PGRST116') {
        // PGRST116 means no rows returned, which is what we want
        console.error('Error checking for existing student:', checkError);
        return res.status(500).json({ message: 'Error checking for existing student' });
      } else {
        console.log('No existing student found with this roll number - good to proceed');
      }
    }

    if (existingStudent) {
      console.log('Student already exists with roll number:', roll_number);
      return res.status(409).json({ message: 'A student with this roll number already exists' });
    }

    // Hash the password before storing
    console.log('Hashing password...');
    const hashedPassword = hashPassword(password);

    // Insert the new student
    console.log('Inserting new student into database...');
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

    console.log('Student created successfully:', {
      id: newStudent.id,
      roll_number: newStudent.roll_number
    });

    // Generate JWT token like in login endpoint
    const token = jwt.sign(
      { 
        id: newStudent.id,
        roll_number: newStudent.roll_number,
        name: newStudent.full_name 
      },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Return the new student data with token
    return res.status(201).json({
      message: 'Student account created successfully',
      student: newStudent,
      token
    });
  } catch (error) {
    console.error('Unexpected error during signup:', error);
    return res.status(500).json({ message: 'An unexpected error occurred' });
  }
}