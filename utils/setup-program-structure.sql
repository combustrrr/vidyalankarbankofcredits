-- Create program_structure table with minimal indexing to save resources on free tier
CREATE TABLE IF NOT EXISTS public.program_structure (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vertical TEXT NOT NULL,
  semester INTEGER NOT NULL,
  recommended_credits INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  -- Create a unique constraint on vertical and semester combination
  CONSTRAINT program_structure_vertical_semester_key UNIQUE (vertical, semester)
);

-- Insert the program structure data organized by verticals from the table
-- BSC/ ESC Vertical
INSERT INTO public.program_structure (vertical, semester, recommended_credits)
VALUES 
  ('BSC/ ESC', 1, 12),
  ('BSC/ ESC', 2, 9),
  ('BSC/ ESC', 3, 3),
  ('BSC/ ESC', 4, 3),
  ('BSC/ ESC', 5, 0),
  ('BSC/ ESC', 6, 0),
  ('BSC/ ESC', 7, 0),
  ('BSC/ ESC', 8, 0)
ON CONFLICT (vertical, semester) DO UPDATE 
SET recommended_credits = EXCLUDED.recommended_credits;

-- Program Courses Vertical
INSERT INTO public.program_structure (vertical, semester, recommended_credits)
VALUES 
  ('Program Courses', 1, 0),
  ('Program Courses', 2, 0),
  ('Program Courses', 3, 9),
  ('Program Courses', 4, 12),
  ('Program Courses', 5, 15),
  ('Program Courses', 6, 15),
  ('Program Courses', 7, 12),
  ('Program Courses', 8, 0)
ON CONFLICT (vertical, semester) DO UPDATE 
SET recommended_credits = EXCLUDED.recommended_credits;

-- Multidisciplinary Courses Vertical
INSERT INTO public.program_structure (vertical, semester, recommended_credits)
VALUES 
  ('Multidisciplinary Courses', 1, 0),
  ('Multidisciplinary Courses', 2, 2),
  ('Multidisciplinary Courses', 3, 3),
  ('Multidisciplinary Courses', 4, 3),
  ('Multidisciplinary Courses', 5, 6),
  ('Multidisciplinary Courses', 6, 3),
  ('Multidisciplinary Courses', 7, 5),
  ('Multidisciplinary Courses', 8, 0)
ON CONFLICT (vertical, semester) DO UPDATE 
SET recommended_credits = EXCLUDED.recommended_credits;

-- Skill Courses Vertical
INSERT INTO public.program_structure (vertical, semester, recommended_credits)
VALUES 
  ('Skill Courses', 1, 3),
  ('Skill Courses', 2, 3),
  ('Skill Courses', 3, 2),
  ('Skill Courses', 4, 0),
  ('Skill Courses', 5, 0),
  ('Skill Courses', 6, 0),
  ('Skill Courses', 7, 0),
  ('Skill Courses', 8, 0)
ON CONFLICT (vertical, semester) DO UPDATE 
SET recommended_credits = EXCLUDED.recommended_credits;

-- Humanities Social Science and Management (HSSM) Vertical
INSERT INTO public.program_structure (vertical, semester, recommended_credits)
VALUES 
  ('Humanities Social Science and Management (HSSM)', 1, 6),
  ('Humanities Social Science and Management (HSSM)', 2, 3),
  ('Humanities Social Science and Management (HSSM)', 3, 0),
  ('Humanities Social Science and Management (HSSM)', 4, 0),
  ('Humanities Social Science and Management (HSSM)', 5, 3),
  ('Humanities Social Science and Management (HSSM)', 6, 3),
  ('Humanities Social Science and Management (HSSM)', 7, 3),
  ('Humanities Social Science and Management (HSSM)', 8, 3)
ON CONFLICT (vertical, semester) DO UPDATE 
SET recommended_credits = EXCLUDED.recommended_credits;

-- Experiential Learning Courses Vertical
INSERT INTO public.program_structure (vertical, semester, recommended_credits)
VALUES 
  ('Experiential Learning Courses', 1, 0),
  ('Experiential Learning Courses', 2, 0),
  ('Experiential Learning Courses', 3, 0),
  ('Experiential Learning Courses', 4, 0),
  ('Experiential Learning Courses', 5, 2),
  ('Experiential Learning Courses', 6, 4),
  ('Experiential Learning Courses', 7, 2),
  ('Experiential Learning Courses', 8, 9)
ON CONFLICT (vertical, semester) DO UPDATE 
SET recommended_credits = EXCLUDED.recommended_credits;

-- Liberal Learning Courses Vertical
INSERT INTO public.program_structure (vertical, semester, recommended_credits)
VALUES 
  ('Liberal Learning Courses', 1, 0),
  ('Liberal Learning Courses', 2, 2),
  ('Liberal Learning Courses', 3, 2),
  ('Liberal Learning Courses', 4, 0),
  ('Liberal Learning Courses', 5, 0),
  ('Liberal Learning Courses', 6, 0),
  ('Liberal Learning Courses', 7, 0),
  ('Liberal Learning Courses', 8, 0)
ON CONFLICT (vertical, semester) DO UPDATE 
SET recommended_credits = EXCLUDED.recommended_credits;