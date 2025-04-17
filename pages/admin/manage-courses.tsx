import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { supabase } from '../../utils/supabase';
import { Database } from '../../types/supabase';
import { getVerticals, programStructure } from '../../config';

type Course = Database['public']['Tables']['courses']['Row'];

// Define filter state type
type FilterState = {
  searchQuery: string;
  courseType: '' | 'Theory' | 'Practical';
  semester: string;
  vertical: string;
  basket: string;
  degree: string;
  branch: string;
};

// Simple debounce function to prevent too many requests
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const ManageCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    courseType: '',
    semester: '',
    vertical: '',
    basket: '',
    degree: '',
    branch: '',
  });
  
  // Use debounced filters to prevent too many queries
  const debouncedFilters = useDebounce(filters, 300);

  const router = useRouter();
  const { isAdminAuthenticated, logout } = useAdminAuth();

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('courses')
        .select('*');
      
      // Apply filters to the query
      if (debouncedFilters.searchQuery) {
        query = query.or(`course_code.ilike.%${debouncedFilters.searchQuery}%,title.ilike.%${debouncedFilters.searchQuery}%`);
      }
      
      if (debouncedFilters.courseType) {
        query = query.eq('type', debouncedFilters.courseType);
      }
      
      if (debouncedFilters.semester) {
        query = query.eq('semester', parseInt(debouncedFilters.semester));
      }
      
      if (debouncedFilters.vertical) {
        query = query.eq('vertical', debouncedFilters.vertical);
      }
      
      if (debouncedFilters.basket) {
        query = query.eq('basket', debouncedFilters.basket);
      }
      
      if (debouncedFilters.degree) {
        query = query.eq('degree', debouncedFilters.degree);
      }
      
      if (debouncedFilters.branch) {
        query = query.eq('branch', debouncedFilters.branch);
      }

      // Order the results
      query = query.order('course_code', { ascending: true });

      const { data, error } = await query;

      if (error) throw error;
      setCourses(data || []);
    } catch (err: any) {
      setError('Error loading courses: ' + err.message);
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  }, [debouncedFilters]);

  // Enhanced authentication check
  useEffect(() => {
    if (!isAdminAuthenticated) {
      router.replace('/admin-auth');
    } else {
      fetchCourses();
    }
  }, [isAdminAuthenticated, router, fetchCourses]);

  const handleDeleteClick = (course: Course) => {
    setCourseToDelete(course);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;
    
    try {
      setLoading(true);
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseToDelete.id);

      if (error) throw error;
      
      // Refresh the course list
      fetchCourses();
      setIsDeleteModalOpen(false);
      setCourseToDelete(null);
    } catch (err: any) {
      setError('Error deleting course: ' + err.message);
      console.error('Error deleting course:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditCourse = (course: Course) => {
    router.push(`/admin/edit-course/${course.id}`);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // No need to filter courses again since we're already filtering in the database query
  const filteredCourses = courses;

  // Don't render the actual content until we're sure user is authenticated
  if (!isAdminAuthenticated) {
    return null; // Or a loading indicator
  }

  // Get values from config instead of relying on existing courses
  const configVerticals = programStructure.map(vertical => vertical.name);
  
  // Get all baskets from all verticals
  const configBaskets: string[] = [];
  programStructure.forEach(vertical => {
    vertical.baskets.forEach(basket => {
      if (!configBaskets.includes(basket.name)) {
        configBaskets.push(basket.name);
      }
    });
  });
  
  // Create a list of semesters 1-8
  const configSemesters = Array.from({ length: 8 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Manage Courses</h1>
          <div className="flex gap-2">
            <button
              onClick={() => router.push('/admin/create-course')}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm transition duration-300"
            >
              Add New Course
            </button>
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm transition duration-300"
            >
              Back to Dashboard
            </button>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm transition duration-300"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <h2 className="text-lg font-semibold mb-3">Filter Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <label htmlFor="searchQuery" className="block text-sm font-medium text-gray-700">Search</label>
              <input
                type="text"
                id="searchQuery"
                name="searchQuery"
                placeholder="Search by code or title..."
                value={filters.searchQuery}
                onChange={handleFilterChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="courseType" className="block text-sm font-medium text-gray-700">Course Type</label>
              <select
                id="courseType"
                name="courseType"
                value={filters.courseType}
                onChange={handleFilterChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">All Types</option>
                <option value="Theory">Theory</option>
                <option value="Practical">Practical</option>
              </select>
            </div>
            <div>
              <label htmlFor="semester" className="block text-sm font-medium text-gray-700">Semester</label>
              <select
                id="semester"
                name="semester"
                value={filters.semester}
                onChange={handleFilterChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">All Semesters</option>
                {configSemesters.map((semester) => (
                  <option key={semester} value={semester}>{semester}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="vertical" className="block text-sm font-medium text-gray-700">Vertical</label>
              <select
                id="vertical"
                name="vertical"
                value={filters.vertical}
                onChange={handleFilterChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">All Verticals</option>
                {configVerticals.map((vertical) => (
                  <option key={vertical} value={vertical}>{vertical}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="basket" className="block text-sm font-medium text-gray-700">Basket</label>
              <select
                id="basket"
                name="basket"
                value={filters.basket}
                onChange={handleFilterChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">All Baskets</option>
                {configBaskets.map((basket) => (
                  <option key={basket} value={basket}>{basket}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="degree" className="block text-sm font-medium text-gray-700">Degree</label>
              <select
                id="degree"
                name="degree"
                value={filters.degree}
                onChange={handleFilterChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">All Degrees</option>
                <option value="BTech">BTech</option>
              </select>
            </div>
            <div>
              <label htmlFor="branch" className="block text-sm font-medium text-gray-700">Branch</label>
              <select
                id="branch"
                name="branch"
                value={filters.branch}
                onChange={handleFilterChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">All Branches</option>
                <option value="INFT">INFT</option>
              </select>
            </div>
            <div className="md:col-span-3 lg:col-span-5">
              <button 
                onClick={() => setFilters({
                  searchQuery: '',
                  courseType: '',
                  semester: '',
                  vertical: '',
                  basket: '',
                  degree: '',
                  branch: '',
                })}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                Clear all filters
              </button>
            </div>
          </div>
        </div>

        {/* Course List Table */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
              <p>{error}</p>
            </div>
          )}
          
          {loading && !courses.length ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600 mb-2"></div>
              <p>Loading courses...</p>
            </div>
          ) : (
            <>
              {filteredCourses.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p>No courses found matching your filters.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Course Code
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Credits
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Semester
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Vertical
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Basket
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredCourses.map((course) => (
                        <tr key={course.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {course.course_code}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {course.title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              course.type === 'Theory' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {course.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {course.credits}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {course.semester}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {course.vertical}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {course.basket}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleEditCourse(course)}
                              className="text-indigo-600 hover:text-indigo-900 mr-4"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteClick(course)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p className="mb-6">
              Are you sure you want to delete the course <span className="font-semibold">{courseToDelete?.course_code}</span> - {courseToDelete?.title}? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCourse}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCourses;