import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useStudentAuth } from '../context/StudentAuthContext';
import { studentApi } from '../utils/api';
import { StudentRegistrationData } from '../types';
import Link from 'next/link';

const SignUp: React.FC = () => {
  const [formData, setFormData] = useState({
    roll_number: '',
    password: '',
    confirm_password: '',
    first_name: '',
    last_name: '',
    full_name: '',
    legal_name: '',
    degree: 'B.Tech', // Default value
    branch: 'INFT',   // Default value
    division: ''
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { isStudentAuthenticated, setIsStudentAuthenticated, setStudent } = useStudentAuth();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isStudentAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isStudentAuthenticated, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Auto-generate full name when first name or last name changes
    if (name === 'first_name' || name === 'last_name') {
      const firstName = name === 'first_name' ? value : formData.first_name;
      const lastName = name === 'last_name' ? value : formData.last_name;
      
      if (firstName && lastName) {
        setFormData(prev => ({
          ...prev,
          full_name: `${firstName} ${lastName}`
        }));
      }
    }
  };

  const validateForm = () => {
    // Check if all required fields are filled
    for (const [key, value] of Object.entries(formData)) {
      if (!value && key !== 'confirm_password') {
        setError(`Please fill in the ${key.replace('_', ' ')}`);
        return false;
      }
    }

    // Check if passwords match
    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      return false;
    }

    // Check if password meets minimum requirements
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Extract data for API call (omitting confirm_password)
      const { confirm_password, ...registrationData } = formData;
      
      const response = await studentApi.register(registrationData as StudentRegistrationData);

      setSuccess('Account created successfully! Redirecting to dashboard...');
      
      // Store the JWT token in localStorage
      if (response.token) {
        localStorage.setItem('studentToken', response.token);
      }
      
      // Set authentication state with the semester property set to null for new students
      setIsStudentAuthenticated(true);
      setStudent({
        ...response.student,
        semester: null // New students start with null semester until they select one
      });
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'An error occurred during signup');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="bg-indigo-600 p-6">
          <h2 className="text-white text-2xl font-bold text-center">Student Registration</h2>
        </div>
        <div className="p-6">
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
              <p>{error}</p>
            </div>
          )}
          {success && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert">
              <p>{success}</p>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="roll_number" className="block text-sm font-medium text-gray-700">
                  Roll Number*
                </label>
                <input
                  type="text"
                  id="roll_number"
                  name="roll_number"
                  value={formData.roll_number}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                    First Name*
                  </label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                    Last Name*
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                  Full Name*
                </label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label htmlFor="legal_name" className="block text-sm font-medium text-gray-700">
                  Legal Name (as on Aadhar card)*
                </label>
                <input
                  type="text"
                  id="legal_name"
                  name="legal_name"
                  value={formData.legal_name}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="degree" className="block text-sm font-medium text-gray-700">
                    Degree*
                  </label>
                  <select
                    id="degree"
                    name="degree"
                    value={formData.degree}
                    onChange={handleChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-100"
                    disabled
                  >
                    <option value="B.Tech">B.Tech</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="branch" className="block text-sm font-medium text-gray-700">
                    Branch*
                  </label>
                  <select
                    id="branch"
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-100"
                    disabled
                  >
                    <option value="INFT">INFT</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="division" className="block text-sm font-medium text-gray-700">
                  Division*
                </label>
                <select
                  id="division"
                  name="division"
                  value={formData.division}
                  onChange={handleChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                >
                  <option value="">Select Division</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </select>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password*
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">
                  Confirm Password*
                </label>
                <input
                  type="password"
                  id="confirm_password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Sign Up'
                  )}
                </button>
              </div>
            </div>

            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;