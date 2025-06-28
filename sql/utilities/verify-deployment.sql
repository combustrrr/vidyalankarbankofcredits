-- ================================================================
-- QUICK VERIFICATION SCRIPT FOR SUPABASE
-- Run these queries one by one to verify your deployment
-- ================================================================

-- 1. Check if all main tables exist
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
AND table_name IN (
  'universities', 'departments', 'degree_programs', 'branches',
  'academic_verticals', 'credit_baskets', 'faculty', 'students',
  'courses', 'completed_courses', 'course_enrollments'
)
ORDER BY table_name;

-- Expected result: Should show 11+ tables

-- 2. Check if RLS is enabled (Alternative method for Supabase)
SELECT 
  t.table_name,
  obj_description(c.oid) as table_comment,
  CASE WHEN EXISTS(
    SELECT 1 FROM pg_policies 
    WHERE tablename = t.table_name 
    AND schemaname = 'public'
  ) THEN 'RLS Enabled' ELSE 'No RLS' END as rls_status
FROM information_schema.tables t
JOIN pg_class c ON c.relname = t.table_name
WHERE t.table_schema = 'public' 
AND t.table_type = 'BASE TABLE'
AND t.table_name IN ('students', 'faculty', 'courses', 'completed_courses')
ORDER BY t.table_name;

-- Expected result: Should show "RLS Enabled" for all tables

-- 3. Check sample data
SELECT 'Universities' as table_name, count(*) as record_count FROM universities
UNION ALL
SELECT 'Academic Verticals', count(*) FROM academic_verticals
UNION ALL
SELECT 'Credit Baskets', count(*) FROM credit_baskets
UNION ALL
SELECT 'Departments', count(*) FROM departments
UNION ALL
SELECT 'Degree Programs', count(*) FROM degree_programs
UNION ALL
SELECT 'Branches', count(*) FROM branches;

-- Expected result: Should show counts > 0 for all

-- 4. Check program credit structure
SELECT 
  dp.name as degree,
  b.name as branch,
  av.name as vertical,
  pcs.semester,
  pcs.recommended_credits
FROM program_credit_structure pcs
JOIN degree_programs dp ON pcs.degree_program_id = dp.id
JOIN branches b ON pcs.branch_id = b.id
JOIN academic_verticals av ON pcs.vertical_id = av.id
ORDER BY pcs.semester, av.name
LIMIT 10;

-- Expected result: Should show program structure data

-- 5. Test a simple course query
SELECT 
  c.course_code,
  c.title,
  c.credits,
  c.semester,
  av.name as vertical,
  cb.name as basket
FROM courses c
JOIN academic_verticals av ON c.vertical_id = av.id
JOIN credit_baskets cb ON c.basket_id = cb.id
WHERE c.semester = 1
ORDER BY c.course_code;

-- Expected result: Should show semester 1 courses

-- 6. Check if indexes were created
SELECT 
  indexname,
  tablename,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Expected result: Should show multiple custom indexes

-- 7. Check functions were created
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
  'update_updated_at_column',
  'update_student_credits',
  'get_current_user_university_id',
  'is_admin',
  'backup_student_data'
)
ORDER BY routine_name;

-- Expected result: Should show 5 functions

-- 8. Final deployment status
SELECT 
  'Schema Deployment' as check_type,
  CASE 
    WHEN (SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE') >= 15
    THEN '✅ PASS - ' || (SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE')::text || ' tables created'
    ELSE '❌ FAIL - Only ' || (SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE')::text || ' tables found'
  END as status
  
UNION ALL

SELECT 
  'Sample Data',
  CASE 
    WHEN (SELECT count(*) FROM universities) > 0 
    AND (SELECT count(*) FROM academic_verticals) > 0
    AND (SELECT count(*) FROM courses) > 0
    THEN '✅ PASS - Sample data loaded'
    ELSE '❌ FAIL - Missing sample data'
  END
  
UNION ALL

SELECT 
  'RLS Policies',
  CASE 
    WHEN (SELECT count(*) FROM pg_policies WHERE schemaname = 'public') > 5
    THEN '✅ PASS - ' || (SELECT count(*) FROM pg_policies WHERE schemaname = 'public')::text || ' policies created'
    ELSE '❌ FAIL - Only ' || (SELECT count(*) FROM pg_policies WHERE schemaname = 'public')::text || ' policies found'
  END

UNION ALL

SELECT 
  'Functions',
  CASE 
    WHEN (SELECT count(*) FROM information_schema.routines WHERE routine_schema = 'public') >= 5
    THEN '✅ PASS - ' || (SELECT count(*) FROM information_schema.routines WHERE routine_schema = 'public')::text || ' functions created'
    ELSE '❌ FAIL - Only ' || (SELECT count(*) FROM information_schema.routines WHERE routine_schema = 'public')::text || ' functions found'
  END;

-- ================================================================
-- If you see any ❌ FAIL messages, there might be an issue with the deployment
-- All checks should show ✅ PASS for a successful deployment
-- ================================================================
