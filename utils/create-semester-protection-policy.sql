-- Semester Update Protection Policy
-- This file adds RLS policies to prevent students from updating their semester value once it's set
-- Only administrators can change a student's semester after initial selection

-- First, enable Row Level Security on the students table
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Create a policy that only allows updates to the semester field if it's null
-- This ensures students can only set their semester once
CREATE POLICY semester_update_policy ON students
    FOR UPDATE
    USING (true)  -- Allow access to all rows for reading
    WITH CHECK (
        -- Allow updates to semester only if current value is null
        (OLD.semester IS NULL AND NEW.semester IS NOT NULL) OR 
        -- Or if all other fields remain the same (semester unchanged)
        (OLD.semester = NEW.semester) OR
        -- Or if the update is coming from an admin authenticated session
        (current_setting('app.is_admin', true)::boolean = true)
    );

-- Create a policy that allows all other operations (insert, select, delete)
CREATE POLICY students_all_operations ON students
    FOR ALL
    USING (true);

-- Add a comment explaining the policy
COMMENT ON POLICY semester_update_policy ON students IS 'Prevents students from changing their semester once it has been set. Only admins can change a student''s semester after initial selection.';