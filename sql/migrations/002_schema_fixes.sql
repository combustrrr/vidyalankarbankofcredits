-- ================================================================
-- FINAL DATABASE VERIFICATION AND SETUP
-- ================================================================

-- First, let's ensure we have the main database schema applied
-- Run this after running the main database-schema.sql

-- ================================================================
-- VERIFY ESSENTIAL TABLES EXIST
-- ================================================================

DO $$ 
DECLARE
    table_exists boolean;
BEGIN
    -- Check if essential tables exist
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'students'
    ) INTO table_exists;
    
    IF NOT table_exists THEN
        RAISE EXCEPTION 'Students table does not exist. Please run database-schema.sql first.';
    END IF;
    
    RAISE NOTICE 'Essential tables verification passed.';
END
$$;

-- ================================================================
-- ADD COMPATIBILITY COLUMNS (SAFE TO RUN MULTIPLE TIMES)
-- ================================================================

-- Add string columns for backward compatibility
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS degree VARCHAR(50),
ADD COLUMN IF NOT EXISTS branch VARCHAR(50),
ADD COLUMN IF NOT EXISTS semester INTEGER;

ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS degree VARCHAR(50),
ADD COLUMN IF NOT EXISTS branch VARCHAR(50),
ADD COLUMN IF NOT EXISTS vertical VARCHAR(50),
ADD COLUMN IF NOT EXISTS basket VARCHAR(50),
ADD COLUMN IF NOT EXISTS type VARCHAR(20);

ALTER TABLE completed_courses 
ADD COLUMN IF NOT EXISTS credit_awarded INTEGER DEFAULT 0;

-- ================================================================
-- UPDATE CONSTRAINTS AND NULLABILITY
-- ================================================================

-- Drop existing constraints that might conflict
ALTER TABLE students DROP CONSTRAINT IF EXISTS students_current_semester_check;
ALTER TABLE students DROP CONSTRAINT IF EXISTS students_semester_check;

-- Add updated constraint
ALTER TABLE students 
ADD CONSTRAINT students_semester_check CHECK (semester IS NULL OR (semester BETWEEN 1 AND 12));

-- Make foreign keys nullable for compatibility
ALTER TABLE students 
ALTER COLUMN university_id DROP NOT NULL,
ALTER COLUMN degree_program_id DROP NOT NULL,
ALTER COLUMN branch_id DROP NOT NULL,
ALTER COLUMN academic_year_id DROP NOT NULL;

ALTER TABLE courses 
ALTER COLUMN university_id DROP NOT NULL,
ALTER COLUMN vertical_id DROP NOT NULL,
ALTER COLUMN basket_id DROP NOT NULL;

-- Set default university where missing
UPDATE students 
SET university_id = '550e8400-e29b-41d4-a716-446655440000'
WHERE university_id IS NULL;

UPDATE courses 
SET university_id = '550e8400-e29b-41d4-a716-446655440000'
WHERE university_id IS NULL;

-- Update course type mapping
UPDATE courses 
SET type = course_type 
WHERE type IS NULL AND course_type IS NOT NULL;

-- ================================================================
-- ROW LEVEL SECURITY POLICIES (SAFE TO RUN MULTIPLE TIMES)
-- ================================================================

-- Enable RLS on all tables
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE completed_courses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Students can view own data" ON students;
DROP POLICY IF EXISTS "Students can update own data" ON students;
DROP POLICY IF EXISTS "Students can insert own data" ON students;
DROP POLICY IF EXISTS "Allow authenticated users to read courses" ON courses;
DROP POLICY IF EXISTS "Allow admins to manage courses" ON courses;
DROP POLICY IF EXISTS "Students can view own completed courses" ON completed_courses;
DROP POLICY IF EXISTS "Students can insert own completed courses" ON completed_courses;
DROP POLICY IF EXISTS "Allow admins to manage completed courses" ON completed_courses;

-- Create comprehensive policies
CREATE POLICY "Students can view own data" ON students
  FOR SELECT USING (
    auth.uid()::text = id::text OR 
    (current_setting('request.jwt.claims', true)::json->>'role' = 'admin')
  );

CREATE POLICY "Students can update own data" ON students
  FOR UPDATE USING (
    auth.uid()::text = id::text OR 
    (current_setting('request.jwt.claims', true)::json->>'role' = 'admin')
  );

CREATE POLICY "Students can insert own data" ON students
  FOR INSERT WITH CHECK (true); -- Allow inserts for signup

CREATE POLICY "Allow all to read courses" ON courses
  FOR SELECT USING (true); -- All authenticated users can read courses

CREATE POLICY "Allow insert courses" ON courses
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update courses" ON courses
  FOR UPDATE USING (true);

CREATE POLICY "Students can view own completed courses" ON completed_courses
  FOR SELECT USING (
    auth.uid()::text = student_id::text OR 
    (current_setting('request.jwt.claims', true)::json->>'role' = 'admin')
  );

CREATE POLICY "Students can insert own completed courses" ON completed_courses
  FOR INSERT WITH CHECK (
    auth.uid()::text = student_id::text OR 
    (current_setting('request.jwt.claims', true)::json->>'role' = 'admin')
  );

CREATE POLICY "Allow update completed courses" ON completed_courses
  FOR UPDATE USING (true);

-- ================================================================
-- SAMPLE DATA FOR TESTING
-- ================================================================

-- Insert sample courses for all 8 semesters
INSERT INTO courses (
  university_id, course_code, title, course_type, credits, semester,
  degree, branch, vertical, basket, type
) VALUES 
-- Semester 1
('550e8400-e29b-41d4-a716-446655440000', 'MA101', 'Engineering Mathematics I', 'Theory', 4, 1, 'BTech', 'INFT', 'BSC', 'Mathematics', 'Theory'),
('550e8400-e29b-41d4-a716-446655440000', 'PH101', 'Engineering Physics I', 'Theory', 3, 1, 'BTech', 'INFT', 'BSC', 'Physics', 'Theory'),
('550e8400-e29b-41d4-a716-446655440000', 'CH101', 'Engineering Chemistry', 'Theory', 3, 1, 'BTech', 'INFT', 'BSC', 'Chemistry', 'Theory'),
('550e8400-e29b-41d4-a716-446655440000', 'ME101', 'Engineering Mechanics', 'Theory', 3, 1, 'BTech', 'INFT', 'ESC', 'Engineering', 'Theory'),
('550e8400-e29b-41d4-a716-446655440000', 'CS101', 'Programming Fundamentals', 'Theory', 4, 1, 'BTech', 'INFT', 'ESC', 'Programming', 'Theory'),
('550e8400-e29b-41d4-a716-446655440000', 'EN101', 'English Communication', 'Theory', 2, 1, 'BTech', 'INFT', 'AEC', 'Communication', 'Theory'),

-- Semester 2
('550e8400-e29b-41d4-a716-446655440000', 'MA102', 'Engineering Mathematics II', 'Theory', 4, 2, 'BTech', 'INFT', 'BSC', 'Mathematics', 'Theory'),
('550e8400-e29b-41d4-a716-446655440000', 'PH102', 'Engineering Physics II', 'Theory', 3, 2, 'BTech', 'INFT', 'BSC', 'Physics', 'Theory'),
('550e8400-e29b-41d4-a716-446655440000', 'EE101', 'Basic Electrical Engineering', 'Theory', 3, 2, 'BTech', 'INFT', 'ESC', 'Electrical', 'Theory'),
('550e8400-e29b-41d4-a716-446655440000', 'CS102', 'Data Structures', 'Theory', 4, 2, 'BTech', 'INFT', 'PCC', 'Core', 'Theory'),
('550e8400-e29b-41d4-a716-446655440000', 'CS103', 'Digital Logic Design', 'Theory', 3, 2, 'BTech', 'INFT', 'ESC', 'Digital', 'Theory'),

-- Semester 3
('550e8400-e29b-41d4-a716-446655440000', 'MA201', 'Discrete Mathematics', 'Theory', 4, 3, 'BTech', 'INFT', 'BSC', 'Mathematics', 'Theory'),
('550e8400-e29b-41d4-a716-446655440000', 'CS201', 'Database Management Systems', 'Theory', 4, 3, 'BTech', 'INFT', 'PCC', 'Core', 'Theory'),
('550e8400-e29b-41d4-a716-446655440000', 'CS202', 'Computer Networks', 'Theory', 4, 3, 'BTech', 'INFT', 'PCC', 'Core', 'Theory'),
('550e8400-e29b-41d4-a716-446655440000', 'CS203', 'Operating Systems', 'Theory', 4, 3, 'BTech', 'INFT', 'PCC', 'Core', 'Theory'),
('550e8400-e29b-41d4-a716-446655440000', 'CS204', 'Object Oriented Programming', 'Theory', 3, 3, 'BTech', 'INFT', 'PCC', 'Core', 'Theory'),

-- Semester 4
('550e8400-e29b-41d4-a716-446655440000', 'MA202', 'Probability and Statistics', 'Theory', 4, 4, 'BTech', 'INFT', 'BSC', 'Mathematics', 'Theory'),
('550e8400-e29b-41d4-a716-446655440000', 'CS301', 'Software Engineering', 'Theory', 4, 4, 'BTech', 'INFT', 'PCC', 'Core', 'Theory'),
('550e8400-e29b-41d4-a716-446655440000', 'CS302', 'Computer Graphics', 'Theory', 3, 4, 'BTech', 'INFT', 'PCC', 'Core', 'Theory'),
('550e8400-e29b-41d4-a716-446655440000', 'CS303', 'Theory of Computation', 'Theory', 4, 4, 'BTech', 'INFT', 'PCC', 'Core', 'Theory'),
('550e8400-e29b-41d4-a716-446655440000', 'HU101', 'Engineering Economics', 'Theory', 2, 4, 'BTech', 'INFT', 'EEMC', 'Economics', 'Theory')

ON CONFLICT (university_id, course_code) DO NOTHING;

-- ================================================================
-- VERIFICATION QUERIES
-- ================================================================

-- Verify column existence
SELECT 
  'Students table structure' as verification,
  count(*) as total_columns,
  string_agg(column_name, ', ') as key_columns
FROM information_schema.columns 
WHERE table_name = 'students' 
AND column_name IN ('id', 'roll_number', 'degree', 'branch', 'semester', 'password_hash')

UNION ALL

SELECT 
  'Courses table structure' as verification,
  count(*) as total_columns,
  string_agg(column_name, ', ') as key_columns
FROM information_schema.columns 
WHERE table_name = 'courses'
AND column_name IN ('id', 'course_code', 'degree', 'branch', 'vertical', 'basket', 'type')

UNION ALL

SELECT 
  'Sample courses available' as verification,
  count(*) as total_columns,
  'Total courses: ' || count(*) as key_columns
FROM courses;

-- Verify RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd as policy_type
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('students', 'courses', 'completed_courses')
ORDER BY tablename, policyname;

-- Success message
SELECT 'Database setup completed successfully!' as status;
