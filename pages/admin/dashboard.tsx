import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { courseApi } from '../../utils/api';
import { Course } from '../../types';

const AdminDashboard: React.FC = () => {
  const { isAdminAuthenticated } = useAdminAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdminAuthenticated) {
      router.push('/admin-auth');
    }
  }, [isAdminAuthenticated, router]);

  useEffect(() => {
    // Fetch courses when component mounts
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
  }, []);

  const handleCreateCourseClick = () => {
    router.push('/admin/create-course');
  };

  return (
    <div className="min-h-screen flex flex-col items-center pt-10 bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold">Admin Dashboard</h1>
          <button
            onClick={handleCreateCourseClick}
            className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-300"
          >
            Create a Course
          </button>
        </div>
        
        <p className="text-gray-600 mb-6">Welcome to the admin dashboard. Here you can manage courses and users.</p>
        
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Courses</h2>
          {loading ? (
            <p className="text-gray-500">Loading courses...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : courses.length === 0 ? (
            <p className="text-gray-500">No courses available. Create your first course!</p>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {courses.map((course) => (
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
      </div>
    </div>
  );
};

export default AdminDashboard;
