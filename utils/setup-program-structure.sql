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

-- Insert the 2024-2025 program structure data in smaller batches to avoid timeout issues
-- Batch 1: Basic Science and Engineering Science
INSERT INTO public.program_structure (vertical, semester, recommended_credits)
VALUES 
  -- Basic Science Courses
  ('Basic Science Course (BSC/ESC)', 1, 6),
  ('Basic Science Course (BSC/ESC)', 2, 3),
  ('Basic Science Course (BSC/ESC)', 3, 3),
  ('Basic Science Course (BSC/ESC)', 4, 3),
  ('Basic Science Course (BSC/ESC)', 5, 0),
  ('Basic Science Course (BSC/ESC)', 6, 0),
  ('Basic Science Course (BSC/ESC)', 7, 0),
  ('Basic Science Course (BSC/ESC)', 8, 0),
  
  -- Engineering Science
  ('Engineering Science (ESC)', 1, 6),
  ('Engineering Science (ESC)', 2, 6),
  ('Engineering Science (ESC)', 3, 0),
  ('Engineering Science (ESC)', 4, 0),
  ('Engineering Science (ESC)', 5, 0),
  ('Engineering Science (ESC)', 6, 0),
  ('Engineering Science (ESC)', 7, 0),
  ('Engineering Science (ESC)', 8, 0)
ON CONFLICT (vertical, semester) DO UPDATE 
SET recommended_credits = EXCLUDED.recommended_credits;

-- Batch 2: Programme Core and Elective Courses
INSERT INTO public.program_structure (vertical, semester, recommended_credits)
VALUES 
  -- Programme Core Courses
  ('Programme Core Course (PCC)', 1, 0),
  ('Programme Core Course (PCC)', 2, 0),
  ('Programme Core Course (PCC)', 3, 9),
  ('Programme Core Course (PCC)', 4, 12),
  ('Programme Core Course (PCC)', 5, 12),
  ('Programme Core Course (PCC)', 6, 9),
  ('Programme Core Course (PCC)', 7, 3),
  ('Programme Core Course (PCC)', 8, 0),

  -- Programme Elective Courses
  ('Programme Elective Course (PEC)', 1, 0),
  ('Programme Elective Course (PEC)', 2, 0),
  ('Programme Elective Course (PEC)', 3, 0),
  ('Programme Elective Course (PEC)', 4, 0),
  ('Programme Elective Course (PEC)', 5, 3),
  ('Programme Elective Course (PEC)', 6, 6),
  ('Programme Elective Course (PEC)', 7, 9),
  ('Programme Elective Course (PEC)', 8, 0)
ON CONFLICT (vertical, semester) DO UPDATE 
SET recommended_credits = EXCLUDED.recommended_credits;

-- Batch 3: Multidisciplinary and Open Elective
INSERT INTO public.program_structure (vertical, semester, recommended_credits)
VALUES 
  -- Multidisciplinary Minor
  ('Multidisciplinary Minor (MDM)', 1, 0),
  ('Multidisciplinary Minor (MDM)', 2, 2),
  ('Multidisciplinary Minor (MDM)', 3, 3),
  ('Multidisciplinary Minor (MDM)', 4, 3),
  ('Multidisciplinary Minor (MDM)', 5, 3),
  ('Multidisciplinary Minor (MDM)', 6, 3),
  ('Multidisciplinary Minor (MDM)', 7, 0),
  ('Multidisciplinary Minor (MDM)', 8, 0),

  -- Open Elective
  ('Open Elective (OE)', 1, 0),
  ('Open Elective (OE)', 2, 0),
  ('Open Elective (OE)', 3, 0),
  ('Open Elective (OE)', 4, 0),
  ('Open Elective (OE)', 5, 3),
  ('Open Elective (OE)', 6, 0),
  ('Open Elective (OE)', 7, 5),
  ('Open Elective (OE)', 8, 0)
ON CONFLICT (vertical, semester) DO UPDATE 
SET recommended_credits = EXCLUDED.recommended_credits;

-- Batch 4: Vocational and Ability Enhancement
INSERT INTO public.program_structure (vertical, semester, recommended_credits)
VALUES 
  -- Vocational and Skill Enhancement Courses
  ('Vocational and Skill Enhancement Courses (VSEC)', 1, 3),
  ('Vocational and Skill Enhancement Courses (VSEC)', 2, 3),
  ('Vocational and Skill Enhancement Courses (VSEC)', 3, 2),
  ('Vocational and Skill Enhancement Courses (VSEC)', 4, 0),
  ('Vocational and Skill Enhancement Courses (VSEC)', 5, 0),
  ('Vocational and Skill Enhancement Courses (VSEC)', 6, 0),
  ('Vocational and Skill Enhancement Courses (VSEC)', 7, 0),
  ('Vocational and Skill Enhancement Courses (VSEC)', 8, 0),

  -- Ability Enhancement Courses
  ('Ability Enhancement Courses (AEC)', 1, 3),
  ('Ability Enhancement Courses (AEC)', 2, 1),
  ('Ability Enhancement Courses (AEC)', 3, 0),
  ('Ability Enhancement Courses (AEC)', 4, 0),
  ('Ability Enhancement Courses (AEC)', 5, 0),
  ('Ability Enhancement Courses (AEC)', 6, 0),
  ('Ability Enhancement Courses (AEC)', 7, 0),
  ('Ability Enhancement Courses (AEC)', 8, 3)
ON CONFLICT (vertical, semester) DO UPDATE 
SET recommended_credits = EXCLUDED.recommended_credits;

-- Batch 5: Entrepreneurship and Indian Knowledge System
INSERT INTO public.program_structure (vertical, semester, recommended_credits)
VALUES 
  -- Entrepreneurship/Economics/Management Courses
  ('Entrepreneurship/Economics/Management (EEMC)', 1, 0),
  ('Entrepreneurship/Economics/Management (EEMC)', 2, 0),
  ('Entrepreneurship/Economics/Management (EEMC)', 3, 0),
  ('Entrepreneurship/Economics/Management (EEMC)', 4, 0),
  ('Entrepreneurship/Economics/Management (EEMC)', 5, 3),
  ('Entrepreneurship/Economics/Management (EEMC)', 6, 3),
  ('Entrepreneurship/Economics/Management (EEMC)', 7, 3),
  ('Entrepreneurship/Economics/Management (EEMC)', 8, 3),

  -- Indian Knowledge System
  ('Indian Knowledge System (IKS)', 1, 0),
  ('Indian Knowledge System (IKS)', 2, 2),
  ('Indian Knowledge System (IKS)', 3, 0),
  ('Indian Knowledge System (IKS)', 4, 0),
  ('Indian Knowledge System (IKS)', 5, 0),
  ('Indian Knowledge System (IKS)', 6, 0),
  ('Indian Knowledge System (IKS)', 7, 0),
  ('Indian Knowledge System (IKS)', 8, 0)
ON CONFLICT (vertical, semester) DO UPDATE 
SET recommended_credits = EXCLUDED.recommended_credits;

-- Batch 6: Value Education and Research Methodology
INSERT INTO public.program_structure (vertical, semester, recommended_credits)
VALUES 
  -- Value Education Courses
  ('Value Education Courses (VEC)', 1, 3),
  ('Value Education Courses (VEC)', 2, 0),
  ('Value Education Courses (VEC)', 3, 0),
  ('Value Education Courses (VEC)', 4, 0),
  ('Value Education Courses (VEC)', 5, 0),
  ('Value Education Courses (VEC)', 6, 0),
  ('Value Education Courses (VEC)', 7, 0),
  ('Value Education Courses (VEC)', 8, 0),

  -- Research Methodology
  ('Research Methodology (RM)', 1, 0),
  ('Research Methodology (RM)', 2, 0),
  ('Research Methodology (RM)', 3, 0),
  ('Research Methodology (RM)', 4, 0),
  ('Research Methodology (RM)', 5, 0),
  ('Research Methodology (RM)', 6, 0),
  ('Research Methodology (RM)', 7, 0),
  ('Research Methodology (RM)', 8, 3)
ON CONFLICT (vertical, semester) DO UPDATE 
SET recommended_credits = EXCLUDED.recommended_credits;

-- Batch 7: Projects and Internships
INSERT INTO public.program_structure (vertical, semester, recommended_credits)
VALUES 
  -- Comm. Engg. Project/Field Project
  ('Comm. Engg. Project/Field Project (CEP/FP)', 1, 0),
  ('Comm. Engg. Project/Field Project (CEP/FP)', 2, 0),
  ('Comm. Engg. Project/Field Project (CEP/FP)', 3, 0),
  ('Comm. Engg. Project/Field Project (CEP/FP)', 4, 0),
  ('Comm. Engg. Project/Field Project (CEP/FP)', 5, 0),
  ('Comm. Engg. Project/Field Project (CEP/FP)', 6, 2),
  ('Comm. Engg. Project/Field Project (CEP/FP)', 7, 0),
  ('Comm. Engg. Project/Field Project (CEP/FP)', 8, 0),

  -- Project
  ('Project', 1, 0),
  ('Project', 2, 0),
  ('Project', 3, 0),
  ('Project', 4, 0),
  ('Project', 5, 0),
  ('Project', 6, 0),
  ('Project', 7, 0),
  ('Project', 8, 6)
ON CONFLICT (vertical, semester) DO UPDATE 
SET recommended_credits = EXCLUDED.recommended_credits;

-- Batch 8: Internships and Co-Curricular
INSERT INTO public.program_structure (vertical, semester, recommended_credits)
VALUES 
  -- Internship/OJT
  ('Internship/OJT', 1, 0),
  ('Internship/OJT', 2, 0),
  ('Internship/OJT', 3, 0),
  ('Internship/OJT', 4, 0),
  ('Internship/OJT', 5, 2),
  ('Internship/OJT', 6, 2),
  ('Internship/OJT', 7, 2),
  ('Internship/OJT', 8, 6),

  -- Co-Curricular Courses
  ('Co-Curricular Courses (CC)', 1, 0),
  ('Co-Curricular Courses (CC)', 2, 2),
  ('Co-Curricular Courses (CC)', 3, 2),
  ('Co-Curricular Courses (CC)', 4, 0),
  ('Co-Curricular Courses (CC)', 5, 0),
  ('Co-Curricular Courses (CC)', 6, 0),
  ('Co-Curricular Courses (CC)', 7, 0),
  ('Co-Curricular Courses (CC)', 8, 0)
ON CONFLICT (vertical, semester) DO UPDATE 
SET recommended_credits = EXCLUDED.recommended_credits;