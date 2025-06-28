-- ================================================================
-- TROUBLESHOOTING GUIDE FOR SUPABASE DEPLOYMENT
-- ================================================================

-- If you're getting errors during deployment, try these steps:

-- STEP 1: Check PostgreSQL version and extensions
SELECT version();
SELECT * FROM pg_available_extensions WHERE name IN ('uuid-ossp', 'pgcrypto');

-- STEP 2: Enable required extensions (run these first if not enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- STEP 3: If you get function errors, create them individually

-- Create the update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the user university function (simplified for troubleshooting)
CREATE OR REPLACE FUNCTION get_current_user_university_id() 
RETURNS UUID AS $$
BEGIN
  -- Simplified version that returns the default university
  RETURN '550e8400-e29b-41d4-a716-446655440000'::UUID;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the admin check function (simplified for troubleshooting)
CREATE OR REPLACE FUNCTION is_admin() 
RETURNS BOOLEAN AS $$
BEGIN
  -- Simplified version for initial deployment
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 4: Check if auth.uid() function exists (Supabase specific)
SELECT auth.uid();

-- If the above fails, you might need to create a mock version for testing:
-- CREATE OR REPLACE FUNCTION auth.uid() RETURNS UUID AS $$ BEGIN RETURN null; END; $$ LANGUAGE plpgsql;

-- STEP 5: Test table creation individually (if bulk creation fails)

-- Test creating just the universities table
CREATE TABLE IF NOT EXISTS universities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100) DEFAULT 'India',
  established_year INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Test inserting sample university
INSERT INTO universities (id, name, code, city, state, country, established_year) 
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'Vidyalankar Institute of Technology', 'VIT', 'Mumbai', 'Maharashtra', 'India', 1999)
ON CONFLICT (code) DO NOTHING;

-- Check if the insert worked
SELECT * FROM universities;

-- STEP 6: If RLS policies fail, disable them temporarily for testing
-- ALTER TABLE universities DISABLE ROW LEVEL SECURITY;

-- STEP 7: Common error fixes

-- Error: "relation does not exist"
-- Solution: Make sure you're in the right schema
SET search_path TO public;

-- Error: "permission denied"
-- Solution: Check if you have sufficient privileges
-- GRANT ALL ON SCHEMA public TO your_user;

-- Error: "function does not exist"
-- Solution: Create functions step by step rather than in bulk

-- STEP 8: Minimal working test
-- If everything fails, try this minimal setup:

/*
-- Minimal test schema
CREATE TABLE test_students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  roll_number VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(200) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO test_students (roll_number, full_name) 
VALUES ('TEST001', 'Test Student');

SELECT * FROM test_students;

-- If this works, then gradually add more tables
*/

-- STEP 9: Reset everything (use with caution!)
/*
-- WARNING: This will delete all data!
-- DROP SCHEMA public CASCADE;
-- CREATE SCHEMA public;
-- GRANT ALL ON SCHEMA public TO your_user;
-- GRANT ALL ON SCHEMA public TO public;
*/

-- ================================================================
-- DEPLOYMENT ORDER (if doing step by step)
-- ================================================================

/*
Recommended order if you need to create tables individually:

1. Enable extensions
2. Create universities table
3. Create academic_years table  
4. Create departments table
5. Create degree_programs table
6. Create branches table
7. Create academic_verticals table
8. Create credit_baskets table
9. Create faculty table
10. Create students table
11. Create courses table
12. Create remaining tables
13. Create indexes
14. Create functions
15. Create triggers
16. Enable RLS
17. Create policies
18. Insert sample data
*/
