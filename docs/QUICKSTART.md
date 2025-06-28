# 🚀 Quick Start Guide - Vidyalankar Credits System

## Current Issue & Solution

Your application was failing with the error:
```
"Could not find the 'branch' column of 'students' in the schema cache"
```

This happens because there's a mismatch between the database schema and what the application expects.

## 🔧 Step-by-Step Fix

### 1. Apply Database Schema (Required)

#### Option A: Use the complete setup script (Recommended)
1. Go to your Supabase dashboard → SQL Editor
2. Copy and paste the entire contents of `complete-database-setup.sql`
3. Run the script

#### Option B: Manual setup
1. First run `database-schema.sql` (if not already done)
2. Then run `fix-students-table.sql` 

### 2. Verify the Setup

Run this query in Supabase SQL Editor to verify:
```sql
-- Quick verification
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'students' 
AND column_name IN ('degree', 'branch', 'semester')
ORDER BY column_name;

-- Should return: branch, degree, semester
```

### 3. Start the Application

```bash
cd /workspaces/vidyalankar-credits-clean
npm run dev
```

The application should now start without errors!

## 🧪 Test the Application

### 1. Create a Student Account
- Go to `http://localhost:3001/signup` 
- Fill in the registration form
- Use these sample values:
  - Roll Number: `TEST001`
  - Degree: `BTech`
  - Branch: `INFT`
  - Division: `A`

### 2. Login and Select Semester
- Login with your created credentials
- Select your current semester (1-8)
- You should see the dashboard with courses

### 3. View Progress
- Navigate to the progress report
- See your credit breakdown by vertical/basket

## 📊 What's Available

After running the database setup, you'll have:

- ✅ **Students table** with both relational (foreign keys) and simple (string) columns
- ✅ **Courses table** with sample courses for semesters 1-4
- ✅ **Proper RLS policies** for security
- ✅ **Sample course data** for testing
- ✅ **Credit tracking system** ready to use

## 🔍 Sample Courses Added

**Semester 1:**
- Engineering Mathematics I (4 credits)
- Engineering Physics I (3 credits) 
- Programming Fundamentals (4 credits)
- And more...

**Semester 2:**
- Data Structures (4 credits)
- Basic Electrical Engineering (3 credits)
- And more...

## 🐛 Common Issues

### Issue: "auth.uid() not found"
**Solution:** The RLS policies are simplified to work without complex auth setup.

### Issue: "Permission denied" 
**Solution:** The policies are set to allow necessary operations for the application.

### Issue: No courses showing
**Solution:** Make sure you've run the complete database setup script which includes sample courses.

## 🔗 Application URLs

- **Home:** `http://localhost:3001/`
- **Signup:** `http://localhost:3001/signup`
- **Login:** `http://localhost:3001/login`
- **Dashboard:** `http://localhost:3001/dashboard` (after login)
- **Progress:** `http://localhost:3001/progress-report` (after login)

## 📁 Next Steps

Once you confirm everything is working:

1. **Add more courses** for semesters 5-8
2. **Customize the credit structure** for your specific requirements
3. **Add admin functionality** for course management
4. **Implement grade tracking** features
5. **Add reporting capabilities**

## 💡 Architecture Notes

The current implementation uses a **hybrid approach**:
- **Simple string fields** (degree, branch, etc.) for immediate compatibility
- **Relational foreign keys** for future scalability
- **Both approaches work together** without conflicts

This allows you to migrate gradually to the full relational model when ready.

---

**🎉 Your Vidyalankar Credits System should now be fully functional!**
