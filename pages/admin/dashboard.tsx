import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { courseApi, adminApi } from '../../utils/api';
import { Course, ApiResponse, PaginatedResult } from '../../types';
import { creditDistributionTable, verticals, baskets } from '../../config/program-structure';

interface BasketCredit {
  vertical: string;
  basket: string;
  total_credits: number;
}

const AdminDashboard: React.FC = () => {
  const { isAdminAuthenticated, logout } = useAdminAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [basketCredits, setBasketCredits] = useState<BasketCredit[]>([]);
  const [totalCredits, setTotalCredits] = useState(0);
  const [filters, setFilters] = useState({
    semester: '',
    type: '',
    vertical: '',
    basket: ''
  });

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
          setLoading(true);
          const coursesData = await courseApi.getAll();
          if (coursesData.success && coursesData.data) {
            setCourses(coursesData.data.data);
            setFilteredCourses(coursesData.data.data);
          }
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

  useEffect(() => {
    // Fetch basket credits and total credits from the API
    const fetchBasketCredits = async () => {
      try {
        const response = await adminApi.getBasketCredits();
        if (response.basketCredits && Array.isArray(response.basketCredits)) {
          setBasketCredits(response.basketCredits as BasketCredit[]);
        } else {
          console.error('Invalid basket credits format:', response);
          setError('Failed to load basket credits. Data format is invalid.');
        }
        if (response.totalCredits) {
          setTotalCredits(response.totalCredits);
        } else {
          console.error('Total credits not available in response:', response);
          // Keep previous value if we had one, or default to 0
        }
      } catch (err) {
        console.error('Error fetching basket credits:', err);
        setError('Failed to load basket credits. Please try again. Check API connection and database views.');
      }
    };

    fetchBasketCredits();
  }, []);

  // Apply filters to courses and recalculate basket credits
  useEffect(() => {
    if (courses.length > 0) {
      // Apply filters
      let filtered = [...courses];
      
      if (filters.semester) {
        filtered = filtered.filter(course => 
          course.semester === parseInt(filters.semester));
      }
      
      if (filters.type) {
        filtered = filtered.filter(course => 
          course.type === filters.type);
      }
      
      if (filters.vertical) {
        filtered = filtered.filter(course => 
          course.vertical === filters.vertical);
      }
      
      if (filters.basket) {
        filtered = filtered.filter(course => 
          course.basket === filters.basket);
      }
      
      setFilteredCourses(filtered);
    }
  }, [courses, filters]);

  // Calculate basket credits based on filtered courses
  const calculatedBasketCredits = useMemo(() => {
    if (!filteredCourses?.length) return [];
    
    // Group courses by basket and calculate total credits
    const basketMap: Record<string, BasketCredit> = {};
    
    filteredCourses.forEach(course => {
      if (!course.vertical || !course.basket) return;
      
      const key = `${course.vertical}-${course.basket}`;
      
      if (!basketMap[key]) {
        basketMap[key] = {
          vertical: course.vertical,
          basket: course.basket,
          total_credits: 0
        };
      }
      
      basketMap[key].total_credits += course.credits || 0;
    });
    
    // Convert to array for display
    return Object.values(basketMap);
  }, [filteredCourses]);
  
  // Calculate overall total credits
  const calculatedTotalCredits = useMemo(() => {
    return filteredCourses.reduce((total, course) => total + (course.credits || 0), 0);
  }, [filteredCourses]);

  const uniqueValues = useMemo(() => {
    // Extract unique values for filter dropdowns
    const semestersSet = new Set(courses.map(c => c.semester).filter(Boolean));
    const typesSet = new Set(courses.map(c => c.type).filter(Boolean));
    const verticalsSet = new Set(courses.map(c => c.vertical).filter(Boolean));
    const basketsSet = new Set(courses.map(c => c.basket).filter(Boolean));
    
    const semesters = Array.from(semestersSet).sort((a, b) => a - b);
    const types = Array.from(typesSet).sort();
    const verticals = Array.from(verticalsSet).sort();
    const baskets = Array.from(basketsSet).sort();
    
    return { semesters, types, verticals, baskets };
  }, [courses]);

  // Decide which basket credits to display: filtered or all
  const displayBasketCredits = useMemo(() => {
    // If filters are applied, show calculated credits from filtered courses
    if (Object.values(filters).some(v => v)) {
      return calculatedBasketCredits;
    }
    // Otherwise show all basket credits fetched from API
    return basketCredits.length > 0 ? basketCredits : calculatedBasketCredits;
  }, [filters, calculatedBasketCredits, basketCredits]);

  // Decide which total to display: filtered or all
  const displayTotalCredits = useMemo(() => {
    // If filters are applied, show calculated total from filtered courses
    if (Object.values(filters).some(v => v)) {
      return calculatedTotalCredits;
    }
    // Otherwise show total from API
    return totalCredits > 0 ? totalCredits : calculatedTotalCredits;
  }, [filters, calculatedTotalCredits, totalCredits]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      semester: '',
      type: '',
      vertical: '',
      basket: ''
    });
  };

  const handleCreateCourseClick = () => {
    router.push('/admin/create-course');
  };

  const handleManageCoursesClick = () => {
    router.push('/admin/manage-courses');
  };

  const handleManageStudentsClick = () => {
    router.push('/admin/students');
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
              onClick={handleManageStudentsClick}
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300"
            >
              Manage Students
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
                  <h3 className="text-lg font-medium">{course.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">{course.course_code}</p>
                  <div className="flex justify-between mt-3">
                    <span className="text-sm text-gray-500">
                      {course.credits} credits | {course.type || 'N/A'} | Semester {course.semester || 'N/A'}
                    </span>
                    <span className="text-sm text-gray-500">
                      {course.created_at ? `Created: ${new Date(course.created_at).toLocaleDateString()}` : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Basket-wise Credit Totals</h2>
          
          {/* Filters */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex flex-wrap gap-3 mb-2">
              <div className="w-full md:w-auto">
                <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                <select
                  name="semester"
                  value={filters.semester}
                  onChange={handleFilterChange}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="">All Semesters</option>
                  {uniqueValues.semesters.map(semester => (
                    <option key={semester} value={semester}>
                      Semester {semester}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="w-full md:w-auto">
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="">All Types</option>
                  {uniqueValues.types.map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="w-full md:w-auto">
                <label className="block text-sm font-medium text-gray-700 mb-1">Vertical</label>
                <select
                  name="vertical"
                  value={filters.vertical}
                  onChange={handleFilterChange}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="">All Verticals</option>
                  {uniqueValues.verticals.map(vertical => (
                    <option key={vertical} value={vertical}>
                      {vertical}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="w-full md:w-auto">
                <label className="block text-sm font-medium text-gray-700 mb-1">Basket</label>
                <select
                  name="basket"
                  value={filters.basket}
                  onChange={handleFilterChange}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="">All Baskets</option>
                  {uniqueValues.baskets.map(basket => (
                    <option key={basket} value={basket}>
                      {basket}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={clearFilters}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                Clear Filters
              </button>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center p-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="ml-2">Loading basket credits...</span>
            </div>
          ) : error && error.includes('basket credits') ? (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 mb-4">
              <p>{error}</p>
              <p className="text-sm mt-1">This typically occurs when the course query doesn't return vertical/basket data correctly or the basket metadata is not properly joined.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vertical
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Basket Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Credits
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {displayBasketCredits.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                          No basket credits available for the selected filters.
                        </td>
                      </tr>
                    ) : (
                      displayBasketCredits.map((credit, index) => (
                        <tr key={`${credit.vertical}-${credit.basket}`} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {credit.vertical || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {credit.basket || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                            {credit.total_credits || 0}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={2} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Overall Total Credits
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                        {displayTotalCredits}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <div className="text-sm text-gray-500 mb-4">
                <p>
                  {Object.values(filters).some(v => v) ? 
                    `Showing filtered credits. Total: ${displayTotalCredits} credits across ${displayBasketCredits.length} basket${displayBasketCredits.length !== 1 ? 's' : ''}.` :
                    `Showing all credits. Total: ${displayTotalCredits} credits across ${displayBasketCredits.length} basket${displayBasketCredits.length !== 1 ? 's' : ''}.`
                  }
                </p>
              </div>
            </>
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
}

export default AdminDashboard;
