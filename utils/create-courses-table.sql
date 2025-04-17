-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create courses table
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Theory', 'Practical')),
  credits INTEGER NOT NULL CHECK (credits > 0),
  semester INTEGER NOT NULL CHECK (semester BETWEEN 1 AND 8),
  degree TEXT NOT NULL,
  branch TEXT NOT NULL,
  vertical TEXT NOT NULL,
  basket TEXT NOT NULL,
  structure_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create index on frequently queried columns
CREATE INDEX IF NOT EXISTS idx_courses_vertical_semester ON public.courses(vertical, semester);
CREATE INDEX IF NOT EXISTS idx_courses_basket ON public.courses(basket);