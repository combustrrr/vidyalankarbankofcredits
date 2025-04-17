import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { courseApi, programStructureApi } from '../../utils/supabase';
import { ProgramStructure } from '../../utils/supabase';
import { 
  getVerticals, 
  getBasketsForVertical, 
  getVerticalCode, 
  getBasketCode, 
  getRecommendedCredits,
  canAdminCreateVertical 
} from '../../config';
import { supabase } from '../../utils/supabase'; // Import supabase client

const CreateCourse: React.FC = () => {
  const [formData, setFormData] = useState({
    courseCode: '',
    courseTitle: '',
    courseType: '',
    creditValue: '',
    semester: '',
    degree: 'B.Tech', // Pre-filled
    branch: 'INFT',   // Pre-filled
    vertical: '',
    basket: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [creditWarning, setCreditWarning] = useState<string>('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useAutoGenCode, setUseAutoGenCode] = useState(true);
  const [suggestedCode, setSuggestedCode] = useState('');
  const [recommendedCredit, setRecommendedCredit] = useState<number | null>(null);
  const [isLoadingRecommendation, setIsLoadingRecommendation] = useState(false);
  const [programStructures, setProgramStructures] = useState<ProgramStructure[]>([]);
  const [isLoadingStructures, setIsLoadingStructures] = useState(true);
  const [verticals, setVerticals] = useState<string[]>([]);
  const [availableBaskets, setAvailableBaskets] = useState<string[]>([]);
  
  const router = useRouter();
  const { isAdminAuthenticated, logout } = useAdminAuth();

  // Load verticals from config on initial render
  useEffect(() => {
    setVerticals(getVerticals());
  }, []);
  
  // Update available baskets when vertical changes
  useEffect(() => {
    if (formData.vertical) {
      setAvailableBaskets(getBasketsForVertical(formData.vertical));
      // Clear basket selection when vertical changes
      if (formData.basket && !getBasketsForVertical(formData.vertical).includes(formData.basket)) {
        setFormData(prev => ({
          ...prev,
          basket: ''
        }));
      }
    } else {
      setAvailableBaskets([]);
    }
  }, [formData.vertical]);

  // Load all program structures
  useEffect(() => {
    const fetchProgramStructures = async () => {
      if (isAdminAuthenticated) {
        try {
          setIsLoadingStructures(true);
          const data = await programStructureApi.getAll();
          setProgramStructures(data);
        } catch (err) {
          console.error('Error loading program structures:', err);
        } finally {
          setIsLoadingStructures(false);
        }
      }
    };

    fetchProgramStructures();
  }, [isAdminAuthenticated]);

  // Helper function to generate course code
  const generateCourseCode = (vertical: string, semester: string, courseType: string): string => {
    if (!vertical || !semester || !courseType) return '';
    
    // Get subject area code from vertical using the config helper
    const subjectCode = getVerticalCode(vertical);
    
    // Format semester as 2 digits
    const semesterCode = semester.padStart(2, '0');
    
    // Get course type suffix
    const typeSuffix = courseType === 'Theory' ? 'T' : 'P';
    
    return `${subjectCode}${semesterCode}${typeSuffix}`;
  };

  // Generate suggested code when form fields change
  useEffect(() => {
    const newCode = generateCourseCode(formData.vertical, formData.semester, formData.courseType);
    setSuggestedCode(newCode);
    
    // Update course code if auto-generation is enabled
    if (useAutoGenCode && newCode) {
      setFormData(prev => ({
        ...prev,
        courseCode: newCode
      }));
    }
  }, [formData.vertical, formData.semester, formData.courseType, useAutoGenCode]);

  // Fetch recommended credits from config when vertical and semester change
  useEffect(() => {
    const fetchRecommendedCredits = async () => {
      if (formData.vertical && formData.semester) {
        try {
          setIsLoadingRecommendation(true);
          setCreditWarning('');
          setRecommendedCredit(null);
          
          const semester = parseInt(formData.semester, 10);
          // Use the config helper to get recommended credits
          const recommendedCredits = getRecommendedCredits(formData.vertical, semester);
          
          setRecommendedCredit(recommendedCredits);
          
          // Check if entered credits exceed recommendation
          if (formData.creditValue && recommendedCredits > 0) {
            const enteredCredits = parseInt(formData.creditValue, 10);
            if (enteredCredits > recommendedCredits) {
              setCreditWarning(
                `This exceeds the recommended ${recommendedCredits} credits for Semester ${semester} in ${formData.vertical}.`
              );
            }
          }
        } catch (err) {
          console.error('Error fetching recommended credits:', err);
        } finally {
          setIsLoadingRecommendation(false);
        }
      }
    };

    fetchRecommendedCredits();
  }, [formData.vertical, formData.semester, formData.creditValue]);

  // Enhanced authentication check
  useEffect(() => {
    if (!isAdminAuthenticated) {
      router.replace('/admin-auth');
    }
  }, [isAdminAuthenticated, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Special handling for course code
    if (name === 'courseCode') {
      // If manually editing the course code, disable auto-generation
      if (useAutoGenCode) {
        setUseAutoGenCode(false);
      }
    }
    
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

  // Toggle auto-generation of course code
  const handleAutoGenToggle = () => {
    const newState = !useAutoGenCode;
    setUseAutoGenCode(newState);
    
    // Apply suggested code if enabling auto-generation
    if (newState && suggestedCode) {
      setFormData(prev => ({
        ...prev,
        courseCode: suggestedCode
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Check for empty fields
    Object.entries(formData).forEach(([key, value]) => {
      if (value.trim() === '') {
        newErrors[key] = 'This field is required';
      }
    });
    
    // Validate credit value is a number
    if (formData.creditValue && !/^\d+$/.test(formData.creditValue)) {
      newErrors.creditValue = 'Credit Value must be a number';
    }

    // Validate that the course's semester is not greater than the student's selected semester
    if (formData.semester && parseInt(formData.semester, 10) > 8) {
      newErrors.semester = 'Course semester cannot be greater than the student\'s selected semester';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // Use Supabase to create a new course - the structure_id will be linked automatically
      const { data: createdCourse, error: createError } = await supabase
        .from('courses')
        .insert({
          course_code: formData.courseCode,
          title: formData.courseTitle,
          type: formData.courseType,
          credits: parseInt(formData.creditValue, 10),
          semester: parseInt(formData.semester, 10),
          degree: formData.degree,
          branch: formData.branch,
          vertical: formData.vertical,
          basket: formData.basket
        })
        .single();

      if (createError) {
        throw createError;
      }

      setConfirmation('Course created successfully');

      // Reset form
      setFormData({
        courseCode: '',
        courseTitle: '',
        courseType: '',
        creditValue: '',
        semester: '',
        degree: 'B.Tech',
        branch: 'INFT',
        vertical: '',
        basket: ''
      });

      // Redirect after a delay
      setTimeout(() => {
        router.push('/admin/dashboard');
      }, 2000);
    } catch (err: any) {
      // Handle Supabase error
      setError(err.message || 'An error occurred while creating the course. Please try again.');
      console.error('Error creating course:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/admin-auth');
  };

  // Don't render the actual content until we're sure user is authenticated
  if (!isAdminAuthenticated) {
    return null; // Or a loading indicator
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Create a Course</h2>
          <button
            onClick={handleLogout}
            className="text-red-600 hover:text-red-700 text-sm"
          >
            Logout
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Vertical - Moved up to help with auto-generating code */}
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
                disabled={isLoadingStructures}
              >
                <option value="" disabled>Select Vertical</option>
                {isLoadingStructures ? (
                  <option value="" disabled>Loading verticals...</option>
                ) : (
                  verticals.map((vertical) => (
                    <option key={vertical} value={vertical}>
                      {vertical}
                    </option>
                  ))
                )}
              </select>
              {errors.vertical && (
                <p className="mt-1 text-sm text-red-500">{errors.vertical}</p>
              )}
            </div>
            
            {/* Course Type */}
            <div>
              <label htmlFor="courseType" className="block text-sm font-medium text-gray-700">
                Course Type
              </label>
              <select
                id="courseType"
                name="courseType"
                value={formData.courseType}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 bg-white border ${
                  errors.courseType ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              >
                <option value="" disabled>Select Course Type</option>
                <option value="Theory">Theory</option>
                <option value="Practical">Practical</option>
              </select>
              {errors.courseType && (
                <p className="mt-1 text-sm text-red-500">{errors.courseType}</p>
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
            
            {/* Auto-generated Course Code */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="courseCode" className="block text-sm font-medium text-gray-700">
                  Course Code
                </label>
                <div className="flex items-center">
                  <input
                    id="autoGenCheck"
                    type="checkbox"
                    checked={useAutoGenCode}
                    onChange={handleAutoGenToggle}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded"
                  />
                  <label htmlFor="autoGenCheck" className="ml-2 text-sm text-gray-600">
                    Auto-generate
                  </label>
                </div>
              </div>
              
              <div className="relative">
                <input
                  type="text"
                  id="courseCode"
                  name="courseCode"
                  value={formData.courseCode}
                  onChange={handleChange}
                  readOnly={useAutoGenCode}
                  className={`mt-1 block w-full px-3 py-2 ${
                    useAutoGenCode ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                  } border ${
                    errors.courseCode ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                />
                {!useAutoGenCode && suggestedCode && (
                  <div className="mt-1 flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      Suggested code: <code className="bg-gray-100 px-1 py-0.5 rounded">{suggestedCode}</code>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, courseCode: suggestedCode }));
                      }}
                      className="text-xs text-indigo-600 hover:text-indigo-800"
                    >
                      Use suggested
                    </button>
                  </div>
                )}
              </div>
              
              {errors.courseCode && (
                <p className="mt-1 text-sm text-red-500">{errors.courseCode}</p>
              )}
            </div>
            
            {/* Course Title */}
            <div className="col-span-1 md:col-span-2">
              <label htmlFor="courseTitle" className="block text-sm font-medium text-gray-700">
                Course Title
              </label>
              <input
                type="text"
                id="courseTitle"
                name="courseTitle"
                value={formData.courseTitle}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 bg-white border ${
                  errors.courseTitle ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              />
              {errors.courseTitle && (
                <p className="mt-1 text-sm text-red-500">{errors.courseTitle}</p>
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
                  errors.creditValue ? 'border-red-500' : creditWarning ? 'border-yellow-400' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              />
              {errors.creditValue && (
                <p className="mt-1 text-sm text-red-500">{errors.creditValue}</p>
              )}
              {isLoadingRecommendation ? (
                <p className="mt-1 text-sm text-gray-500">Loading recommendations...</p>
              ) : recommendedCredit !== null && (
                <p className="mt-1 text-sm text-gray-600">
                  Recommended: <span className="font-medium">{recommendedCredit} credits</span> for this vertical and semester
                </p>
              )}
              {creditWarning && (
                <p className="mt-1 text-sm text-yellow-600 bg-yellow-50 px-2 py-1 rounded border border-yellow-200">
                  ⚠️ {creditWarning}
                </p>
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
          </div>

          {/* Help text for course code format */}
          <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-700 border border-blue-100">
            <h4 className="font-medium mb-1">Course Code Format</h4>
            <p>The code is auto-generated using this pattern: <code className="bg-blue-100 px-1 py-0.5 rounded">AREA + SEMESTER + TYPE</code></p>
            <p className="mt-1">Example: <code className="bg-blue-100 px-1 py-0.5 rounded">BSC04T</code> = Basic Science, Semester 4, Theory</p>
          </div>
          
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {confirmation && <p className="text-green-500 text-sm">{confirmation}</p>}
          
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-300 disabled:opacity-70"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Course'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/dashboard')}
              className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition duration-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCourse;
