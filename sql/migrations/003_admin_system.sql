-- ================================================================
-- ADMIN SYSTEM DATABASE EXTENSION
-- Add RBAC (Role-Based Access Control) for Admin Management
-- ================================================================

-- ================================================================
-- ADMIN ROLES TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS admin_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  role_name VARCHAR(50) UNIQUE NOT NULL,
  role_code VARCHAR(20) UNIQUE NOT NULL,
  description TEXT,
  is_system_role BOOLEAN DEFAULT false, -- Prevents deletion of core roles
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================================
-- ADMIN PERMISSIONS TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS admin_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  permission_name VARCHAR(100) UNIQUE NOT NULL,
  permission_code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL, -- e.g., 'users', 'courses', 'reports', 'system'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================================
-- ROLE PERMISSIONS MAPPING TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS admin_role_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_role_id UUID NOT NULL REFERENCES admin_roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES admin_permissions(id) ON DELETE CASCADE,
  granted BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(admin_role_id, permission_id)
);

-- ================================================================
-- ADMINS TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS admins (
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
  
  -- Admin Specific Fields
  employee_id VARCHAR(50),
  department_access TEXT[], -- Array of department IDs for department_admin
  
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
-- ADMIN SESSIONS TABLE (for enhanced security)
-- ================================================================
CREATE TABLE IF NOT EXISTS admin_sessions (
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
('Super Administrator', 'super_admin', 'Full system access across all universities', true),
('University Administrator', 'university_admin', 'Full access within assigned university', true),
('Department Administrator', 'department_admin', 'Access to specific departments within university', true),
('Academic Coordinator', 'academic_coordinator', 'Manage courses and academic programs', true),
('Student Affairs Officer', 'student_affairs', 'Manage student enrollment and records', true),
('Report Viewer', 'report_viewer', 'Read-only access to reports and analytics', true)
ON CONFLICT (role_code) DO NOTHING;

-- ================================================================
-- INSERT DEFAULT PERMISSIONS
-- ================================================================
INSERT INTO admin_permissions (permission_name, permission_code, description, category) VALUES
-- User Management
('Manage Students', 'manage_students', 'Create, edit, delete student accounts', 'users'),
('View Students', 'view_students', 'View student information and profiles', 'users'),
('Manage Faculty', 'manage_faculty', 'Create, edit, delete faculty accounts', 'users'),
('View Faculty', 'view_faculty', 'View faculty information', 'users'),
('Manage Admins', 'manage_admins', 'Create, edit, delete admin accounts', 'users'),
('Reset Passwords', 'reset_passwords', 'Reset user passwords', 'users'),

-- Academic Management  
('Manage Courses', 'manage_courses', 'Create, edit, delete courses', 'academic'),
('View Courses', 'view_courses', 'View course information', 'academic'),
('Manage Programs', 'manage_programs', 'Manage degree programs and branches', 'academic'),
('Manage Curriculum', 'manage_curriculum', 'Define program credit structure', 'academic'),
('Manage Enrollments', 'manage_enrollments', 'Enroll/unenroll students in courses', 'academic'),
('Manage Grades', 'manage_grades', 'Enter and modify student grades', 'academic'),

-- System Management
('System Settings', 'system_settings', 'Modify system configuration', 'system'),
('Manage Universities', 'manage_universities', 'Create and manage universities', 'system'),
('Manage Departments', 'manage_departments', 'Create and manage departments', 'system'),
('View Audit Logs', 'view_audit_logs', 'View system audit logs', 'system'),
('System Maintenance', 'system_maintenance', 'Perform system maintenance tasks', 'system'),

-- Reporting
('View Reports', 'view_reports', 'Access reports and analytics', 'reports'),
('Generate Reports', 'generate_reports', 'Create custom reports', 'reports'),
('Export Data', 'export_data', 'Export system data', 'reports'),

-- Notifications
('Send Notifications', 'send_notifications', 'Send system notifications to users', 'communication'),
('Manage Announcements', 'manage_announcements', 'Create and manage announcements', 'communication')

ON CONFLICT (permission_code) DO NOTHING;

-- ================================================================
-- ASSIGN PERMISSIONS TO ROLES
-- ================================================================

-- Super Admin - All Permissions
INSERT INTO admin_role_permissions (admin_role_id, permission_id)
SELECT 
  (SELECT id FROM admin_roles WHERE role_code = 'super_admin'),
  p.id
FROM admin_permissions p
ON CONFLICT (admin_role_id, permission_id) DO NOTHING;

-- University Admin - Most Permissions (excluding system-wide management)
INSERT INTO admin_role_permissions (admin_role_id, permission_id)
SELECT 
  (SELECT id FROM admin_roles WHERE role_code = 'university_admin'),
  p.id
FROM admin_permissions p
WHERE p.permission_code NOT IN ('manage_universities', 'manage_admins', 'system_maintenance')
ON CONFLICT (admin_role_id, permission_id) DO NOTHING;

-- Department Admin - Department-specific permissions
INSERT INTO admin_role_permissions (admin_role_id, permission_id)
SELECT 
  (SELECT id FROM admin_roles WHERE role_code = 'department_admin'),
  p.id
FROM admin_permissions p
WHERE p.permission_code IN (
  'view_students', 'manage_students', 'view_faculty', 'manage_faculty',
  'view_courses', 'manage_courses', 'manage_enrollments', 'manage_grades',
  'view_reports', 'send_notifications'
)
ON CONFLICT (admin_role_id, permission_id) DO NOTHING;

-- Academic Coordinator - Course and curriculum management
INSERT INTO admin_role_permissions (admin_role_id, permission_id)
SELECT 
  (SELECT id FROM admin_roles WHERE role_code = 'academic_coordinator'),
  p.id
FROM admin_permissions p
WHERE p.permission_code IN (
  'view_students', 'view_courses', 'manage_courses', 'manage_curriculum',
  'manage_enrollments', 'view_reports', 'generate_reports'
)
ON CONFLICT (admin_role_id, permission_id) DO NOTHING;

-- Student Affairs Officer - Student management
INSERT INTO admin_role_permissions (admin_role_id, permission_id)
SELECT 
  (SELECT id FROM admin_roles WHERE role_code = 'student_affairs'),
  p.id
FROM admin_permissions p
WHERE p.permission_code IN (
  'view_students', 'manage_students', 'reset_passwords', 'manage_enrollments',
  'view_courses', 'view_reports', 'send_notifications', 'manage_announcements'
)
ON CONFLICT (admin_role_id, permission_id) DO NOTHING;

-- Report Viewer - Read-only access
INSERT INTO admin_role_permissions (admin_role_id, permission_id)
SELECT 
  (SELECT id FROM admin_roles WHERE role_code = 'report_viewer'),
  p.id
FROM admin_permissions p
WHERE p.permission_code IN (
  'view_students', 'view_faculty', 'view_courses', 'view_reports', 'export_data'
)
ON CONFLICT (admin_role_id, permission_id) DO NOTHING;

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
-- ENABLE ROW LEVEL SECURITY
-- ================================================================
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- CREATE RLS POLICIES FOR ADMIN TABLES
-- ================================================================

-- Admin Roles - Readable by all admins, manageable by super admins
CREATE POLICY "Admins can view roles" ON admin_roles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()::uuid AND is_active = true)
  );

CREATE POLICY "Super admins can manage roles" ON admin_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admins a 
      JOIN admin_roles ar ON a.admin_role_id = ar.id
      WHERE a.id = auth.uid()::uuid 
      AND ar.role_code = 'super_admin' 
      AND a.is_active = true
    )
  );

-- Admin Permissions - Similar to roles
CREATE POLICY "Admins can view permissions" ON admin_permissions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()::uuid AND is_active = true)
  );

-- Admins table - Self access + hierarchical access
CREATE POLICY "Admins can view own data" ON admins
  FOR SELECT USING (
    id = auth.uid()::uuid OR
    EXISTS (
      SELECT 1 FROM admins a 
      JOIN admin_roles ar ON a.admin_role_id = ar.id
      WHERE a.id = auth.uid()::uuid 
      AND ar.role_code IN ('super_admin', 'university_admin')
      AND a.is_active = true
    )
  );

CREATE POLICY "Admins can update own data" ON admins
  FOR UPDATE USING (
    id = auth.uid()::uuid OR
    EXISTS (
      SELECT 1 FROM admins a 
      JOIN admin_roles ar ON a.admin_role_id = ar.id
      WHERE a.id = auth.uid()::uuid 
      AND ar.role_code = 'super_admin'
      AND a.is_active = true
    )
  );

-- ================================================================
-- CREATE ADMIN UTILITY FUNCTIONS
-- ================================================================

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
    JOIN admin_role_permissions arp ON a.admin_role_id = arp.admin_role_id
    JOIN admin_permissions ap ON arp.permission_id = ap.id
    WHERE a.id = admin_id 
    AND ap.permission_code = permission_code
    AND arp.granted = true
    AND a.is_active = true
    AND ap.is_active = true
  ) INTO has_permission;
  
  RETURN has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get admin permissions
CREATE OR REPLACE FUNCTION get_admin_permissions(admin_id UUID)
RETURNS TABLE(permission_code TEXT, permission_name TEXT, category TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ap.permission_code,
    ap.permission_name,
    ap.category
  FROM admins a
  JOIN admin_role_permissions arp ON a.admin_role_id = arp.admin_role_id
  JOIN admin_permissions ap ON arp.permission_id = ap.id
  WHERE a.id = admin_id 
  AND arp.granted = true
  AND a.is_active = true
  AND ap.is_active = true
  ORDER BY ap.category, ap.permission_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create admin session
CREATE OR REPLACE FUNCTION create_admin_session(
  admin_id UUID,
  session_token TEXT,
  ip_address INET DEFAULT NULL,
  user_agent TEXT DEFAULT NULL,
  expires_in_hours INTEGER DEFAULT 24
) RETURNS UUID AS $$
DECLARE
  session_id UUID;
BEGIN
  -- Cleanup expired sessions for this admin
  DELETE FROM admin_sessions 
  WHERE admin_id = create_admin_session.admin_id 
  AND expires_at < NOW();
  
  -- Create new session
  INSERT INTO admin_sessions (
    admin_id, 
    session_token, 
    ip_address, 
    user_agent, 
    expires_at
  ) VALUES (
    admin_id,
    session_token,
    ip_address,
    user_agent,
    NOW() + (expires_in_hours || ' hours')::INTERVAL
  ) RETURNING id INTO session_id;
  
  RETURN session_id;
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

CREATE INDEX IF NOT EXISTS idx_admin_role_permissions_role ON admin_role_permissions(admin_role_id);
CREATE INDEX IF NOT EXISTS idx_admin_role_permissions_permission ON admin_role_permissions(permission_id);

-- ================================================================
-- VERIFICATION QUERIES
-- ================================================================
SELECT 'Admin system setup completed!' as status;

-- Verify admin tables
SELECT 
  'Admin tables created' as verification,
  count(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('admin_roles', 'admin_permissions', 'admin_role_permissions', 'admins', 'admin_sessions');

-- Verify default data
SELECT 
  'Default roles created' as verification,
  count(*) as role_count
FROM admin_roles;

SELECT 
  'Default permissions created' as verification,
  count(*) as permission_count
FROM admin_permissions;

SELECT 
  'Super admin created' as verification,
  count(*) as admin_count
FROM admins WHERE username = 'superadmin';
