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

-- Update existing courses to link them to the program structure
-- This is a small batch update, but if you have many courses (1000+), you may want to 
-- handle this in your application code instead, processing a few records at a time
UPDATE public.courses c
SET structure_id = ps.id
FROM public.program_structure ps
WHERE c.vertical = ps.vertical
AND c.semester = ps.semester
AND c.structure_id IS NULL
LIMIT 500; -- Limit the number of updates per execution to reduce load