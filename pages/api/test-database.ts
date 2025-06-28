/**
 * Database Test API - Verify database structure and connectivity
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSupabaseClient } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const supabase = getServerSupabaseClient();

    // Test 1: Check if tables exist and basic connectivity
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['students', 'courses', 'completed_courses']);

    if (tablesError) {
      return res.status(500).json({
        success: false,
        error: 'Failed to check database tables',
        details: tablesError
      });
    }

    // Test 2: Check students table structure
    const { data: studentColumns, error: studentColumnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'students')
      .in('column_name', ['id', 'roll_number', 'degree', 'branch', 'semester', 'password_hash']);

    if (studentColumnsError) {
      return res.status(500).json({
        success: false,
        error: 'Failed to check students table structure',
        details: studentColumnsError
      });
    }

    // Test 3: Check courses table structure
    const { data: courseColumns, error: courseColumnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'courses')
      .in('column_name', ['id', 'course_code', 'degree', 'branch', 'vertical', 'basket', 'type']);

    if (courseColumnsError) {
      return res.status(500).json({
        success: false,
        error: 'Failed to check courses table structure',
        details: courseColumnsError
      });
    }

    // Test 4: Check if sample data exists
    const { data: sampleCourses, error: coursesError } = await supabase
      .from('courses')
      .select('id, course_code, title, semester')
      .limit(5);

    if (coursesError) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch sample courses',
        details: coursesError
      });
    }

    // Test 5: Try to insert a test record (and immediately delete it)
    const testRollNumber = `TEST_${Date.now()}`;
    
    const { data: insertResult, error: insertError } = await supabase
      .from('students')
      .insert([{
        roll_number: testRollNumber,
        first_name: 'Test',
        last_name: 'User',
        full_name: 'Test User',
        legal_name: 'Test User',
        password_hash: 'test_hash',
        degree: 'BTech',
        branch: 'INFT',
        division: 'A',
        total_credits_earned: 0,
        semester: 1
      }])
      .select('id')
      .single();

    // Clean up test record
    if (!insertError && insertResult) {
      await supabase
        .from('students')
        .delete()
        .eq('id', insertResult.id);
    }

    // Compile results
    const results = {
      success: true,
      timestamp: new Date().toISOString(),
      tests: {
        database_connectivity: !tablesError,
        tables_exist: {
          passed: tables && tables.length >= 3,
          found_tables: tables?.map(t => t.table_name) || []
        },
        students_table_structure: {
          passed: studentColumns && studentColumns.length >= 6,
          columns: studentColumns || []
        },
        courses_table_structure: {
          passed: courseColumns && courseColumns.length >= 7,
          columns: courseColumns || []
        },
        sample_data_exists: {
          passed: sampleCourses && sampleCourses.length > 0,
          sample_courses_count: sampleCourses?.length || 0,
          sample_courses: sampleCourses || []
        },
        insert_operation: {
          passed: !insertError,
          error: insertError?.message || null
        }
      }
    };

    // Determine overall status
    const allTestsPassed = Object.values(results.tests).every(test => 
      typeof test === 'boolean' ? test : test.passed
    );

    if (!allTestsPassed) {
      return res.status(200).json({
        ...results,
        success: false,
        message: 'Some database tests failed. Please run the database setup scripts.'
      });
    }

    res.status(200).json({
      ...results,
      message: 'All database tests passed! Your database is properly configured.'
    });

  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({
      success: false,
      error: 'Database test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
