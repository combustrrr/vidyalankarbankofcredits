import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useStudentAuth } from '../context/StudentAuthContext';
import { supabase } from '../utils/supabase';

const SelectSemester: React.FC = () => {
  const router = useRouter();
  const { isStudentAuthenticated, student, setStudent } = useStudentAuth();
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Protect this route and ensure we have student data with ID
  useEffect(() => {
    if (!isStudentAuthenticated) {
      router.replace('/login');
      return;
    }
    
    if (!student || !student.id) {
      setError('Student authentication data is missing. Please try logging in again.');
      setTimeout(() => router.replace('/login'), 3000);
      return;
    }
    
    if (student.semester !== null && student.semester !== undefined) {
      // If semester is already set, redirect to dashboard
      // This prevents users from changing their semester once set
      router.replace('/dashboard');
    }
  }, [isStudentAuthenticated, student, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSemester) {
      setError('Please select a semester');
      return;
    }

    const semesterNumber = parseInt(selectedSemester, 10);
    // Validate semester range
    if (semesterNumber < 1 || semesterNumber > 8) {
      setError('Invalid semester selected. Please choose between 1 and 8.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Ensure we have student data with ID
      if (!student || !student.id) {
        throw new Error('Student authentication data is missing. Please try logging in again.');
      }

      // Double check that semester hasn't been set yet
      const { data: currentStudent, error: fetchError } = await supabase
        .from('students')
        .select('semester')
        .eq('id', student.id)
        .single();

      if (fetchError) {
        throw new Error('Failed to verify student data. Please try again.');
      }

      if (currentStudent?.semester !== null && currentStudent?.semester !== undefined) {
        throw new Error('Semester has already been set and cannot be changed.');
      }

      // Update the student's semester in the database
      const { data, error: updateError } = await supabase
        .from('students')
        .update({ semester: semesterNumber })
        .eq('id', student.id)
        .is('semester', null) // Only update if semester is null
        .select()
        .single();

      if (updateError) throw updateError;

      // Update the local student state with all existing data plus new semester
      if (data) {
        setStudent({ ...student, semester: data.semester });
        // Redirect to dashboard after successful update
        router.push('/dashboard');
      } else {
        throw new Error('Failed to update semester. No data returned.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update semester');
      console.error('Error updating semester:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't render anything if not authenticated or no student data
  if (!isStudentAuthenticated || !student) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-indigo-600 px-4 py-5 sm:px-6">
          <h2 className="text-xl font-bold text-white text-center">Select Your Semester</h2>
        </div>
        
        <div className="px-4 py-5 sm:p-6">
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
              <p>{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="semester" className="block text-sm font-medium text-gray-700">
                Current Semester
              </label>
              <select
                id="semester"
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                required
              >
                <option value="">Select Semester</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <option key={num} value={num}>
                    Semester {num}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {isSubmitting ? 'Saving...' : 'Continue to Dashboard'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SelectSemester;