import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { courseApi } from '../../utils/api';
import { Course } from '../../types';

const AdminDashboard: React.FC = () => {
  const { isAdminAuthenticated, logout } = useAdminAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Enhanced authentication check using the updated context
  useEffect(() => {
    // Check authentication status immediately on component mount
    if (!isAdminAuthenticated) {
      router.replace('/admin-auth');
    }
  }, [isAdminAuthenticated, router]);

  useEffect(() => {
    // Only fetch courses if authenticated
    if (isAdminAuthenticated) {
      const fetchCourses = async () => {
        try {
          const coursesData = await courseApi.getAll();
          setCourses(coursesData);
        } catch (err) {
          console.error('Error fetching courses:', err);
          setError('Failed to load courses. Please try again.');
        } finally {
          setLoading(false);
        }
      };

      fetchCourses();
    }
  }, [isAdminAuthenticated]);

  const handleCreateCourseClick = () => {
    router.push('/admin/create-course');
  };

  const handleManageCoursesClick = () => {
    router.push('/admin/manage-courses');
  };

  const handleLogout = () => {
    logout();
    router.push('/admin-auth');
  };

  // Don't render the actual dashboard content until we're sure user is authenticated
  if (!isAdminAuthenticated) {
    return null; // Or a loading indicator
  }

  return (
    <div className="min-h-screen flex flex-col items-center pt-10 bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold">Admin Dashboard</h1>
          <div className="space-x-2">
            <button
              onClick={handleCreateCourseClick}
              className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-300"
            >
              Create Course
            </button>
            <button
              onClick={handleManageCoursesClick}
              className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-300"
            >
              Manage Courses
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition duration-300"
            >
              Logout
            </button>
          </div>
        </div>
        
        <p className="text-gray-600 mb-6">Welcome to the admin dashboard. Here you can manage courses and users.</p>
        
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Courses</h2>
            <button 
              onClick={handleManageCoursesClick}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              View All Courses
            </button>
          </div>
          
          {loading ? (
            <p className="text-gray-500">Loading courses...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : courses.length === 0 ? (
            <p className="text-gray-500">No courses available. Create your first course!</p>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {courses.slice(0, 5).map((course) => (
                <div key={course.id} className="border border-gray-200 rounded-md p-4 hover:bg-gray-50 transition-colors">
                  <h3 className="text-lg font-medium">{course.name}</h3>
                  <p className="text-gray-600 text-sm mt-1">{course.description}</p>
                  <div className="flex justify-between mt-3">
                    <span className="text-sm text-gray-500">Duration: {course.duration}</span>
                    <span className="text-sm text-gray-500">
                      Created: {new Date(course.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-medium mb-2">Course Management</h3>
            <p className="text-gray-600 text-sm mb-3">Create, edit, and manage course details.</p>
            <button
              onClick={handleManageCoursesClick}
              className="w-full bg-indigo-100 text-indigo-700 py-2 px-4 rounded-md hover:bg-indigo-200 transition duration-300 text-sm"
            >
              Manage Courses
            </button>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-medium mb-2">Add New Course</h3>
            <p className="text-gray-600 text-sm mb-3">Create a new course with detailed information.</p>
            <button
              onClick={handleCreateCourseClick}
              className="w-full bg-green-100 text-green-700 py-2 px-4 rounded-md hover:bg-green-200 transition duration-300 text-sm"
            >
              Create Course
            </button>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-medium mb-2">Account Settings</h3>
            <p className="text-gray-600 text-sm mb-3">Manage your admin account settings.</p>
            <button
              onClick={handleLogout}
              className="w-full bg-red-100 text-red-700 py-2 px-4 rounded-md hover:bg-red-200 transition duration-300 text-sm"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
