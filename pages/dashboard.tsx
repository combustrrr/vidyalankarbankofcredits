import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useStudentAuth } from '@/contexts/StudentAuthContext';
import { Course, CompletedCourse } from '@/types';
import { courseApi, studentApi } from '@/lib/apiClient';

const Dashboard: React.FC = () => {
  const router = useRouter();
  const { student, isAuthenticated, logout } = useStudentAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [completedCourses, setCompletedCourses] = useState<CompletedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (student && student.semester === null) {
      router.replace('/select-semester');
      return;
    }

    if (student) {
      fetchData();
    }
  }, [isAuthenticated, student, router]);

  const fetchData = async () => {
    if (!student || !student.semester) return;

    try {
      setLoading(true);
      setError('');

      // Fetch courses for the student's semester
      const coursesResponse = await courseApi.getAll({
        semester: student.semester,
        degree: student.degree,
        branch: student.branch
      });

      if (coursesResponse.success && coursesResponse.data) {
        setCourses(coursesResponse.data.data);
      }

      // Fetch completed courses
      const completedResponse = await studentApi.getCompletedCourses(student.id);
      if (completedResponse.success && completedResponse.data) {
        setCompletedCourses(completedResponse.data);
      }

    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const isCourseCompleted = (courseId: string) => {
    return completedCourses.some(cc => cc.course_id === courseId);
  };

  const getTotalCredits = () => {
    return completedCourses.reduce((total, cc) => total + cc.credit_awarded, 0);
  };

  const groupCoursesByVertical = () => {
    const grouped: Record<string, Course[]> = {};
    courses.forEach(course => {
      if (!grouped[course.vertical]) {
        grouped[course.vertical] = [];
      }
      grouped[course.vertical].push(course);
    });
    return grouped;
  };

  if (!isAuthenticated || !student) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const groupedCourses = groupCoursesByVertical();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
              <p className="text-gray-600">Welcome back, {student.first_name}!</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/progress-report"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
              >
                Progress Report
              </Link>
              <button
                onClick={handleLogout}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition duration-300"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
            {error}
          </div>
        )}

        {/* Student Info Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Roll Number</h3>
              <p className="text-lg font-semibold text-gray-900">{student.roll_number}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Current Semester</h3>
              <p className="text-lg font-semibold text-gray-900">{student.semester}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total Credits</h3>
              <p className="text-lg font-semibold text-green-600">{getTotalCredits()}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Courses Completed</h3>
              <p className="text-lg font-semibold text-blue-600">{completedCourses.length}</p>
            </div>
          </div>
        </div>

        {/* Courses by Vertical */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Available Courses - Semester {student.semester}</h2>
          
          {Object.keys(groupedCourses).length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-500">No courses available for your current semester.</p>
            </div>
          ) : (
            Object.entries(groupedCourses).map(([vertical, verticalCourses]) => (
              <div key={vertical} className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">{vertical}</h3>
                  <p className="text-sm text-gray-600">{verticalCourses.length} course(s)</p>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {verticalCourses.map((course) => (
                      <div
                        key={course.id}
                        className={`border rounded-lg p-4 ${
                          isCourseCompleted(course.id)
                            ? 'border-green-300 bg-green-50'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-gray-900">{course.course_code}</h4>
                          {isCourseCompleted(course.id) && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Completed
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{course.title}</p>
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>{course.type}</span>
                          <span>{course.credits} credits</span>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          <span>{course.basket}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/progress-report"
              className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition duration-300"
            >
              <span className="text-sm font-medium text-gray-700">View Progress Report</span>
            </Link>
            <Link
              href="/select-semester"
              className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition duration-300"
            >
              <span className="text-sm font-medium text-gray-700">Change Semester</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center px-4 py-3 border border-red-300 rounded-md hover:bg-red-50 transition duration-300"
            >
              <span className="text-sm font-medium text-red-700">Logout</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
