# 🔧 Scripts Directory

This directory contains utility scripts for development, testing, and deployment of the Vidyalankar Credits System.

## 📋 Available Scripts

### 🔍 Testing & Verification
- **`test-all-admin-roles.js`** - Comprehensive test suite for all 6 admin roles and their permissions
- **`test-admin-roles.js`** - Basic admin role testing
- **`test-admin-system.mjs`** - Admin system functionality tests
- **`verify-admin-system.js`** - Verify admin system deployment
- **`verify-current-structure.js`** - Check current database structure

### 👥 Admin Management  
- **`create-sample-admins.js`** - Create sample admin accounts for testing
- **`check-admins.js`** - List all admin accounts and their roles
- **`setup-admin.sh`** - Shell script for admin system setup

### 🚀 Deployment & RBAC
- **`apply-and-test-rbac.js`** - Apply RBAC changes and run tests
- Currently empty - placeholder for RBAC deployment

## 🏃‍♂️ How to Run Scripts

### Node.js Scripts
```bash
# Run from project root
node scripts/script-name.js

# Example: Test all admin roles
node scripts/test-all-admin-roles.js
```

### Shell Scripts
```bash
# Make executable and run
chmod +x scripts/setup-admin.sh
./scripts/setup-admin.sh
```

## ⚠️ Important Notes

- **Development Only**: Most of these scripts are for development and testing
- **Environment**: Ensure `.env.local` is configured before running
- **Database**: Scripts require active database connection to Supabase
- **Order**: Some scripts depend on database migrations being run first

## 🔄 Typical Workflow

1. Run database migrations in order (001 → 005)
2. Execute `create-sample-admins.js` to set up test accounts
3. Run `test-all-admin-roles.js` to verify permissions
4. Use `verify-admin-system.js` to confirm deployment

## 🛡️ Security

These scripts contain test credentials and should **never** be deployed to production environments. They are strictly for development and testing purposes.
