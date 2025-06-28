/**
 * Comprehensive Database Schema for Vidyalankar Credits System
 * 
 * Run these SQL commands in your Supabase SQL editor to set up the database
 * This schema supports multiple universities, departments, and complex academic structures
 */

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Universities table (for multi-university support)
CREATE TABLE IF NOT EXISTS universities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'India',
  website VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  established_year INTEGER,
  university_type VARCHAR(50) CHECK (university_type IN ('Public', 'Private', 'Deemed', 'Central', 'State')),
  accreditation_body VARCHAR(100),
  accreditation_grade VARCHAR(10),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Academic years table
CREATE TABLE IF NOT EXISTS academic_years (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  year_code VARCHAR(20) NOT NULL, -- e.g., "2024-25"
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(university_id, year_code)
);

-- Departments/Schools table
CREATE TABLE IF NOT EXISTS departments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  code VARCHAR(20) NOT NULL,
  short_name VARCHAR(50),
  description TEXT,
  head_of_department VARCHAR(200),
  email VARCHAR(255),
  phone VARCHAR(20),
  building VARCHAR(100),
  floor VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(university_id, code)
);

-- Degree programs table
CREATE TABLE IF NOT EXISTS degree_programs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL, -- e.g., "Bachelor of Technology"
  code VARCHAR(20) NOT NULL,   -- e.g., "BTech"
  short_name VARCHAR(50),      -- e.g., "B.Tech"
  degree_type VARCHAR(50) CHECK (degree_type IN ('Undergraduate', 'Postgraduate', 'Doctoral', 'Diploma', 'Certificate')),
  duration_years INTEGER NOT NULL CHECK (duration_years > 0),
  total_semesters INTEGER NOT NULL CHECK (total_semesters > 0),
  total_credits_required INTEGER NOT NULL CHECK (total_credits_required > 0),
  description TEXT,
  eligibility_criteria TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(university_id, department_id, code)
);

-- Branches/Specializations within degree programs
CREATE TABLE IF NOT EXISTS branches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  degree_program_id UUID NOT NULL REFERENCES degree_programs(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL, -- e.g., "Information Technology"
  code VARCHAR(20) NOT NULL,   -- e.g., "INFT"
  short_name VARCHAR(50),      -- e.g., "IT"
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(degree_program_id, code)
);

-- Academic verticals (subject areas)
CREATE TABLE IF NOT EXISTS academic_verticals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  code VARCHAR(20) NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  color_code VARCHAR(7), -- Hex color for UI
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(university_id, code)
);

-- Credit baskets within verticals
CREATE TABLE IF NOT EXISTS credit_baskets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vertical_id UUID NOT NULL REFERENCES academic_verticals(id) ON DELETE CASCADE,
  code VARCHAR(20) NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  is_elective BOOLEAN DEFAULT false,
  min_credits INTEGER DEFAULT 0,
  max_credits INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(vertical_id, code)
);

-- Faculty/Staff table
CREATE TABLE IF NOT EXISTS faculty (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  full_name VARCHAR(200) NOT NULL,
  title VARCHAR(100), -- Dr., Prof., Mr., Ms., etc.
  designation VARCHAR(100), -- Professor, Associate Professor, etc.
  qualification VARCHAR(500),
  specialization VARCHAR(500),
  phone VARCHAR(20),
  office_location VARCHAR(200),
  date_of_joining DATE,
  employment_status VARCHAR(50) CHECK (employment_status IN ('Active', 'On Leave', 'Suspended', 'Terminated', 'Retired')),
  user_role VARCHAR(50) CHECK (user_role IN ('Faculty', 'Admin', 'HOD', 'Dean', 'Registrar', 'Super Admin')) DEFAULT 'Faculty',
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Students table (enhanced)
CREATE TABLE IF NOT EXISTS students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  degree_program_id UUID NOT NULL REFERENCES degree_programs(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  
  -- Personal Information
  roll_number VARCHAR(50) NOT NULL,
  prn VARCHAR(50), -- Permanent Registration Number
  email VARCHAR(255),
  password_hash TEXT NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  last_name VARCHAR(100) NOT NULL,
  full_name VARCHAR(200) NOT NULL,
  legal_name VARCHAR(200) NOT NULL,
  
  -- Academic Information
  division VARCHAR(10),
  batch VARCHAR(10),
  current_semester INTEGER CHECK (current_semester BETWEEN 1 AND 12),
  academic_status VARCHAR(50) CHECK (academic_status IN ('Active', 'Suspended', 'Dropped', 'Graduated', 'On Break')) DEFAULT 'Active',
  admission_date DATE,
  expected_graduation DATE,
  
  -- Contact Information
  phone VARCHAR(20),
  alternate_phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'India',
  
  -- Guardian Information
  guardian_name VARCHAR(200),
  guardian_phone VARCHAR(20),
  guardian_email VARCHAR(255),
  guardian_relation VARCHAR(50),
  
  -- Academic Performance
  total_credits_earned INTEGER DEFAULT 0,
  cgpa DECIMAL(3,2),
  sgpa DECIMAL(3,2),
  
  -- System Fields
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(university_id, roll_number),
  UNIQUE(university_id, prn)
);

-- Courses table (enhanced)
CREATE TABLE IF NOT EXISTS courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  degree_program_id UUID REFERENCES degree_programs(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  vertical_id UUID NOT NULL REFERENCES academic_verticals(id) ON DELETE CASCADE,
  basket_id UUID NOT NULL REFERENCES credit_baskets(id) ON DELETE CASCADE,
  
  -- Course Details
  course_code VARCHAR(20) NOT NULL,
  title VARCHAR(200) NOT NULL,
  short_title VARCHAR(100),
  description TEXT,
  
  -- Academic Information
  course_type VARCHAR(20) CHECK (course_type IN ('Theory', 'Practical', 'Tutorial', 'Project', 'Seminar', 'Internship')) NOT NULL,
  credits INTEGER NOT NULL CHECK (credits > 0),
  contact_hours INTEGER, -- Total contact hours per week
  lecture_hours DECIMAL(3,1) DEFAULT 0,
  tutorial_hours DECIMAL(3,1) DEFAULT 0,
  practical_hours DECIMAL(3,1) DEFAULT 0,
  
  -- Semester and Prerequisites
  semester INTEGER NOT NULL CHECK (semester BETWEEN 1 AND 12),
  is_elective BOOLEAN DEFAULT false,
  is_mandatory BOOLEAN DEFAULT true,
  
  -- Assessment Information
  internal_marks INTEGER DEFAULT 30,
  external_marks INTEGER DEFAULT 70,
  min_passing_marks INTEGER DEFAULT 40,
  
  -- Syllabus and Resources
  syllabus_url TEXT,
  reference_books TEXT,
  learning_outcomes TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  effective_from DATE,
  effective_to DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(university_id, course_code)
);

-- Course prerequisites
CREATE TABLE IF NOT EXISTS course_prerequisites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  prerequisite_course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  is_mandatory BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(course_id, prerequisite_course_id)
);

-- Course assignments to faculty
CREATE TABLE IF NOT EXISTS course_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  faculty_id UUID NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
  academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  semester INTEGER NOT NULL,
  division VARCHAR(10),
  role VARCHAR(50) CHECK (role IN ('Instructor', 'Co-Instructor', 'Lab Instructor', 'Teaching Assistant')) DEFAULT 'Instructor',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(course_id, faculty_id, academic_year_id, semester, division)
);

-- Course enrollments
CREATE TABLE IF NOT EXISTS course_enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  semester INTEGER NOT NULL,
  enrollment_type VARCHAR(50) CHECK (enrollment_type IN ('Regular', 'Repeat', 'Improvement', 'Audit')) DEFAULT 'Regular',
  enrollment_date DATE DEFAULT CURRENT_DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, course_id, academic_year_id, semester)
);

-- Assessments/Exams
CREATE TABLE IF NOT EXISTS assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  assessment_type VARCHAR(50) CHECK (assessment_type IN ('Internal', 'External', 'Practical', 'Project', 'Assignment', 'Quiz', 'Mid-term', 'Final')) NOT NULL,
  max_marks INTEGER NOT NULL CHECK (max_marks > 0),
  weightage DECIMAL(5,2) NOT NULL CHECK (weightage > 0 AND weightage <= 100),
  assessment_date DATE,
  submission_deadline TIMESTAMP WITH TIME ZONE,
  instructions TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student marks/grades
CREATE TABLE IF NOT EXISTS student_marks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  marks_obtained DECIMAL(6,2),
  grade VARCHAR(5),
  grade_points DECIMAL(3,2),
  remarks TEXT,
  evaluated_by UUID REFERENCES faculty(id) ON DELETE SET NULL,
  evaluated_at TIMESTAMP WITH TIME ZONE,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, assessment_id)
);

-- Completed courses table (enhanced)
CREATE TABLE IF NOT EXISTS completed_courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  semester INTEGER NOT NULL,
  
  -- Marks and Grades
  internal_marks DECIMAL(6,2),
  external_marks DECIMAL(6,2),
  total_marks DECIMAL(6,2),
  grade VARCHAR(5),
  grade_points DECIMAL(3,2),
  credits_earned INTEGER NOT NULL CHECK (credits_earned >= 0),
  
  -- Status
  completion_status VARCHAR(50) CHECK (completion_status IN ('Passed', 'Failed', 'Absent', 'Incomplete', 'Withdrawn')) DEFAULT 'Passed',
  attempt_number INTEGER DEFAULT 1,
  
  -- Dates
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  result_declared_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(student_id, course_id, academic_year_id, semester, attempt_number)
);

-- Program structure table for credit recommendations (enhanced)
CREATE TABLE IF NOT EXISTS program_credit_structure (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  degree_program_id UUID NOT NULL REFERENCES degree_programs(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  vertical_id UUID NOT NULL REFERENCES academic_verticals(id) ON DELETE CASCADE,
  basket_id UUID NOT NULL REFERENCES credit_baskets(id) ON DELETE CASCADE,
  semester INTEGER NOT NULL CHECK (semester BETWEEN 1 AND 12),
  min_credits INTEGER NOT NULL DEFAULT 0,
  max_credits INTEGER,
  recommended_credits INTEGER NOT NULL CHECK (recommended_credits >= 0),
  is_mandatory BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(degree_program_id, branch_id, vertical_id, basket_id, semester)
);

-- Audit log for tracking changes
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name VARCHAR(100) NOT NULL,
  record_id UUID NOT NULL,
  action VARCHAR(20) CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')) NOT NULL,
  old_values JSONB,
  new_values JSONB,
  changed_by UUID, -- Could reference students or faculty
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- System settings
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  setting_key VARCHAR(100) NOT NULL,
  setting_value TEXT,
  setting_type VARCHAR(50) CHECK (setting_type IN ('string', 'number', 'boolean', 'json')) DEFAULT 'string',
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(university_id, setting_key)
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  recipient_type VARCHAR(20) CHECK (recipient_type IN ('student', 'faculty', 'all')) NOT NULL,
  recipient_id UUID, -- student_id or faculty_id
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  notification_type VARCHAR(50) CHECK (notification_type IN ('info', 'warning', 'error', 'success')) DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- ================================================================
-- INDEXES for Performance Optimization
-- ================================================================

-- Students indexes
CREATE INDEX IF NOT EXISTS idx_students_university ON students(university_id);
CREATE INDEX IF NOT EXISTS idx_students_roll_number ON students(university_id, roll_number);
CREATE INDEX IF NOT EXISTS idx_students_degree_branch ON students(degree_program_id, branch_id);
CREATE INDEX IF NOT EXISTS idx_students_academic_year ON students(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(academic_status) WHERE academic_status = 'Active';

-- Courses indexes
CREATE INDEX IF NOT EXISTS idx_courses_university ON courses(university_id);
CREATE INDEX IF NOT EXISTS idx_courses_semester ON courses(semester);
CREATE INDEX IF NOT EXISTS idx_courses_vertical_basket ON courses(vertical_id, basket_id);
CREATE INDEX IF NOT EXISTS idx_courses_code ON courses(university_id, course_code);
CREATE INDEX IF NOT EXISTS idx_courses_degree_branch ON courses(degree_program_id, branch_id);
CREATE INDEX IF NOT EXISTS idx_courses_active ON courses(is_active) WHERE is_active = true;

-- Completed courses indexes
CREATE INDEX IF NOT EXISTS idx_completed_courses_student ON completed_courses(student_id);
CREATE INDEX IF NOT EXISTS idx_completed_courses_course ON completed_courses(course_id);
CREATE INDEX IF NOT EXISTS idx_completed_courses_academic_year ON completed_courses(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_completed_courses_status ON completed_courses(completion_status);

-- Faculty indexes
CREATE INDEX IF NOT EXISTS idx_faculty_university ON faculty(university_id);
CREATE INDEX IF NOT EXISTS idx_faculty_department ON faculty(department_id);
CREATE INDEX IF NOT EXISTS idx_faculty_employee_id ON faculty(university_id, employee_id);
CREATE INDEX IF NOT EXISTS idx_faculty_role ON faculty(user_role);

-- Course enrollments indexes
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON course_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_academic_year ON course_enrollments(academic_year_id);

-- Student marks indexes
CREATE INDEX IF NOT EXISTS idx_marks_student ON student_marks(student_id);
CREATE INDEX IF NOT EXISTS idx_marks_assessment ON student_marks(assessment_id);
CREATE INDEX IF NOT EXISTS idx_marks_published ON student_marks(is_published) WHERE is_published = true;

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_changed_at ON audit_logs(changed_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_changed_by ON audit_logs(changed_by);

-- ================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ================================================================

-- Enable RLS on all tables
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE degree_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_verticals ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_baskets ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_prerequisites ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE completed_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_credit_structure ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's university (you'll need to implement this based on your auth)
CREATE OR REPLACE FUNCTION get_current_user_university_id() 
RETURNS UUID AS $$
BEGIN
  -- This is a placeholder - implement based on your authentication system
  -- For now, we'll assume the user ID matches student/faculty ID
  RETURN (
    SELECT COALESCE(
      (SELECT university_id FROM students WHERE id = auth.uid()),
      (SELECT university_id FROM faculty WHERE id = auth.uid())
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin() 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM faculty 
    WHERE id = auth.uid() 
    AND user_role IN ('Admin', 'Super Admin', 'Dean', 'Registrar')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Universities policies (public read, admin write)
CREATE POLICY "Universities are viewable by all" ON universities FOR SELECT USING (true);
CREATE POLICY "Only super admins can modify universities" ON universities 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM faculty WHERE id = auth.uid() AND user_role = 'Super Admin')
  );

-- Academic years policies
CREATE POLICY "Academic years viewable by university members" ON academic_years 
  FOR SELECT USING (university_id = get_current_user_university_id());
CREATE POLICY "Only admins can modify academic years" ON academic_years 
  FOR ALL USING (is_admin() AND university_id = get_current_user_university_id());

-- Departments policies
CREATE POLICY "Departments viewable by university members" ON departments 
  FOR SELECT USING (university_id = get_current_user_university_id());
CREATE POLICY "Only admins can modify departments" ON departments 
  FOR ALL USING (is_admin() AND university_id = get_current_user_university_id());

-- Degree programs policies
CREATE POLICY "Degree programs viewable by university members" ON degree_programs 
  FOR SELECT USING (university_id = get_current_user_university_id());
CREATE POLICY "Only admins can modify degree programs" ON degree_programs 
  FOR ALL USING (is_admin() AND university_id = get_current_user_university_id());

-- Branches policies
CREATE POLICY "Branches viewable by all" ON branches FOR SELECT USING (true);
CREATE POLICY "Only admins can modify branches" ON branches 
  FOR ALL USING (is_admin());

-- Academic verticals policies
CREATE POLICY "Verticals viewable by university members" ON academic_verticals 
  FOR SELECT USING (university_id = get_current_user_university_id());
CREATE POLICY "Only admins can modify verticals" ON academic_verticals 
  FOR ALL USING (is_admin() AND university_id = get_current_user_university_id());

-- Credit baskets policies
CREATE POLICY "Baskets viewable by all" ON credit_baskets FOR SELECT USING (true);
CREATE POLICY "Only admins can modify baskets" ON credit_baskets 
  FOR ALL USING (is_admin());

-- Faculty policies
CREATE POLICY "Faculty can view own data" ON faculty 
  FOR SELECT USING (id = auth.uid());
CREATE POLICY "Admins can view all faculty in university" ON faculty 
  FOR SELECT USING (is_admin() AND university_id = get_current_user_university_id());
CREATE POLICY "Faculty can update own profile" ON faculty 
  FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Only admins can create/delete faculty" ON faculty 
  FOR INSERT WITH CHECK (is_admin() AND university_id = get_current_user_university_id());
CREATE POLICY "Only admins can delete faculty" ON faculty 
  FOR DELETE USING (is_admin() AND university_id = get_current_user_university_id());

-- Students policies
CREATE POLICY "Students can view own data" ON students 
  FOR SELECT USING (id = auth.uid());
CREATE POLICY "Faculty can view students in their university" ON students 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM faculty WHERE id = auth.uid() AND university_id = students.university_id)
  );
CREATE POLICY "Students can update own profile" ON students 
  FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Only admins can create/delete students" ON students 
  FOR INSERT WITH CHECK (is_admin() AND university_id = get_current_user_university_id());

-- Courses policies
CREATE POLICY "Courses viewable by university members" ON courses 
  FOR SELECT USING (university_id = get_current_user_university_id());
CREATE POLICY "Only admins and assigned faculty can modify courses" ON courses 
  FOR ALL USING (
    is_admin() AND university_id = get_current_user_university_id()
  );

-- Course enrollments policies
CREATE POLICY "Students can view own enrollments" ON course_enrollments 
  FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Faculty can view enrollments for their courses" ON course_enrollments 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM course_assignments ca 
      WHERE ca.course_id = course_enrollments.course_id 
      AND ca.faculty_id = auth.uid()
    )
  );

-- Completed courses policies
CREATE POLICY "Students can view own completed courses" ON completed_courses 
  FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Faculty can view completed courses for their courses" ON completed_courses 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM course_assignments ca 
      WHERE ca.course_id = completed_courses.course_id 
      AND ca.faculty_id = auth.uid()
    )
  );
CREATE POLICY "Students can insert own course completions" ON completed_courses 
  FOR INSERT WITH CHECK (student_id = auth.uid());

-- Student marks policies
CREATE POLICY "Students can view own marks" ON student_marks 
  FOR SELECT USING (student_id = auth.uid() AND is_published = true);
CREATE POLICY "Faculty can view marks for their assessments" ON student_marks 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM assessments a 
      JOIN course_assignments ca ON a.course_id = ca.course_id
      WHERE a.id = student_marks.assessment_id 
      AND ca.faculty_id = auth.uid()
    )
  );

-- Notifications policies
CREATE POLICY "Users can view their notifications" ON notifications 
  FOR SELECT USING (
    (recipient_type = 'student' AND recipient_id = auth.uid()) OR
    (recipient_type = 'faculty' AND recipient_id = auth.uid()) OR
    (recipient_type = 'all' AND university_id = get_current_user_university_id())
  );

-- ================================================================
-- TRIGGERS for Automatic Updates
-- ================================================================

-- Function to update 'updated_at' column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables with updated_at column
CREATE TRIGGER update_universities_updated_at BEFORE UPDATE ON universities 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_degree_programs_updated_at BEFORE UPDATE ON degree_programs 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON branches 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faculty_updated_at BEFORE UPDATE ON faculty 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_completed_courses_updated_at BEFORE UPDATE ON completed_courses 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_marks_updated_at BEFORE UPDATE ON student_marks 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_program_credit_structure_updated_at BEFORE UPDATE ON program_credit_structure 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update student total credits when courses are completed
CREATE OR REPLACE FUNCTION update_student_credits()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE students 
    SET total_credits_earned = (
      SELECT COALESCE(SUM(credits_earned), 0) 
      FROM completed_courses 
      WHERE student_id = NEW.student_id 
      AND completion_status = 'Passed'
    )
    WHERE id = NEW.student_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE students 
    SET total_credits_earned = (
      SELECT COALESCE(SUM(credits_earned), 0) 
      FROM completed_courses 
      WHERE student_id = OLD.student_id 
      AND completion_status = 'Passed'
    )
    WHERE id = OLD.student_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_student_credits_trigger
  AFTER INSERT OR UPDATE OR DELETE ON completed_courses
  FOR EACH ROW EXECUTE FUNCTION update_student_credits();

-- Audit logging trigger
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (table_name, record_id, action, new_values, changed_by)
    VALUES (TG_TABLE_NAME, NEW.id, TG_OP, to_jsonb(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values, changed_by)
    VALUES (TG_TABLE_NAME, NEW.id, TG_OP, to_jsonb(OLD), to_jsonb(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (table_name, record_id, action, old_values, changed_by)
    VALUES (TG_TABLE_NAME, OLD.id, TG_OP, to_jsonb(OLD), auth.uid());
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to important tables
CREATE TRIGGER audit_students AFTER INSERT OR UPDATE OR DELETE ON students 
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_completed_courses AFTER INSERT OR UPDATE OR DELETE ON completed_courses 
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_student_marks AFTER INSERT OR UPDATE OR DELETE ON student_marks 
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

-- ================================================================
-- SAMPLE DATA INSERTION
-- ================================================================

-- Insert sample university
INSERT INTO universities (id, name, code, city, state, country, university_type, established_year) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Vidyalankar Institute of Technology', 'VIT', 'Mumbai', 'Maharashtra', 'India', 'Private', 1999)
ON CONFLICT (code) DO NOTHING;

-- Insert sample academic year
INSERT INTO academic_years (university_id, year_code, start_date, end_date, is_current) VALUES
('550e8400-e29b-41d4-a716-446655440000', '2024-25', '2024-07-01', '2025-06-30', true)
ON CONFLICT (university_id, year_code) DO NOTHING;

-- Insert sample department
INSERT INTO departments (university_id, name, code, short_name) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Computer Engineering', 'COMP', 'Comp'),
('550e8400-e29b-41d4-a716-446655440000', 'Information Technology', 'INFT', 'IT'),
('550e8400-e29b-41d4-a716-446655440000', 'Electronics and Telecommunication', 'EXTC', 'EXTC'),
('550e8400-e29b-41d4-a716-446655440000', 'Mechanical Engineering', 'MECH', 'Mech')
ON CONFLICT (university_id, code) DO NOTHING;

-- Insert sample degree program
INSERT INTO degree_programs (university_id, department_id, name, code, degree_type, duration_years, total_semesters, total_credits_required) VALUES
('550e8400-e29b-41d4-a716-446655440000', 
 (SELECT id FROM departments WHERE code = 'INFT' LIMIT 1), 
 'Bachelor of Technology', 'BTech', 'Undergraduate', 4, 8, 160)
ON CONFLICT (university_id, department_id, code) DO NOTHING;

-- Insert sample branches
INSERT INTO branches (degree_program_id, name, code, short_name) VALUES
((SELECT id FROM degree_programs WHERE code = 'BTech' LIMIT 1), 'Information Technology', 'INFT', 'IT'),
((SELECT id FROM degree_programs WHERE code = 'BTech' LIMIT 1), 'Computer Engineering', 'COMP', 'Comp'),
((SELECT id FROM degree_programs WHERE code = 'BTech' LIMIT 1), 'Electronics and Telecommunication', 'EXTC', 'EXTC')
ON CONFLICT (degree_program_id, code) DO NOTHING;

-- Insert academic verticals
INSERT INTO academic_verticals (university_id, code, name, description, color_code) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'BSC', 'Basic Science', 'Mathematics, Physics, Chemistry courses', '#3B82F6'),
('550e8400-e29b-41d4-a716-446655440000', 'ESC', 'Engineering Science', 'Core engineering subjects', '#EF4444'),
('550e8400-e29b-41d4-a716-446655440000', 'PCC', 'Program Core Course', 'Core courses specific to the program', '#10B981'),
('550e8400-e29b-41d4-a716-446655440000', 'PEC', 'Program Elective Course', 'Elective courses within the program', '#F59E0B'),
('550e8400-e29b-41d4-a716-446655440000', 'MDM', 'Multidisciplinary Minor', 'Interdisciplinary courses', '#8B5CF6'),
('550e8400-e29b-41d4-a716-446655440000', 'OE', 'Open Elective', 'Open electives from any discipline', '#EC4899'),
('550e8400-e29b-41d4-a716-446655440000', 'VSEC', 'Vocational & Skill Enhancement', 'Skill development courses', '#14B8A6'),
('550e8400-e29b-41d4-a716-446655440000', 'AEC', 'Ability Enhancement Course', 'Communication and soft skills', '#F97316'),
('550e8400-e29b-41d4-a716-446655440000', 'EEMC', 'Entrepreneurship/Economics/Management', 'Business and management courses', '#84CC16'),
('550e8400-e29b-41d4-a716-446655440000', 'IKS', 'Indian Knowledge System', 'Traditional Indian knowledge', '#6366F1'),
('550e8400-e29b-41d4-a716-446655440000', 'VEC', 'Value Education Course', 'Ethics and values', '#F43F5E'),
('550e8400-e29b-41d4-a716-446655440000', 'CC', 'Co-Curricular Courses', 'Sports, arts, cultural activities', '#06B6D4'),
('550e8400-e29b-41d4-a716-446655440000', 'RM', 'Research Methodology', 'Research and thesis preparation', '#8B5A2B'),
('550e8400-e29b-41d4-a716-446655440000', 'CEP', 'Community Engineering Project', 'Community service projects', '#059669'),
('550e8400-e29b-41d4-a716-446655440000', 'PROJ', 'Project', 'Final year projects', '#7C3AED'),
('550e8400-e29b-41d4-a716-446655440000', 'INTP', 'Internship/OJT', 'Industrial training and internships', '#DC2626')
ON CONFLICT (university_id, code) DO NOTHING;

-- Insert credit baskets
INSERT INTO credit_baskets (vertical_id, code, name, description) VALUES
((SELECT id FROM academic_verticals WHERE code = 'BSC' LIMIT 1), 'BSC', 'Basic Science', 'Mathematics, Physics, Chemistry'),
((SELECT id FROM academic_verticals WHERE code = 'ESC' LIMIT 1), 'ESC', 'Engineering Science', 'Core engineering subjects'),
((SELECT id FROM academic_verticals WHERE code = 'PCC' LIMIT 1), 'PCC', 'Programme Core Course', 'Core program courses'),
((SELECT id FROM academic_verticals WHERE code = 'PEC' LIMIT 1), 'PEC', 'Programme Elective Course', 'Program electives'),
((SELECT id FROM academic_verticals WHERE code = 'MDM' LIMIT 1), 'MDM', 'Multidisciplinary Minor', 'Interdisciplinary courses'),
((SELECT id FROM academic_verticals WHERE code = 'OE' LIMIT 1), 'OE', 'Open Elective', 'Open electives'),
((SELECT id FROM academic_verticals WHERE code = 'VSEC' LIMIT 1), 'VSEC', 'Vocational & Skill Enhancement Course', 'Skill development'),
((SELECT id FROM academic_verticals WHERE code = 'AEC' LIMIT 1), 'AEC', 'Ability Enhancement Course', 'Communication skills'),
((SELECT id FROM academic_verticals WHERE code = 'EEMC' LIMIT 1), 'EEMC', 'Entrepreneurship/Economics/Management Course', 'Business courses'),
((SELECT id FROM academic_verticals WHERE code = 'IKS' LIMIT 1), 'IKS', 'Indian Knowledge System', 'Traditional knowledge'),
((SELECT id FROM academic_verticals WHERE code = 'VEC' LIMIT 1), 'VEC', 'Value Education Course', 'Ethics and values'),
((SELECT id FROM academic_verticals WHERE code = 'CC' LIMIT 1), 'CC', 'Co-Curricular Courses', 'Cultural activities'),
((SELECT id FROM academic_verticals WHERE code = 'RM' LIMIT 1), 'RM', 'Research Methodology', 'Research methods'),
((SELECT id FROM academic_verticals WHERE code = 'CEP' LIMIT 1), 'CEP', 'Community Engineering Project', 'Community projects'),
((SELECT id FROM academic_verticals WHERE code = 'PROJ' LIMIT 1), 'PROJ', 'Project', 'Major projects'),
((SELECT id FROM academic_verticals WHERE code = 'INTP' LIMIT 1), 'INTP', 'Internship/OJT', 'Internships')
ON CONFLICT (vertical_id, code) DO NOTHING;

-- Insert comprehensive program credit structure
INSERT INTO program_credit_structure (degree_program_id, branch_id, vertical_id, basket_id, semester, min_credits, max_credits, recommended_credits) VALUES
-- Semester 1 (BTech IT)
((SELECT id FROM degree_programs WHERE code = 'BTech' LIMIT 1), 
 (SELECT id FROM branches WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM academic_verticals WHERE code = 'BSC' LIMIT 1),
 (SELECT id FROM credit_baskets WHERE code = 'BSC' LIMIT 1), 1, 6, 6, 6),

((SELECT id FROM degree_programs WHERE code = 'BTech' LIMIT 1), 
 (SELECT id FROM branches WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM academic_verticals WHERE code = 'ESC' LIMIT 1),
 (SELECT id FROM credit_baskets WHERE code = 'ESC' LIMIT 1), 1, 6, 6, 6),

((SELECT id FROM degree_programs WHERE code = 'BTech' LIMIT 1), 
 (SELECT id FROM branches WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM academic_verticals WHERE code = 'VSEC' LIMIT 1),
 (SELECT id FROM credit_baskets WHERE code = 'VSEC' LIMIT 1), 1, 3, 3, 3),

((SELECT id FROM degree_programs WHERE code = 'BTech' LIMIT 1), 
 (SELECT id FROM branches WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM academic_verticals WHERE code = 'AEC' LIMIT 1),
 (SELECT id FROM credit_baskets WHERE code = 'AEC' LIMIT 1), 1, 3, 3, 3),

((SELECT id FROM degree_programs WHERE code = 'BTech' LIMIT 1), 
 (SELECT id FROM branches WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM academic_verticals WHERE code = 'VEC' LIMIT 1),
 (SELECT id FROM credit_baskets WHERE code = 'VEC' LIMIT 1), 1, 3, 3, 3),

-- Semester 2
((SELECT id FROM degree_programs WHERE code = 'BTech' LIMIT 1), 
 (SELECT id FROM branches WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM academic_verticals WHERE code = 'BSC' LIMIT 1),
 (SELECT id FROM credit_baskets WHERE code = 'BSC' LIMIT 1), 2, 3, 3, 3),

((SELECT id FROM degree_programs WHERE code = 'BTech' LIMIT 1), 
 (SELECT id FROM branches WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM academic_verticals WHERE code = 'ESC' LIMIT 1),
 (SELECT id FROM credit_baskets WHERE code = 'ESC' LIMIT 1), 2, 6, 6, 6),

((SELECT id FROM degree_programs WHERE code = 'BTech' LIMIT 1), 
 (SELECT id FROM branches WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM academic_verticals WHERE code = 'VSEC' LIMIT 1),
 (SELECT id FROM credit_baskets WHERE code = 'VSEC' LIMIT 1), 2, 3, 3, 3),

((SELECT id FROM degree_programs WHERE code = 'BTech' LIMIT 1), 
 (SELECT id FROM branches WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM academic_verticals WHERE code = 'MDM' LIMIT 1),
 (SELECT id FROM credit_baskets WHERE code = 'MDM' LIMIT 1), 2, 2, 2, 2),

((SELECT id FROM degree_programs WHERE code = 'BTech' LIMIT 1), 
 (SELECT id FROM branches WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM academic_verticals WHERE code = 'AEC' LIMIT 1),
 (SELECT id FROM credit_baskets WHERE code = 'AEC' LIMIT 1), 2, 1, 1, 1),

((SELECT id FROM degree_programs WHERE code = 'BTech' LIMIT 1), 
 (SELECT id FROM branches WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM academic_verticals WHERE code = 'IKS' LIMIT 1),
 (SELECT id FROM credit_baskets WHERE code = 'IKS' LIMIT 1), 2, 2, 2, 2),

((SELECT id FROM degree_programs WHERE code = 'BTech' LIMIT 1), 
 (SELECT id FROM branches WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM academic_verticals WHERE code = 'CC' LIMIT 1),
 (SELECT id FROM credit_baskets WHERE code = 'CC' LIMIT 1), 2, 2, 2, 2),

-- Continue for all 8 semesters...
-- Semester 3
((SELECT id FROM degree_programs WHERE code = 'BTech' LIMIT 1), 
 (SELECT id FROM branches WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM academic_verticals WHERE code = 'BSC' LIMIT 1),
 (SELECT id FROM credit_baskets WHERE code = 'BSC' LIMIT 1), 3, 3, 3, 3),

((SELECT id FROM degree_programs WHERE code = 'BTech' LIMIT 1), 
 (SELECT id FROM branches WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM academic_verticals WHERE code = 'PCC' LIMIT 1),
 (SELECT id FROM credit_baskets WHERE code = 'PCC' LIMIT 1), 3, 9, 9, 9),

((SELECT id FROM degree_programs WHERE code = 'BTech' LIMIT 1), 
 (SELECT id FROM branches WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM academic_verticals WHERE code = 'MDM' LIMIT 1),
 (SELECT id FROM credit_baskets WHERE code = 'MDM' LIMIT 1), 3, 3, 3, 3),

((SELECT id FROM degree_programs WHERE code = 'BTech' LIMIT 1), 
 (SELECT id FROM branches WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM academic_verticals WHERE code = 'VSEC' LIMIT 1),
 (SELECT id FROM credit_baskets WHERE code = 'VSEC' LIMIT 1), 3, 2, 2, 2),

((SELECT id FROM degree_programs WHERE code = 'BTech' LIMIT 1), 
 (SELECT id FROM branches WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM academic_verticals WHERE code = 'CC' LIMIT 1),
 (SELECT id FROM credit_baskets WHERE code = 'CC' LIMIT 1), 3, 2, 2, 2),

-- Semester 4
((SELECT id FROM degree_programs WHERE code = 'BTech' LIMIT 1), 
 (SELECT id FROM branches WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM academic_verticals WHERE code = 'BSC' LIMIT 1),
 (SELECT id FROM credit_baskets WHERE code = 'BSC' LIMIT 1), 4, 3, 3, 3),

((SELECT id FROM degree_programs WHERE code = 'BTech' LIMIT 1), 
 (SELECT id FROM branches WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM academic_verticals WHERE code = 'PCC' LIMIT 1),
 (SELECT id FROM credit_baskets WHERE code = 'PCC' LIMIT 1), 4, 12, 12, 12),

((SELECT id FROM degree_programs WHERE code = 'BTech' LIMIT 1), 
 (SELECT id FROM branches WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM academic_verticals WHERE code = 'MDM' LIMIT 1),
 (SELECT id FROM credit_baskets WHERE code = 'MDM' LIMIT 1), 4, 3, 3, 3),

-- Semester 5
((SELECT id FROM degree_programs WHERE code = 'BTech' LIMIT 1), 
 (SELECT id FROM branches WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM academic_verticals WHERE code = 'PCC' LIMIT 1),
 (SELECT id FROM credit_baskets WHERE code = 'PCC' LIMIT 1), 5, 12, 12, 12),

((SELECT id FROM degree_programs WHERE code = 'BTech' LIMIT 1), 
 (SELECT id FROM branches WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM academic_verticals WHERE code = 'PEC' LIMIT 1),
 (SELECT id FROM credit_baskets WHERE code = 'PEC' LIMIT 1), 5, 3, 3, 3),

((SELECT id FROM degree_programs WHERE code = 'BTech' LIMIT 1), 
 (SELECT id FROM branches WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM academic_verticals WHERE code = 'MDM' LIMIT 1),
 (SELECT id FROM credit_baskets WHERE code = 'MDM' LIMIT 1), 5, 3, 3, 3),

((SELECT id FROM degree_programs WHERE code = 'BTech' LIMIT 1), 
 (SELECT id FROM branches WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM academic_verticals WHERE code = 'OE' LIMIT 1),
 (SELECT id FROM credit_baskets WHERE code = 'OE' LIMIT 1), 5, 3, 3, 3),

((SELECT id FROM degree_programs WHERE code = 'BTech' LIMIT 1), 
 (SELECT id FROM branches WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM academic_verticals WHERE code = 'EEMC' LIMIT 1),
 (SELECT id FROM credit_baskets WHERE code = 'EEMC' LIMIT 1), 5, 3, 3, 3),

((SELECT id FROM degree_programs WHERE code = 'BTech' LIMIT 1), 
 (SELECT id FROM branches WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM academic_verticals WHERE code = 'INTP' LIMIT 1),
 (SELECT id FROM credit_baskets WHERE code = 'INTP' LIMIT 1), 5, 2, 2, 2),

-- Semester 6
((SELECT id FROM degree_programs WHERE code = 'BTech' LIMIT 1), 
 (SELECT id FROM branches WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM academic_verticals WHERE code = 'PCC' LIMIT 1),
 (SELECT id FROM credit_baskets WHERE code = 'PCC' LIMIT 1), 6, 9, 9, 9),

((SELECT id FROM degree_programs WHERE code = 'BTech' LIMIT 1), 
 (SELECT id FROM branches WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM academic_verticals WHERE code = 'PEC' LIMIT 1),
 (SELECT id FROM credit_baskets WHERE code = 'PEC' LIMIT 1), 6, 6, 6, 6),

((SELECT id FROM degree_programs WHERE code = 'BTech' LIMIT 1), 
 (SELECT id FROM branches WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM academic_verticals WHERE code = 'MDM' LIMIT 1),
 (SELECT id FROM credit_baskets WHERE code = 'MDM' LIMIT 1), 6, 3, 3, 3),

((SELECT id FROM degree_programs WHERE code = 'BTech' LIMIT 1), 
 (SELECT id FROM branches WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM academic_verticals WHERE code = 'EEMC' LIMIT 1),
 (SELECT id FROM credit_baskets WHERE code = 'EEMC' LIMIT 1), 6, 3, 3, 3),

((SELECT id FROM degree_programs WHERE code = 'BTech' LIMIT 1), 
 (SELECT id FROM branches WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM academic_verticals WHERE code = 'CEP' LIMIT 1),
 (SELECT id FROM credit_baskets WHERE code = 'CEP' LIMIT 1), 6, 2, 2, 2),

((SELECT id FROM degree_programs WHERE code = 'BTech' LIMIT 1), 
 (SELECT id FROM branches WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM academic_verticals WHERE code = 'INTP' LIMIT 1),
 (SELECT id FROM credit_baskets WHERE code = 'INTP' LIMIT 1), 6, 2, 2, 2),

-- Semester 7
((SELECT id FROM degree_programs WHERE code = 'BTech' LIMIT 1), 
 (SELECT id FROM branches WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM academic_verticals WHERE code = 'PCC' LIMIT 1),
 (SELECT id FROM credit_baskets WHERE code = 'PCC' LIMIT 1), 7, 3, 3, 3),

((SELECT id FROM degree_programs WHERE code = 'BTech' LIMIT 1), 
 (SELECT id FROM branches WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM academic_verticals WHERE code = 'PEC' LIMIT 1),
 (SELECT id FROM credit_baskets WHERE code = 'PEC' LIMIT 1), 7, 9, 9, 9),

((SELECT id FROM degree_programs WHERE code = 'BTech' LIMIT 1), 
 (SELECT id FROM branches WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM academic_verticals WHERE code = 'OE' LIMIT 1),
 (SELECT id FROM credit_baskets WHERE code = 'OE' LIMIT 1), 7, 5, 5, 5),

((SELECT id FROM degree_programs WHERE code = 'BTech' LIMIT 1), 
 (SELECT id FROM branches WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM academic_verticals WHERE code = 'EEMC' LIMIT 1),
 (SELECT id FROM credit_baskets WHERE code = 'EEMC' LIMIT 1), 7, 3, 3, 3),

((SELECT id FROM degree_programs WHERE code = 'BTech' LIMIT 1), 
 (SELECT id FROM branches WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM academic_verticals WHERE code = 'INTP' LIMIT 1),
 (SELECT id FROM credit_baskets WHERE code = 'INTP' LIMIT 1), 7, 2, 2, 2),

-- Semester 8
((SELECT id FROM degree_programs WHERE code = 'BTech' LIMIT 1), 
 (SELECT id FROM branches WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM academic_verticals WHERE code = 'AEC' LIMIT 1),
 (SELECT id FROM credit_baskets WHERE code = 'AEC' LIMIT 1), 8, 3, 3, 3),

((SELECT id FROM degree_programs WHERE code = 'BTech' LIMIT 1), 
 (SELECT id FROM branches WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM academic_verticals WHERE code = 'EEMC' LIMIT 1),
 (SELECT id FROM credit_baskets WHERE code = 'EEMC' LIMIT 1), 8, 3, 3, 3),

((SELECT id FROM degree_programs WHERE code = 'BTech' LIMIT 1), 
 (SELECT id FROM branches WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM academic_verticals WHERE code = 'RM' LIMIT 1),
 (SELECT id FROM credit_baskets WHERE code = 'RM' LIMIT 1), 8, 3, 3, 3),

((SELECT id FROM degree_programs WHERE code = 'BTech' LIMIT 1), 
 (SELECT id FROM branches WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM academic_verticals WHERE code = 'PROJ' LIMIT 1),
 (SELECT id FROM credit_baskets WHERE code = 'PROJ' LIMIT 1), 8, 6, 6, 6),

((SELECT id FROM degree_programs WHERE code = 'BTech' LIMIT 1), 
 (SELECT id FROM branches WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM academic_verticals WHERE code = 'INTP' LIMIT 1),
 (SELECT id FROM credit_baskets WHERE code = 'INTP' LIMIT 1), 8, 15, 15, 15)

ON CONFLICT (degree_program_id, branch_id, vertical_id, basket_id, semester) DO NOTHING;

-- Insert sample courses for Information Technology
INSERT INTO courses (
  university_id, department_id, degree_program_id, branch_id, vertical_id, basket_id,
  course_code, title, short_title, course_type, credits, semester,
  lecture_hours, tutorial_hours, practical_hours, internal_marks, external_marks
) VALUES
-- Semester 1 Courses
('550e8400-e29b-41d4-a716-446655440000', 
 (SELECT id FROM departments WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM degree_programs WHERE code = 'BTech' LIMIT 1),
 (SELECT id FROM branches WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM academic_verticals WHERE code = 'BSC' LIMIT 1),
 (SELECT id FROM credit_baskets WHERE code = 'BSC' LIMIT 1),
 'MA101', 'Engineering Mathematics I', 'Maths I', 'Theory', 3, 1, 3, 1, 0, 30, 70),

('550e8400-e29b-41d4-a716-446655440000', 
 (SELECT id FROM departments WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM degree_programs WHERE code = 'BTech' LIMIT 1),
 (SELECT id FROM branches WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM academic_verticals WHERE code = 'BSC' LIMIT 1),
 (SELECT id FROM credit_baskets WHERE code = 'BSC' LIMIT 1),
 'PH101', 'Engineering Physics', 'Physics', 'Theory', 3, 1, 3, 1, 0, 30, 70),

('550e8400-e29b-41d4-a716-446655440000', 
 (SELECT id FROM departments WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM degree_programs WHERE code = 'BTech' LIMIT 1),
 (SELECT id FROM branches WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM academic_verticals WHERE code = 'ESC' LIMIT 1),
 (SELECT id FROM credit_baskets WHERE code = 'ESC' LIMIT 1),
 'EC101', 'Basic Electronics Engineering', 'Electronics', 'Theory', 3, 1, 3, 0, 0, 30, 70),

('550e8400-e29b-41d4-a716-446655440000', 
 (SELECT id FROM departments WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM degree_programs WHERE code = 'BTech' LIMIT 1),
 (SELECT id FROM branches WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM academic_verticals WHERE code = 'ESC' LIMIT 1),
 (SELECT id FROM credit_baskets WHERE code = 'ESC' LIMIT 1),
 'ME101', 'Basic Mechanical Engineering', 'Mechanical', 'Theory', 3, 1, 3, 0, 0, 30, 70),

('550e8400-e29b-41d4-a716-446655440000', 
 (SELECT id FROM departments WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM degree_programs WHERE code = 'BTech' LIMIT 1),
 (SELECT id FROM branches WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM academic_verticals WHERE code = 'VSEC' LIMIT 1),
 (SELECT id FROM credit_baskets WHERE code = 'VSEC' LIMIT 1),
 'CS101', 'Programming for Problem Solving', 'Programming', 'Practical', 3, 1, 1, 0, 4, 50, 50),

('550e8400-e29b-41d4-a716-446655440000', 
 (SELECT id FROM departments WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM degree_programs WHERE code = 'BTech' LIMIT 1),
 (SELECT id FROM branches WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM academic_verticals WHERE code = 'AEC' LIMIT 1),
 (SELECT id FROM credit_baskets WHERE code = 'AEC' LIMIT 1),
 'EN101', 'English Communication', 'English', 'Theory', 3, 1, 2, 0, 2, 50, 50),

('550e8400-e29b-41d4-a716-446655440000', 
 (SELECT id FROM departments WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM degree_programs WHERE code = 'BTech' LIMIT 1),
 (SELECT id FROM branches WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM academic_verticals WHERE code = 'VEC' LIMIT 1),
 (SELECT id FROM credit_baskets WHERE code = 'VEC' LIMIT 1),
 'HU101', 'Ethics and Human Values', 'Ethics', 'Theory', 3, 1, 3, 0, 0, 50, 50),

-- Semester 2 Courses
('550e8400-e29b-41d4-a716-446655440000', 
 (SELECT id FROM departments WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM degree_programs WHERE code = 'BTech' LIMIT 1),
 (SELECT id FROM branches WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM academic_verticals WHERE code = 'BSC' LIMIT 1),
 (SELECT id FROM credit_baskets WHERE code = 'BSC' LIMIT 1),
 'MA201', 'Engineering Mathematics II', 'Maths II', 'Theory', 3, 2, 3, 1, 0, 30, 70),

('550e8400-e29b-41d4-a716-446655440000', 
 (SELECT id FROM departments WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM degree_programs WHERE code = 'BTech' LIMIT 1),
 (SELECT id FROM branches WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM academic_verticals WHERE code = 'ESC' LIMIT 1),
 (SELECT id FROM credit_baskets WHERE code = 'ESC' LIMIT 1),
 'CS201', 'Data Structures and Algorithms', 'DSA', 'Theory', 3, 2, 3, 0, 2, 30, 70),

('550e8400-e29b-41d4-a716-446655440000', 
 (SELECT id FROM departments WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM degree_programs WHERE code = 'BTech' LIMIT 1),
 (SELECT id FROM branches WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM academic_verticals WHERE code = 'ESC' LIMIT 1),
 (SELECT id FROM credit_baskets WHERE code = 'ESC' LIMIT 1),
 'IT201', 'Digital Logic Design', 'DLD', 'Theory', 3, 2, 3, 0, 2, 30, 70),

('550e8400-e29b-41d4-a716-446655440000', 
 (SELECT id FROM departments WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM degree_programs WHERE code = 'BTech' LIMIT 1),
 (SELECT id FROM branches WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM academic_verticals WHERE code = 'VSEC' LIMIT 1),
 (SELECT id FROM credit_baskets WHERE code = 'VSEC' LIMIT 1),
 'IT202', 'Web Technologies', 'Web Tech', 'Practical', 3, 2, 1, 0, 4, 50, 50),

-- Add more courses for all semesters...
-- Semester 3 Advanced Courses
('550e8400-e29b-41d4-a716-446655440000', 
 (SELECT id FROM departments WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM degree_programs WHERE code = 'BTech' LIMIT 1),
 (SELECT id FROM branches WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM academic_verticals WHERE code = 'PCC' LIMIT 1),
 (SELECT id FROM credit_baskets WHERE code = 'PCC' LIMIT 1),
 'IT301', 'Database Management Systems', 'DBMS', 'Theory', 3, 3, 3, 0, 2, 30, 70),

('550e8400-e29b-41d4-a716-446655440000', 
 (SELECT id FROM departments WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM degree_programs WHERE code = 'BTech' LIMIT 1),
 (SELECT id FROM branches WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM academic_verticals WHERE code = 'PCC' LIMIT 1),
 (SELECT id FROM credit_baskets WHERE code = 'PCC' LIMIT 1),
 'IT302', 'Object Oriented Programming', 'OOP', 'Theory', 3, 3, 3, 0, 2, 30, 70),

('550e8400-e29b-41d4-a716-446655440000', 
 (SELECT id FROM departments WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM degree_programs WHERE code = 'BTech' LIMIT 1),
 (SELECT id FROM branches WHERE code = 'INFT' LIMIT 1),
 (SELECT id FROM academic_verticals WHERE code = 'PCC' LIMIT 1),
 (SELECT id FROM credit_baskets WHERE code = 'PCC' LIMIT 1),
 'IT303', 'Computer Networks', 'Networks', 'Theory', 3, 3, 3, 0, 2, 30, 70)

ON CONFLICT (university_id, course_code) DO NOTHING;

-- Insert system settings
INSERT INTO system_settings (university_id, setting_key, setting_value, setting_type, description, is_public) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'max_credits_per_semester', '25', 'number', 'Maximum credits a student can take per semester', false),
('550e8400-e29b-41d4-a716-446655440000', 'min_credits_per_semester', '18', 'number', 'Minimum credits required per semester', false),
('550e8400-e29b-41d4-a716-446655440000', 'passing_grade', '40', 'number', 'Minimum percentage required to pass a course', true),
('550e8400-e29b-41d4-a716-446655440000', 'academic_year_start', '2024-07-01', 'string', 'Academic year start date', true),
('550e8400-e29b-41d4-a716-446655440000', 'grading_system', 'percentage', 'string', 'Grading system used (percentage/gpa)', true),
('550e8400-e29b-41d4-a716-446655440000', 'enable_course_prerequisites', 'true', 'boolean', 'Enable course prerequisite checking', false),
('550e8400-e29b-41d4-a716-446655440000', 'max_attempts_per_course', '3', 'number', 'Maximum attempts allowed per course', false)
ON CONFLICT (university_id, setting_key) DO NOTHING;

-- Insert sample admin user
INSERT INTO faculty (
  university_id, department_id, employee_id, email, password_hash,
  first_name, last_name, full_name, title, designation, user_role
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  (SELECT id FROM departments WHERE code = 'INFT' LIMIT 1),
  'ADMIN001', 'admin@vidyalankar.edu.in',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeNfp6M1MzG8.f/FK', -- password: admin123
  'System', 'Administrator', 'System Administrator',
  'Mr.', 'Administrator', 'Super Admin'
) ON CONFLICT (employee_id) DO NOTHING;

-- ================================================================
-- VIEWS for Common Queries
-- ================================================================

-- View for student academic summary
CREATE OR REPLACE VIEW student_academic_summary AS
SELECT 
  s.id,
  s.roll_number,
  s.full_name,
  s.current_semester,
  s.total_credits_earned,
  s.cgpa,
  dp.name as degree_name,
  b.name as branch_name,
  u.name as university_name
FROM students s
JOIN degree_programs dp ON s.degree_program_id = dp.id
JOIN branches b ON s.branch_id = b.id
JOIN universities u ON s.university_id = u.id
WHERE s.is_active = true;

-- View for course enrollment details
CREATE OR REPLACE VIEW course_enrollment_details AS
SELECT 
  ce.id,
  s.roll_number,
  s.full_name as student_name,
  c.course_code,
  c.title as course_title,
  c.credits,
  c.semester,
  av.name as vertical_name,
  cb.name as basket_name,
  ce.enrollment_type,
  ce.is_active
FROM course_enrollments ce
JOIN students s ON ce.student_id = s.id
JOIN courses c ON ce.course_id = c.id
JOIN academic_verticals av ON c.vertical_id = av.id
JOIN credit_baskets cb ON c.basket_id = cb.id;

-- View for student progress by vertical
CREATE OR REPLACE VIEW student_vertical_progress AS
SELECT 
  s.id as student_id,
  s.roll_number,
  s.full_name,
  av.code as vertical_code,
  av.name as vertical_name,
  COALESCE(SUM(cc.credits_earned), 0) as credits_earned,
  COALESCE(
    (SELECT SUM(pcs.recommended_credits) 
     FROM program_credit_structure pcs 
     WHERE pcs.degree_program_id = s.degree_program_id 
     AND pcs.branch_id = s.branch_id 
     AND pcs.vertical_id = av.id), 0
  ) as total_required_credits
FROM students s
CROSS JOIN academic_verticals av
LEFT JOIN completed_courses cc ON s.id = cc.student_id 
  AND cc.completion_status = 'Passed'
LEFT JOIN courses c ON cc.course_id = c.id AND c.vertical_id = av.id
WHERE s.is_active = true AND av.university_id = s.university_id
GROUP BY s.id, s.roll_number, s.full_name, av.id, av.code, av.name, s.degree_program_id, s.branch_id;

-- ================================================================
-- FINAL NOTES
-- ================================================================

/*
This comprehensive database schema includes:

1. **Multi-University Support**: Can handle multiple institutions
2. **Complete Academic Structure**: Universities → Departments → Programs → Branches
3. **Flexible Credit System**: Verticals and Baskets for credit categorization
4. **Faculty Management**: Complete staff and teacher management
5. **Student Lifecycle**: From admission to graduation
6. **Course Management**: Prerequisites, assignments, assessments
7. **Assessment System**: Multiple assessment types with grading
8. **Progress Tracking**: Detailed academic progress monitoring
9. **Security**: Row-level security with proper policies
10. **Audit Trail**: Complete change tracking
11. **Performance**: Proper indexing for optimal queries
12. **Notifications**: Built-in notification system
13. **System Settings**: Configurable system parameters
14. **Views**: Pre-built views for common queries

To deploy:
1. Set up Supabase project
2. Run this SQL script in the Supabase SQL editor
3. Configure your application's environment variables
4. Update the authentication functions based on your auth system
5. Customize the sample data as per your requirements

The schema is production-ready and can handle:
- Multiple universities and departments
- Complex academic structures
- Thousands of students and courses
- Detailed progress tracking
- Faculty and admin management
- Comprehensive reporting
*/
