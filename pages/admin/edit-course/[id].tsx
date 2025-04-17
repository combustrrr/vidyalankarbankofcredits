import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { supabase } from '../../../utils/supabase';
import { Database } from '../../../types/supabase';
import { 
  getVerticals, 
  getBasketsForVertical, 
  getVerticalCode, 
  getBasketCode, 
  getRecommendedCredits
} from '../../../config';

type Course = Database['public']['Tables']['courses']['Row'];

const EditCourse: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [course, setCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    courseCode: '',
    title: '',
    type: '',
    creditValue: '',
    semester: '',
    vertical: '',
    basket: '',
    degree: 'B.Tech', // Pre-filled
    branch: 'INFT',   // Pre-filled
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [verticals, setVerticals] = useState<string[]>([]);
  const [availableBaskets, setAvailableBaskets] = useState<string[]>([]);

  const router = useRouter();
  const { id } = router.query;
  const { isAdminAuthenticated, logout } = useAdminAuth();

  // Load verticals from config on initial render
  useEffect(() => {
    setVerticals(getVerticals());
  }, []);
  
  // Update available baskets when vertical changes
  useEffect(() => {
    if (formData.vertical) {
      setAvailableBaskets(getBasketsForVertical(formData.vertical));
    } else {
      setAvailableBaskets([]);
    }
  }, [formData.vertical]);

  // Enhanced authentication check
  useEffect(() => {
    if (!isAdminAuthenticated) {
      router.replace('/admin-auth');
    } else if (id) {
      fetchCourse(id as string);
    }
  }, [isAdminAuthenticated, router, id]);

  const fetchCourse = async (courseId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (error) throw error;
      
      if (data) {
        setCourse(data);
        setFormData({
          courseCode: data.course_code,
          title: data.title,
          type: data.type,
          creditValue: data.credits.toString(),
          semester: data.semester.toString(),
          degree: data.degree,
          branch: data.branch,
          vertical: data.vertical,
          basket: data.basket,
        });
      } else {
        setError('Course not found');
      }
    } catch (err: any) {
      setError('Error loading course: ' + err.message);
      console.error('Error fetching course:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for the field being changed
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Check for empty fields
    Object.entries(formData).forEach(([key, value]) => {
      // Skip validation for degree and branch as they are pre-filled
      if (key !== 'degree' && key !== 'branch' && value.trim() === '') {
        newErrors[key] = 'This field is required';
      }
    });
    
    // Validate credit value is a number
    if (formData.creditValue && !/^\d+$/.test(formData.creditValue)) {
      newErrors.creditValue = 'Credit Value must be a number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !course) {
      return;
    }
    
    setSubmitting(true);
    setError('');
    setConfirmation('');
    
    try {
      const { error } = await supabase
        .from('courses')
        .update({
          course_code: formData.courseCode,
          title: formData.title,
          type: formData.type as 'Theory' | 'Practical',
          credits: parseInt(formData.creditValue, 10),
          semester: parseInt(formData.semester, 10),
          degree: formData.degree,
          branch: formData.branch,
          vertical: formData.vertical,
          basket: formData.basket
        })
        .eq('id', course.id);

      if (error) throw error;
      
      setConfirmation('Course updated successfully');
      
      // Redirect after a delay
      setTimeout(() => {
        router.push('/admin/manage-courses');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating the course. Please try again.');
      console.error('Error updating course:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Don't render the actual content until we're sure user is authenticated
  if (!isAdminAuthenticated) {
    return null; // Or a loading indicator
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Edit Course</h2>
          <div className="flex gap-2">
            <button
              onClick={() => router.push('/admin/manage-courses')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm transition duration-300"
            >
              Back to Courses
            </button>
            <button
              onClick={logout}
              className="text-red-600 hover:text-red-700 text-sm"
            >
              Logout
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
            <span className="ml-3">Loading course data...</span>
          </div>
        ) : error && !course ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            <p>{error}</p>
            <button
              onClick={() => router.push('/admin/manage-courses')}
              className="mt-2 text-sm text-indigo-600 hover:text-indigo-800"
            >
              Return to course list
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Course Code */}
              <div>
                <label htmlFor="courseCode" className="block text-sm font-medium text-gray-700">
                  Course Code
                </label>
                <input
                  type="text"
                  id="courseCode"
                  name="courseCode"
                  value={formData.courseCode}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 bg-white border ${
                    errors.courseCode ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                />
                {errors.courseCode && (
                  <p className="mt-1 text-sm text-red-500">{errors.courseCode}</p>
                )}
              </div>
              
              {/* Course Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Course Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 bg-white border ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-500">{errors.title}</p>
                )}
              </div>
              
              {/* Course Type */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                  Course Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 bg-white border ${
                    errors.type ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                >
                  <option value="" disabled>Select Course Type</option>
                  <option value="Theory">Theory</option>
                  <option value="Practical">Practical</option>
                </select>
                {errors.type && (
                  <p className="mt-1 text-sm text-red-500">{errors.type}</p>
                )}
              </div>
              
              {/* Credit Value */}
              <div>
                <label htmlFor="creditValue" className="block text-sm font-medium text-gray-700">
                  Credit Value
                </label>
                <input
                  type="number"
                  id="creditValue"
                  name="creditValue"
                  min="1"
                  value={formData.creditValue}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 bg-white border ${
                    errors.creditValue ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                />
                {errors.creditValue && (
                  <p className="mt-1 text-sm text-red-500">{errors.creditValue}</p>
                )}
              </div>
              
              {/* Semester */}
              <div>
                <label htmlFor="semester" className="block text-sm font-medium text-gray-700">
                  Semester
                </label>
                <select
                  id="semester"
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 bg-white border ${
                    errors.semester ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                >
                  <option value="" disabled>Select Semester</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
                {errors.semester && (
                  <p className="mt-1 text-sm text-red-500">{errors.semester}</p>
                )}
              </div>
              
              {/* Degree (pre-filled) */}
              <div>
                <label htmlFor="degree" className="block text-sm font-medium text-gray-700">
                  Degree
                </label>
                <input
                  type="text"
                  id="degree"
                  name="degree"
                  value={formData.degree}
                  disabled
                  className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm sm:text-sm cursor-not-allowed"
                />
              </div>
              
              {/* Branch (pre-filled) */}
              <div>
                <label htmlFor="branch" className="block text-sm font-medium text-gray-700">
                  Branch
                </label>
                <input
                  type="text"
                  id="branch"
                  name="branch"
                  value={formData.branch}
                  disabled
                  className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm sm:text-sm cursor-not-allowed"
                />
              </div>
              
              {/* Vertical */}
              <div>
                <label htmlFor="vertical" className="block text-sm font-medium text-gray-700">
                  Vertical
                </label>
                <select
                  id="vertical"
                  name="vertical"
                  value={formData.vertical}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 bg-white border ${
                    errors.vertical ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                >
                  <option value="" disabled>Select Vertical</option>
                  {verticals.map(vertical => (
                    <option key={vertical} value={vertical}>
                      {vertical}
                    </option>
                  ))}
                </select>
                {errors.vertical && (
                  <p className="mt-1 text-sm text-red-500">{errors.vertical}</p>
                )}
              </div>
              
              {/* Basket */}
              <div>
                <label htmlFor="basket" className="block text-sm font-medium text-gray-700">
                  Basket
                </label>
                <select
                  id="basket"
                  name="basket"
                  value={formData.basket}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 bg-white border ${
                    errors.basket ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  disabled={!formData.vertical}
                >
                  <option value="" disabled>Select Basket</option>
                  {availableBaskets.map(basket => (
                    <option key={basket} value={basket}>
                      {basket}
                    </option>
                  ))}
                </select>
                {!formData.vertical && (
                  <p className="mt-1 text-xs text-gray-500">Please select a vertical first</p>
                )}
                {errors.basket && (
                  <p className="mt-1 text-sm text-red-500">{errors.basket}</p>
                )}
              </div>
            </div>
            
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {confirmation && <p className="text-green-500 text-sm">{confirmation}</p>}
            
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-300 disabled:opacity-70"
                disabled={submitting}
              >
                {submitting ? 'Updating...' : 'Update Course'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/admin/manage-courses')}
                className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition duration-300"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditCourse;