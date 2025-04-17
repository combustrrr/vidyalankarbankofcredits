-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create students table
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  roll_number TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  legal_name TEXT NOT NULL,
  degree TEXT NOT NULL DEFAULT 'B.Tech',
  branch TEXT NOT NULL DEFAULT 'INFT',
  division TEXT NOT NULL CHECK (division IN ('A', 'B', 'C')),
  semester INTEGER DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create index on frequently queried columns
CREATE INDEX IF NOT EXISTS idx_students_roll_number ON public.students(roll_number);

-- Add comment to emphasize password storage requirements
COMMENT ON COLUMN public.students.password_hash IS 'Store password hashes only, never plaintext passwords';
