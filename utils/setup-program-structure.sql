-- Create program_structure table with basket information
DROP TABLE IF EXISTS public.program_structure CASCADE;

CREATE TABLE IF NOT EXISTS public.program_structure (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vertical TEXT NOT NULL,
  basket TEXT NOT NULL,
  semester INTEGER NOT NULL,
  recommended_credits INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  -- Create a unique constraint on vertical, basket and semester combination
  CONSTRAINT program_structure_vertical_basket_semester_key UNIQUE (vertical, basket, semester)
);

-- BASIC SCIENCES AND ENGINEERING SCIENCE COURSES (BSC/ESC)
INSERT INTO public.program_structure (vertical, basket, semester, recommended_credits)
VALUES 
  ('BSC/ESC', 'Basic Sciences', 1, 6),
  ('BSC/ESC', 'Basic Sciences', 2, 5),
  ('BSC/ESC', 'Basic Sciences', 3, 0),
  ('BSC/ESC', 'Basic Sciences', 4, 0),
  ('BSC/ESC', 'Engineering Sciences', 1, 6),
  ('BSC/ESC', 'Engineering Sciences', 2, 4),
  ('BSC/ESC', 'Engineering Sciences', 3, 3),
  ('BSC/ESC', 'Engineering Sciences', 4, 3),
  ('BSC/ESC', 'Engineering Sciences', 5, 0),
  ('BSC/ESC', 'Engineering Sciences', 6, 0),
  ('BSC/ESC', 'Engineering Sciences', 7, 0),
  ('BSC/ESC', 'Engineering Sciences', 8, 0)
ON CONFLICT (vertical, basket, semester) DO UPDATE 
SET recommended_credits = EXCLUDED.recommended_credits;

-- PROGRAM COURSES
INSERT INTO public.program_structure (vertical, basket, semester, recommended_credits)
VALUES 
  ('Program Courses', 'Program Core', 1, 0),
  ('Program Courses', 'Program Core', 2, 0),
  ('Program Courses', 'Program Core', 3, 6),
  ('Program Courses', 'Program Core', 4, 8),
  ('Program Courses', 'Program Core', 5, 10),
  ('Program Courses', 'Program Core', 6, 10),
  ('Program Courses', 'Program Core', 7, 6),
  ('Program Courses', 'Program Core', 8, 0),
  ('Program Courses', 'Program Electives', 3, 3),
  ('Program Courses', 'Program Electives', 4, 4),
  ('Program Courses', 'Program Electives', 5, 5),
  ('Program Courses', 'Program Electives', 6, 5),
  ('Program Courses', 'Program Electives', 7, 6),
  ('Program Courses', 'Program Electives', 8, 0)
ON CONFLICT (vertical, basket, semester) DO UPDATE 
SET recommended_credits = EXCLUDED.recommended_credits;

-- MULTIDISCIPLINARY COURSES
INSERT INTO public.program_structure (vertical, basket, semester, recommended_credits)
VALUES 
  ('Multidisciplinary Courses', 'Minor Specialization', 1, 0),
  ('Multidisciplinary Courses', 'Minor Specialization', 2, 0),
  ('Multidisciplinary Courses', 'Minor Specialization', 3, 3),
  ('Multidisciplinary Courses', 'Minor Specialization', 4, 3),
  ('Multidisciplinary Courses', 'Minor Specialization', 5, 3),
  ('Multidisciplinary Courses', 'Minor Specialization', 6, 3),
  ('Multidisciplinary Courses', 'Minor Specialization', 7, 0),
  ('Multidisciplinary Courses', 'Minor Specialization', 8, 0),
  ('Multidisciplinary Courses', 'Multidisciplinary Electives', 1, 0),
  ('Multidisciplinary Courses', 'Multidisciplinary Electives', 2, 2),
  ('Multidisciplinary Courses', 'Multidisciplinary Electives', 3, 0),
  ('Multidisciplinary Courses', 'Multidisciplinary Electives', 4, 0),
  ('Multidisciplinary Courses', 'Multidisciplinary Electives', 5, 3),
  ('Multidisciplinary Courses', 'Multidisciplinary Electives', 6, 0),
  ('Multidisciplinary Courses', 'Multidisciplinary Electives', 7, 5),
  ('Multidisciplinary Courses', 'Multidisciplinary Electives', 8, 0)
ON CONFLICT (vertical, basket, semester) DO UPDATE 
SET recommended_credits = EXCLUDED.recommended_credits;

-- SKILL COURSES
INSERT INTO public.program_structure (vertical, basket, semester, recommended_credits)
VALUES 
  ('Skill Courses', 'Communication Skills', 1, 2),
  ('Skill Courses', 'Communication Skills', 2, 0),
  ('Skill Courses', 'Technical Skills', 1, 1),
  ('Skill Courses', 'Technical Skills', 2, 3),
  ('Skill Courses', 'Technical Skills', 3, 2),
  ('Skill Courses', 'Technical Skills', 4, 0),
  ('Skill Courses', 'Technical Skills', 5, 0),
  ('Skill Courses', 'Technical Skills', 6, 0),
  ('Skill Courses', 'Technical Skills', 7, 0),
  ('Skill Courses', 'Technical Skills', 8, 0)
ON CONFLICT (vertical, basket, semester) DO UPDATE 
SET recommended_credits = EXCLUDED.recommended_credits;

-- HUMANITIES, SOCIAL SCIENCES AND MANAGEMENT (HSSM)
INSERT INTO public.program_structure (vertical, basket, semester, recommended_credits)
VALUES 
  ('HSSM', 'Humanities', 1, 2),
  ('HSSM', 'Humanities', 2, 0),
  ('HSSM', 'Humanities', 5, 0),
  ('HSSM', 'Humanities', 7, 0),
  ('HSSM', 'Social Sciences', 1, 2),
  ('HSSM', 'Social Sciences', 2, 3),
  ('HSSM', 'Social Sciences', 5, 0),
  ('HSSM', 'Social Sciences', 7, 0),
  ('HSSM', 'Management', 1, 2),
  ('HSSM', 'Management', 2, 0),
  ('HSSM', 'Management', 5, 3),
  ('HSSM', 'Management', 6, 3),
  ('HSSM', 'Management', 7, 3),
  ('HSSM', 'Management', 8, 3)
ON CONFLICT (vertical, basket, semester) DO UPDATE 
SET recommended_credits = EXCLUDED.recommended_credits;

-- EXPERIENTIAL LEARNING COURSES
INSERT INTO public.program_structure (vertical, basket, semester, recommended_credits)
VALUES 
  ('Experiential Learning', 'Project Based Learning', 1, 0),
  ('Experiential Learning', 'Project Based Learning', 2, 0),
  ('Experiential Learning', 'Project Based Learning', 3, 0),
  ('Experiential Learning', 'Project Based Learning', 4, 0),
  ('Experiential Learning', 'Project Based Learning', 5, 2),
  ('Experiential Learning', 'Project Based Learning', 6, 2),
  ('Experiential Learning', 'Project Based Learning', 7, 2),
  ('Experiential Learning', 'Project Based Learning', 8, 0),
  ('Experiential Learning', 'Research', 1, 0),
  ('Experiential Learning', 'Research', 2, 0),
  ('Experiential Learning', 'Research', 3, 0),
  ('Experiential Learning', 'Research', 4, 0),
  ('Experiential Learning', 'Research', 5, 0),
  ('Experiential Learning', 'Research', 6, 0),
  ('Experiential Learning', 'Research', 7, 0),
  ('Experiential Learning', 'Research', 8, 3),
  ('Experiential Learning', 'Internship', 1, 0),
  ('Experiential Learning', 'Internship', 2, 0),
  ('Experiential Learning', 'Internship', 3, 0),
  ('Experiential Learning', 'Internship', 4, 0),
  ('Experiential Learning', 'Internship', 5, 0),
  ('Experiential Learning', 'Internship', 6, 2),
  ('Experiential Learning', 'Internship', 7, 0),
  ('Experiential Learning', 'Internship', 8, 6)
ON CONFLICT (vertical, basket, semester) DO UPDATE 
SET recommended_credits = EXCLUDED.recommended_credits;

-- LIBERAL LEARNING COURSES
INSERT INTO public.program_structure (vertical, basket, semester, recommended_credits)
VALUES 
  ('Liberal Learning', 'Physical Education', 1, 0),
  ('Liberal Learning', 'Physical Education', 2, 1),
  ('Liberal Learning', 'Physical Education', 3, 1),
  ('Liberal Learning', 'Cultural Education', 1, 0),
  ('Liberal Learning', 'Cultural Education', 2, 1),
  ('Liberal Learning', 'Cultural Education', 3, 1),
  ('Liberal Learning', 'Value Education', 1, 0),
  ('Liberal Learning', 'Value Education', 2, 0),
  ('Liberal Learning', 'Value Education', 3, 0),
  ('Liberal Learning', 'Value Education', 4, 0),
  ('Liberal Learning', 'Value Education', 5, 0),
  ('Liberal Learning', 'Value Education', 6, 0),
  ('Liberal Learning', 'Value Education', 7, 0),
  ('Liberal Learning', 'Value Education', 8, 0)
ON CONFLICT (vertical, basket, semester) DO UPDATE 
SET recommended_credits = EXCLUDED.recommended_credits;