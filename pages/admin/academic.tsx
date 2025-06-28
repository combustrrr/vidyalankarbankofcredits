import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminRouteGuard from '../../src/components/AdminRouteGuard';

const AdminAcademicPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'courses' | 'programs' | 'curriculum'>('courses');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      if (activeTab === 'courses') {
        const response = await fetch('/api/courses');
        const data = await response.json();
        
        if (data.success) {
          setCourses(data.data || []);
        } else {
          setError(data.message || 'Failed to fetch courses');
        }
      }
      // Other tabs would have their own API calls
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const formatCredits = (credits: number) => {
    return `${credits} Credit${credits !== 1 ? 's' : ''}`;
  };

  return (
    <AdminRouteGuard requiredPermissions={['view_courses', 'manage_courses', 'manage_programs', 'manage_curriculum']}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <button
                  onClick={() => router.push('/admin/dashboard')}
                  className="mr-4 text-gray-500 hover:text-gray-700"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Academic Management</h1>
                  <p className="text-sm text-gray-500">Manage courses, programs, and curriculum</p>
                </div>
              </div>
              
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Add {activeTab === 'courses' ? 'Course' : activeTab === 'programs' ? 'Program' : 'Curriculum'}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('courses')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'courses'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Courses
                </button>
                <button
                  onClick={() => setActiveTab('programs')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'programs'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Programs & Branches
                </button>
                <button
                  onClick={() => setActiveTab('curriculum')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'curriculum'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Curriculum Structure
                </button>
              </nav>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Content */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading {activeTab}...</p>
              </div>
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                {activeTab === 'courses' ? (
                  courses.length === 0 ? (
                    <div className="text-center py-12">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No courses found</h3>
                      <p className="mt-1 text-sm text-gray-500">Get started by creating a new course.</p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {courses.map((course: any) => (
                        <li key={course.id}>
                          <div className="px-4 py-4 flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                                  <span className="text-xs font-medium text-green-600">
                                    {course.course_code}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {course.course_name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {course.course_code} • {formatCredits(course.credits)}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {course.degree} - {course.branch} • Semester {course.semester}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                course.is_active 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {course.is_active ? 'Active' : 'Inactive'}
                              </span>
                              <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                                Edit
                              </button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )
                ) : activeTab === 'programs' ? (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Program Management</h3>
                    <p className="mt-1 text-sm text-gray-500">Manage degree programs and branches. Coming soon...</p>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Curriculum Structure</h3>
                    <p className="mt-1 text-sm text-gray-500">Define credit requirements and course structures. Coming soon...</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </AdminRouteGuard>
  );
};

export default AdminAcademicPage;
