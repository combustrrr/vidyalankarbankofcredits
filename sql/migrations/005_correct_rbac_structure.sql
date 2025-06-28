-- ================================================================
-- CORRECT RBAC STRUCTURE PER USER REQUIREMENTS
-- This corrects the schema to match the user's specification
-- ================================================================

-- Drop existing tables if they exist (in correct order due to dependencies)
DROP TABLE IF EXISTS admin_sessions CASCADE;
DROP TABLE IF EXISTS admin_role_permissions CASCADE; 
DROP TABLE IF EXISTS admins CASCADE;
DROP TABLE IF EXISTS admin_permissions CASCADE;
DROP TABLE IF EXISTS admin_roles CASCADE;

-- ================================================================
-- 1. ADMIN_ROLES TABLE - Defines different types of admin roles
-- ================================================================
CREATE TABLE admin_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  role_name VARCHAR(50) UNIQUE NOT NULL,
  role_code VARCHAR(20) UNIQUE NOT NULL,
  description TEXT,
  is_system_role BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================================
-- 2. ADMINS TABLE - Stores individual admin user accounts
-- Each admin is linked to university_id (unless super admin) and admin_role_id
-- ================================================================
CREATE TABLE admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  university_id UUID REFERENCES universities(id) ON DELETE CASCADE, -- NULL for super_admin
  admin_role_id UUID NOT NULL REFERENCES admin_roles(id) ON DELETE RESTRICT,
  
  -- Login Information
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  
  -- Personal Information
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  full_name VARCHAR(200) NOT NULL,
  phone VARCHAR(20),
  employee_id VARCHAR(50),
  
  -- Department access for department_admin role
  department_access TEXT[], -- Array of department IDs
  
  -- Status and Security
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  last_login TIMESTAMP WITH TIME ZONE,
  password_changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,
  
  -- Audit Fields
  created_by UUID REFERENCES admins(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT admins_username_check CHECK (length(username) >= 3),
  CONSTRAINT admins_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- ================================================================
-- 3. ADMIN_PERMISSIONS TABLE - Heart of RBAC system
-- Maps roles to specific permissions (e.g., can_manage_courses, can_view_reports)
-- ================================================================
CREATE TABLE admin_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_role_id UUID NOT NULL REFERENCES admin_roles(id) ON DELETE CASCADE,
  permission_code VARCHAR(50) NOT NULL,
  permission_name VARCHAR(100) NOT NULL,
  permission_description TEXT,
  category VARCHAR(50) NOT NULL, -- 'users', 'courses', 'reports', 'system'
  granted BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(admin_role_id, permission_code)
);

-- ================================================================
-- ADMIN SESSIONS TABLE (for session management)
-- ================================================================
CREATE TABLE admin_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================================
-- INSERT DEFAULT ADMIN ROLES
-- ================================================================
INSERT INTO admin_roles (role_name, role_code, description, is_system_role) VALUES
('Super Administrator', 'super_admin', 'Has unrestricted access to the entire system across all universities', true),
('University Administrator', 'university_admin', 'Manages a single university''s data, users, and settings', true),
('Department Administrator', 'department_admin', 'Manages a specific department within a university', true),
('Academic Coordinator', 'academic_coordinator', 'Manages courses and academic programs', true),
('Student Affairs Officer', 'student_affairs', 'Manages student enrollment and records', true),
('Report Viewer', 'report_viewer', 'Read-only access to reports and analytics', true)
ON CONFLICT (role_code) DO NOTHING;

-- ================================================================
-- INSERT PERMISSIONS FOR EACH ROLE (Heart of RBAC)
-- ================================================================

-- Super Admin - Unrestricted access to entire system
INSERT INTO admin_permissions (admin_role_id, permission_code, permission_name, permission_description, category) 
SELECT 
  (SELECT id FROM admin_roles WHERE role_code = 'super_admin'),
  permission_code,
  permission_name,
  permission_description,
  category
FROM (VALUES
  ('manage_admins', 'Manage Administrators', 'Create, edit, delete admin accounts', 'users'),
  ('manage_students', 'Manage Students', 'Create, edit, delete student accounts', 'users'),
  ('manage_faculty', 'Manage Faculty', 'Create, edit, delete faculty accounts', 'users'),
  ('view_students', 'View Students', 'View student information and profiles', 'users'),
  ('view_faculty', 'View Faculty', 'View faculty information', 'users'),
  ('reset_passwords', 'Reset Passwords', 'Reset user passwords', 'users'),
  ('manage_courses', 'Manage Courses', 'Create, edit, delete courses', 'courses'),
  ('view_courses', 'View Courses', 'View course information', 'courses'),
  ('manage_programs', 'Manage Programs', 'Manage degree programs and branches', 'courses'),
  ('manage_curriculum', 'Manage Curriculum', 'Define program credit structure', 'courses'),
  ('manage_enrollments', 'Manage Enrollments', 'Enroll/unenroll students in courses', 'courses'),
  ('manage_grades', 'Manage Grades', 'Enter and modify student grades', 'courses'),
  ('system_settings', 'System Settings', 'Modify system configuration', 'system'),
  ('manage_universities', 'Manage Universities', 'Create and manage universities', 'system'),
  ('manage_departments', 'Manage Departments', 'Create and manage departments', 'system'),
  ('view_audit_logs', 'View Audit Logs', 'View system audit logs', 'system'),
  ('system_maintenance', 'System Maintenance', 'Perform system maintenance tasks', 'system'),
  ('view_reports', 'View Reports', 'Access reports and analytics', 'reports'),
  ('generate_reports', 'Generate Reports', 'Create custom reports', 'reports'),
  ('export_data', 'Export Data', 'Export system data', 'reports'),
  ('send_notifications', 'Send Notifications', 'Send system notifications to users', 'communication'),
  ('manage_announcements', 'Manage Announcements', 'Create and manage announcements', 'communication')
) AS perms(permission_code, permission_name, permission_description, category)
ON CONFLICT (admin_role_id, permission_code) DO NOTHING;

-- University Admin - Manages single university (no system-wide admin management)
INSERT INTO admin_permissions (admin_role_id, permission_code, permission_name, permission_description, category)
SELECT 
  (SELECT id FROM admin_roles WHERE role_code = 'university_admin'),
  permission_code,
  permission_name,
  permission_description,
  category
FROM (VALUES
  ('manage_students', 'Manage Students', 'Create, edit, delete student accounts', 'users'),
  ('manage_faculty', 'Manage Faculty', 'Create, edit, delete faculty accounts', 'users'),
  ('view_students', 'View Students', 'View student information and profiles', 'users'),
  ('view_faculty', 'View Faculty', 'View faculty information', 'users'),
  ('reset_passwords', 'Reset Passwords', 'Reset user passwords', 'users'),
  ('manage_courses', 'Manage Courses', 'Create, edit, delete courses', 'courses'),
  ('view_courses', 'View Courses', 'View course information', 'courses'),
  ('manage_programs', 'Manage Programs', 'Manage degree programs and branches', 'courses'),
  ('manage_curriculum', 'Manage Curriculum', 'Define program credit structure', 'courses'),
  ('manage_enrollments', 'Manage Enrollments', 'Enroll/unenroll students in courses', 'courses'),
  ('manage_grades', 'Manage Grades', 'Enter and modify student grades', 'courses'),
  ('manage_departments', 'Manage Departments', 'Create and manage departments', 'system'),
  ('view_audit_logs', 'View Audit Logs', 'View system audit logs', 'system'),
  ('view_reports', 'View Reports', 'Access reports and analytics', 'reports'),
  ('generate_reports', 'Generate Reports', 'Create custom reports', 'reports'),
  ('export_data', 'Export Data', 'Export system data', 'reports'),
  ('send_notifications', 'Send Notifications', 'Send system notifications to users', 'communication'),
  ('manage_announcements', 'Manage Announcements', 'Create and manage announcements', 'communication')
) AS perms(permission_code, permission_name, permission_description, category)
ON CONFLICT (admin_role_id, permission_code) DO NOTHING;

-- Department Admin - Manages specific department
INSERT INTO admin_permissions (admin_role_id, permission_code, permission_name, permission_description, category)
SELECT 
  (SELECT id FROM admin_roles WHERE role_code = 'department_admin'),
  permission_code,
  permission_name,
  permission_description,
  category
FROM (VALUES
  ('view_students', 'View Students', 'View student information and profiles', 'users'),
  ('manage_students', 'Manage Students', 'Create, edit, delete student accounts', 'users'),
  ('view_faculty', 'View Faculty', 'View faculty information', 'users'),
  ('manage_faculty', 'Manage Faculty', 'Create, edit, delete faculty accounts', 'users'),
  ('view_courses', 'View Courses', 'View course information', 'courses'),
  ('manage_courses', 'Manage Courses', 'Create, edit, delete courses', 'courses'),
  ('manage_enrollments', 'Manage Enrollments', 'Enroll/unenroll students in courses', 'courses'),
  ('manage_grades', 'Manage Grades', 'Enter and modify student grades', 'courses'),
  ('view_reports', 'View Reports', 'Access reports and analytics', 'reports'),
  ('send_notifications', 'Send Notifications', 'Send system notifications to users', 'communication')
) AS perms(permission_code, permission_name, permission_description, category)
ON CONFLICT (admin_role_id, permission_code) DO NOTHING;

-- Academic Coordinator - Course and curriculum management
INSERT INTO admin_permissions (admin_role_id, permission_code, permission_name, permission_description, category)
SELECT 
  (SELECT id FROM admin_roles WHERE role_code = 'academic_coordinator'),
  permission_code,
  permission_name,
  permission_description,
  category
FROM (VALUES
  ('view_students', 'View Students', 'View student information and profiles', 'users'),
  ('view_courses', 'View Courses', 'View course information', 'courses'),
  ('manage_courses', 'Manage Courses', 'Create, edit, delete courses', 'courses'),
  ('manage_curriculum', 'Manage Curriculum', 'Define program credit structure', 'courses'),
  ('manage_enrollments', 'Manage Enrollments', 'Enroll/unenroll students in courses', 'courses'),
  ('view_reports', 'View Reports', 'Access reports and analytics', 'reports'),
  ('generate_reports', 'Generate Reports', 'Create custom reports', 'reports')
) AS perms(permission_code, permission_name, permission_description, category)
ON CONFLICT (admin_role_id, permission_code) DO NOTHING;

-- Student Affairs Officer - Student management
INSERT INTO admin_permissions (admin_role_id, permission_code, permission_name, permission_description, category)
SELECT 
  (SELECT id FROM admin_roles WHERE role_code = 'student_affairs'),
  permission_code,
  permission_name,
  permission_description,
  category
FROM (VALUES
  ('view_students', 'View Students', 'View student information and profiles', 'users'),
  ('manage_students', 'Manage Students', 'Create, edit, delete student accounts', 'users'),
  ('reset_passwords', 'Reset Passwords', 'Reset user passwords', 'users'),
  ('manage_enrollments', 'Manage Enrollments', 'Enroll/unenroll students in courses', 'courses'),
  ('view_courses', 'View Courses', 'View course information', 'courses'),
  ('view_reports', 'View Reports', 'Access reports and analytics', 'reports'),
  ('send_notifications', 'Send Notifications', 'Send system notifications to users', 'communication'),
  ('manage_announcements', 'Manage Announcements', 'Create and manage announcements', 'communication')
) AS perms(permission_code, permission_name, permission_description, category)
ON CONFLICT (admin_role_id, permission_code) DO NOTHING;

-- Report Viewer - Read-only access
INSERT INTO admin_permissions (admin_role_id, permission_code, permission_name, permission_description, category)
SELECT 
  (SELECT id FROM admin_roles WHERE role_code = 'report_viewer'),
  permission_code,
  permission_name,
  permission_description,
  category
FROM (VALUES
  ('view_students', 'View Students', 'View student information and profiles', 'users'),
  ('view_faculty', 'View Faculty', 'View faculty information', 'users'),
  ('view_courses', 'View Courses', 'View course information', 'courses'),
  ('view_reports', 'View Reports', 'Access reports and analytics', 'reports'),
  ('export_data', 'Export Data', 'Export system data', 'reports')
) AS perms(permission_code, permission_name, permission_description, category)
ON CONFLICT (admin_role_id, permission_code) DO NOTHING;

-- ================================================================
-- CREATE DEFAULT SUPER ADMIN
-- ================================================================
INSERT INTO admins (
  username, 
  email, 
  password_hash, 
  first_name, 
  last_name, 
  full_name,
  admin_role_id,
  is_active,
  is_verified
) VALUES (
  'superadmin',
  'admin@vidyalankar.edu.in',
  '$2b$12$LQv3c1yqBwVHxkd/fYJc7eJJKvJJ0rQdBkOzMmQvHjA8Jp4lA8rU6', -- Password: admin123
  'System',
  'Administrator', 
  'System Administrator',
  (SELECT id FROM admin_roles WHERE role_code = 'super_admin'),
  true,
  true
) ON CONFLICT (username) DO NOTHING;

-- ================================================================
-- CREATE UTILITY FUNCTIONS
-- ================================================================

-- Function to get admin permissions (updated for new structure)
CREATE OR REPLACE FUNCTION get_admin_permissions(admin_id UUID)
RETURNS TABLE(permission_code TEXT, permission_name TEXT, category TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ap.permission_code,
    ap.permission_name,
    ap.category
  FROM admins a
  JOIN admin_permissions ap ON a.admin_role_id = ap.admin_role_id
  WHERE a.id = admin_id 
  AND ap.granted = true
  AND a.is_active = true
  ORDER BY ap.category, ap.permission_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if admin has specific permission
CREATE OR REPLACE FUNCTION admin_has_permission(
  admin_id UUID,
  permission_code TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  has_permission BOOLEAN := false;
BEGIN
  SELECT EXISTS(
    SELECT 1 
    FROM admins a
    JOIN admin_permissions ap ON a.admin_role_id = ap.admin_role_id
    WHERE a.id = admin_id 
    AND ap.permission_code = permission_code
    AND ap.granted = true
    AND a.is_active = true
  ) INTO has_permission;
  
  RETURN has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_university_id ON admins(university_id);
CREATE INDEX IF NOT EXISTS idx_admins_role_id ON admins(admin_role_id);
CREATE INDEX IF NOT EXISTS idx_admins_active ON admins(is_active);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_id ON admin_sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);

CREATE INDEX IF NOT EXISTS idx_admin_permissions_role ON admin_permissions(admin_role_id);
CREATE INDEX IF NOT EXISTS idx_admin_permissions_code ON admin_permissions(permission_code);

-- Disable RLS for admin tables (handle permissions at application level)
ALTER TABLE admin_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions DISABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT SELECT ON admin_roles TO authenticated, anon;
GRANT SELECT ON admin_permissions TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE ON admins TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON admin_sessions TO authenticated, anon;
