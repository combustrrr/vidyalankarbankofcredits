# 🗄️ SQL Directory

Database schemas, migrations, and utilities for the Vidyalankar Credits System.

## 📁 Directory Structure

```
sql/
├── migrations/           # Database migration files (run in order)
├── seeds/               # Sample data for development
├── utilities/           # Helper and maintenance scripts
└── README.md           # This file
```

## 🔄 Migration Files (Run in Order)

1. **`001_initial_schema.sql`** - Initial database schema with core tables
2. **`002_schema_fixes.sql`** - Schema corrections and improvements
3. **`003_admin_system.sql`** - RBAC admin system implementation
4. **`004_fix_admin_rls.sql`** - Row-Level Security (RLS) policy fixes
5. **`005_correct_rbac_structure.sql`** - Final RBAC structure per requirements

## 🌱 Seed Data

- **`seeds/sample_data.sql`** - Sample universities, departments, courses, and student data
  - Use for development and testing only
  - Contains demo admin accounts with test credentials

## 🛠️ Utilities

- **`utilities/verify-deployment.sql`** - Verification queries to check deployment
- **`utilities/troubleshooting.sql`** - Common troubleshooting queries and fixes

## 🚀 Deployment Instructions

### For Supabase

1. Go to your Supabase project dashboard
2. Open the SQL Editor
3. Run migration files in numerical order (001 → 005)
4. Optionally run seed data for development
5. Run verification queries to confirm setup

### For Other PostgreSQL

```bash
# Connect to your database and run:
psql -U username -d database_name -f sql/migrations/001_initial_schema.sql
psql -U username -d database_name -f sql/migrations/002_schema_fixes.sql
# ... continue with remaining migrations
```

## ⚠️ Important Notes

- **Order Matters**: Always run migrations in numerical order
- **Production**: Never run seed data in production environments
- **Backup**: Always backup your database before running migrations
- **Testing**: Use utilities/verify-deployment.sql to confirm successful deployment

## 🔍 Schema Overview

### Core Tables
- Universities, Departments, Degree Programs, Branches
- Academic Verticals, Credit Baskets, Courses
- Students, Faculty, Course Enrollments

### Admin System (RBAC)
- `admin_roles` - Defines 6 admin role types
- `admins` - Admin user accounts with university and role assignments
- `admin_permissions` - Maps roles to specific permissions (heart of RBAC)

### Permissions Structure
Each admin role has specific permissions for:
- User management (students, faculty, admins)
- Academic management (courses, programs, curriculum)
- System management (settings, universities, departments)  
- Reporting and analytics
- Communication and notifications
