-- Add structure_id column to the courses table
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS structure_id UUID REFERENCES public.program_structure(id);

-- Create an index on the foreign key for better query performance
-- Note: We only create this index because it's a foreign key and will be used often in queries
-- Be careful not to create too many indexes on free tier
CREATE INDEX IF NOT EXISTS idx_courses_structure_id ON public.courses(structure_id);

-- Create a function to automatically link courses to program structure
-- This is simplified to minimize database load on the free tier
CREATE OR REPLACE FUNCTION link_course_to_structure()
RETURNS TRIGGER AS $$
BEGIN
    -- Simple direct lookup with no complex operations
    NEW.structure_id := (
        SELECT id FROM public.program_structure
        WHERE vertical = NEW.vertical
        AND semester = NEW.semester
        LIMIT 1
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically link courses to program structure on insert/update
DROP TRIGGER IF EXISTS link_course_to_structure_trigger ON public.courses;
CREATE TRIGGER link_course_to_structure_trigger
BEFORE INSERT OR UPDATE ON public.courses
FOR EACH ROW
EXECUTE FUNCTION link_course_to_structure();

-- Update existing courses to link them to the program structure using the correct approach
WITH updated_courses AS (
    SELECT c.id, ps.id AS structure_id
    FROM public.courses c
    JOIN public.program_structure ps ON c.vertical = ps.vertical AND c.semester = ps.semester
    WHERE c.structure_id IS NULL
    LIMIT 500
)
UPDATE public.courses
SET structure_id = updated_courses.structure_id
FROM updated_courses
WHERE public.courses.id = updated_courses.id;