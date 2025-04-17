-- Enable UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create completed_courses table
CREATE TABLE IF NOT EXISTS public.completed_courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  semester INTEGER NOT NULL CHECK (semester BETWEEN 1 AND 8),
  credit_awarded INTEGER NOT NULL CHECK (credit_awarded > 0),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(student_id, course_id)
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_completed_courses_student_id ON public.completed_courses(student_id);
CREATE INDEX IF NOT EXISTS idx_completed_courses_course_id ON public.completed_courses(course_id);
CREATE INDEX IF NOT EXISTS idx_completed_courses_semester ON public.completed_courses(semester);

-- Add comments for documentation
COMMENT ON TABLE public.completed_courses IS 'Tracks courses completed by students and credits awarded';
COMMENT ON COLUMN public.completed_courses.student_id IS 'References the student who completed the course';
COMMENT ON COLUMN public.completed_courses.course_id IS 'References the course that was completed';
COMMENT ON COLUMN public.completed_courses.credit_awarded IS 'Number of credits awarded for completing this course';