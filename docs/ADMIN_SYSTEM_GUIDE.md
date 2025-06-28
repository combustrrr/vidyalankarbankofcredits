# Admin System Implementation Guide

## 🎯 Overview

The Vidyalankar Credits System now includes a comprehensive **Role-Based Access Control (RBAC)** admin system with multiple admin roles, granular permissions, and secure authentication.

## 🏗️ Architecture

### Core Components

1. **Database Schema** (`admin-system-database.sql`)
   - `admin_roles` - Define different administrator roles
   - `admin_permissions` - Granular permission system
   - `admin_role_permissions` - Maps roles to permissions
   - `admins` - Administrator user accounts
   - `admin_sessions` - Secure session management

2. **Authentication System**
   - JWT-based authentication
   - Session management with IP tracking
   - Password hashing with bcrypt
   - Account lockout after failed attempts

3. **Frontend Components**
   - Admin login page (`/admin/login`)
   - Admin dashboard (`/admin/dashboard`)
   - User management (`/admin/users`)
   - Academic management (`/admin/academic`)
   - Route protection with permission checks

## 🔐 Default Roles & Permissions

### Roles
- **Super Administrator** (`super_admin`) - Full system access
- **University Administrator** (`university_admin`) - University-wide access
- **Department Administrator** (`department_admin`) - Department-specific access
- **Academic Coordinator** (`academic_coordinator`) - Course management
- **Student Affairs Officer** (`student_affairs`) - Student management
- **Report Viewer** (`report_viewer`) - Read-only access

### Permission Categories
- **Users**: `manage_students`, `view_students`, `manage_faculty`, `reset_passwords`
- **Academic**: `manage_courses`, `manage_programs`, `manage_curriculum`
- **System**: `system_settings`, `manage_universities`, `view_audit_logs`
- **Reports**: `view_reports`, `generate_reports`, `export_data`

## 🚀 Setup Instructions

### 1. Database Migration

**Option A: Manual Setup (Recommended)**
1. Go to [Supabase SQL Editor](https://supabase.com/dashboard/project/ubxxwbiwjtxnkojwssqd/sql)
2. Copy the entire contents of `admin-system-database.sql`
3. Paste and execute in the SQL Editor
4. Verify tables are created successfully

**Option B: Using psql (if network allows)**
```bash
# Set up environment
source .env.local
PGPASSWORD="${DATABASE_PASSWORD}" psql "postgresql://postgres:${DATABASE_PASSWORD}@db.ubxxwbiwjtxnkojwssqd.supabase.co:5432/postgres" -f admin-system-database.sql
```

### 2. Application Setup

The admin system is already integrated into the Next.js application:

```bash
# Install dependencies (already done)
npm install bcrypt @types/bcrypt jsonwebtoken @types/jsonwebtoken

# Start development server
npm run dev
```

## 🎯 Usage

### Admin Login
- URL: `http://localhost:3001/admin/login`
- Default Credentials:
  - Username: `superadmin`
  - Password: `admin123`

### Admin Dashboard
- URL: `http://localhost:3001/admin/dashboard`
- Shows role-based navigation based on permissions
- Quick overview statistics
- Permission-based access controls

### Key Features
1. **User Management** - Manage students and faculty
2. **Academic Management** - Courses, programs, curriculum
3. **System Settings** - Configuration and maintenance
4. **Reports & Analytics** - Data insights and exports
5. **Admin Management** - Create/manage admin accounts (Super Admin only)

## 🔧 API Endpoints

### Authentication
- `POST /api/admin/auth/login` - Admin login
- `POST /api/admin/auth/logout` - Admin logout  
- `GET /api/admin/auth/check` - Verify authentication

### Setup
- `POST /api/admin/setup` - System setup verification

## 🛡️ Security Features

1. **JWT Authentication** with configurable expiration
2. **Session Management** with IP and user agent tracking
3. **Password Security** with bcrypt hashing
4. **Account Lockout** after 5 failed login attempts
5. **Permission-Based Access Control** for all admin functions
6. **Row Level Security** policies for data protection

## 🔍 Permission System

### Using Permissions in Components
```tsx
import { useAdminAuth } from '../../src/contexts/AdminAuthContext';

const MyComponent = () => {
  const { hasPermission, hasRole, isSuperAdmin } = useAdminAuth();
  
  if (hasPermission('manage_students')) {
    // Show student management features
  }
  
  if (isSuperAdmin()) {
    // Show super admin features
  }
};
```

### Route Protection
```tsx
import AdminRouteGuard from '../../src/components/AdminRouteGuard';

const ProtectedPage = () => (
  <AdminRouteGuard requiredPermissions={['manage_courses']}>
    <YourComponent />
  </AdminRouteGuard>
);
```

## 📁 File Structure

```
pages/
  admin/
    login.tsx           # Admin login page
    dashboard.tsx       # Main admin dashboard
    users.tsx          # User management
    academic.tsx       # Academic management
  api/
    admin/
      auth/
        login.ts       # Login API
        logout.ts      # Logout API
        check.ts       # Auth verification
      setup.ts         # Setup verification

src/
  contexts/
    AdminAuthContext.tsx # Admin authentication context
  components/
    AdminRouteGuard.tsx  # Route protection component

admin-system-database.sql  # Complete database migration
setup-admin.js            # Setup helper script
```

## 🔄 Next Steps

1. **Complete Database Setup** - Run the SQL migration manually
2. **Test Admin Login** - Verify authentication works
3. **Customize Permissions** - Adjust roles and permissions as needed
4. **Add Custom Features** - Extend admin functionality
5. **Production Deployment** - Set up production environment variables

## 🐛 Troubleshooting

### Common Issues

1. **Login Fails**
   - Verify database migration completed
   - Check environment variables
   - Ensure super admin was created

2. **Permission Errors**
   - Check role assignments in database
   - Verify permission mappings
   - Review RLS policies

3. **Database Connection**
   - Verify Supabase credentials
   - Check network connectivity
   - Use manual SQL execution if needed

### Support

For issues or questions, check:
1. Browser developer console for errors
2. Network tab for failed API calls
3. Supabase logs for database issues
4. Environment variable configuration

---

✅ **Admin System Status**: Implemented and Ready for Database Migration
🔗 **Access**: `http://localhost:3001/admin/login` (after DB setup)
👤 **Default Login**: `superadmin` / `admin123`
