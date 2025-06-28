-- ================================================================
-- FIX ADMIN RLS POLICIES
-- Remove infinite recursion issues in admin table policies
-- ================================================================

-- Drop existing policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can view roles" ON admin_roles;
DROP POLICY IF EXISTS "Super admins can manage roles" ON admin_roles;
DROP POLICY IF EXISTS "Admins can view permissions" ON admin_permissions;
DROP POLICY IF EXISTS "Admins can view own data" ON admins;
DROP POLICY IF EXISTS "Admins can update own data" ON admins;
DROP POLICY IF EXISTS "Super admins can manage admins" ON admins;

-- Temporarily disable RLS on admin tables to allow API access
-- We'll handle permissions at the application level for admin tables
ALTER TABLE admin_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_role_permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions DISABLE ROW LEVEL SECURITY;

-- Grant necessary permissions to authenticated users
GRANT SELECT ON admin_roles TO authenticated;
GRANT SELECT ON admin_permissions TO authenticated;
GRANT SELECT ON admin_role_permissions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON admins TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON admin_sessions TO authenticated;

-- Grant permissions to anon users for login functionality
GRANT SELECT ON admins TO anon;
GRANT INSERT, UPDATE ON admin_sessions TO anon;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_role ON admins(admin_role_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_id ON admin_sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);
