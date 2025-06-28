/**
 * Database Test Page - For testing database connectivity and structure
 */

import { useState, useEffect } from 'react';
import Head from 'next/head';

interface TestResult {
  success: boolean;
  timestamp: string;
  tests: {
    database_connectivity: boolean;
    tables_exist: {
      passed: boolean;
      found_tables: string[];
    };
    students_table_structure: {
      passed: boolean;
      columns: Array<{
        column_name: string;
        data_type: string;
        is_nullable: string;
      }>;
    };
    courses_table_structure: {
      passed: boolean;
      columns: Array<{
        column_name: string;
        data_type: string;
        is_nullable: string;
      }>;
    };
    sample_data_exists: {
      passed: boolean;
      sample_courses_count: number;
      sample_courses: Array<{
        id: string;
        course_code: string;
        title: string;
        semester: number;
      }>;
    };
    insert_operation: {
      passed: boolean;
      error: string | null;
    };
  };
  message: string;
}

const DatabaseTest: React.FC = () => {
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const runDatabaseTest = async () => {
    setLoading(true);
    setError('');
    setTestResult(null);

    try {
      const response = await fetch('/api/test-database');
      const data = await response.json();

      if (response.ok) {
        setTestResult(data);
      } else {
        setError(data.error || 'Failed to run database tests');
      }
    } catch (err) {
      setError('Network error occurred while testing database');
      console.error('Database test error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-run test on page load
    runDatabaseTest();
  }, []);

  const getStatusIcon = (passed: boolean) => {
    return passed ? (
      <span className="text-green-600 text-xl">✅</span>
    ) : (
      <span className="text-red-600 text-xl">❌</span>
    );
  };

  const getStatusColor = (passed: boolean) => {
    return passed ? 'text-green-600' : 'text-red-600';
  };

  return (
    <>
      <Head>
        <title>Database Test - Vidyalankar Credits</title>
      </Head>

      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Database Connectivity Test
            </h1>

            <div className="mb-6 text-center">
              <button
                onClick={runDatabaseTest}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Running Tests...' : 'Run Database Tests'}
              </button>
            </div>

            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Testing database connectivity...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <span className="text-red-600 text-xl">❌</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-red-700 font-medium">Test Failed</p>
                    <p className="text-red-600 text-sm mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {testResult && (
              <div className="space-y-6">
                {/* Overall Status */}
                <div className={`border-l-4 p-4 ${testResult.success ? 'bg-green-50 border-green-500' : 'bg-yellow-50 border-yellow-500'}`}>
                  <div className="flex">
                    <div className="flex-shrink-0">
                      {getStatusIcon(testResult.success)}
                    </div>
                    <div className="ml-3">
                      <p className={`font-medium ${getStatusColor(testResult.success)}`}>
                        {testResult.success ? 'All Tests Passed!' : 'Some Tests Failed'}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">{testResult.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Last tested: {new Date(testResult.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Individual Test Results */}
                <div className="grid gap-4">
                  {/* Database Connectivity */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">Database Connectivity</h3>
                      {getStatusIcon(testResult.tests.database_connectivity)}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {testResult.tests.database_connectivity ? 'Connected successfully' : 'Connection failed'}
                    </p>
                  </div>

                  {/* Tables Existence */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">Required Tables</h3>
                      {getStatusIcon(testResult.tests.tables_exist.passed)}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Found tables: {testResult.tests.tables_exist.found_tables.join(', ') || 'None'}
                    </p>
                  </div>

                  {/* Students Table Structure */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">Students Table Structure</h3>
                      {getStatusIcon(testResult.tests.students_table_structure.passed)}
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-2">Columns found:</p>
                      <div className="text-xs space-y-1">
                        {testResult.tests.students_table_structure.columns.map((col) => (
                          <div key={col.column_name} className="flex justify-between">
                            <span className="font-mono">{col.column_name}</span>
                            <span className="text-gray-500">{col.data_type}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Courses Table Structure */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">Courses Table Structure</h3>
                      {getStatusIcon(testResult.tests.courses_table_structure.passed)}
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-2">Columns found:</p>
                      <div className="text-xs space-y-1">
                        {testResult.tests.courses_table_structure.columns.map((col) => (
                          <div key={col.column_name} className="flex justify-between">
                            <span className="font-mono">{col.column_name}</span>
                            <span className="text-gray-500">{col.data_type}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Sample Data */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">Sample Data</h3>
                      {getStatusIcon(testResult.tests.sample_data_exists.passed)}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Found {testResult.tests.sample_data_exists.sample_courses_count} courses
                    </p>
                    {testResult.tests.sample_data_exists.sample_courses.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">Sample courses:</p>
                        <div className="text-xs space-y-1">
                          {testResult.tests.sample_data_exists.sample_courses.map((course) => (
                            <div key={course.id} className="flex justify-between">
                              <span className="font-mono">{course.course_code}</span>
                              <span className="text-gray-500">Sem {course.semester}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Insert Operation */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">Insert/Delete Operations</h3>
                      {getStatusIcon(testResult.tests.insert_operation.passed)}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {testResult.tests.insert_operation.passed 
                        ? 'Database operations working correctly'
                        : `Error: ${testResult.tests.insert_operation.error}`
                      }
                    </p>
                  </div>
                </div>

                {/* Quick Links */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-3">Quick Actions</h3>
                  <div className="space-y-2">
                    <a 
                      href="/signup" 
                      className="block text-blue-600 hover:text-blue-500 text-sm"
                    >
                      → Test Student Registration
                    </a>
                    <a 
                      href="/login" 
                      className="block text-blue-600 hover:text-blue-500 text-sm"
                    >
                      → Test Student Login
                    </a>
                    <a 
                      href="/" 
                      className="block text-blue-600 hover:text-blue-500 text-sm"
                    >
                      → Go to Home Page
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DatabaseTest;
