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

  // Protect this route
  useEffect(() => {
    if (!isStudentAuthenticated) {
      router.replace('/');
    } else if (student?.semester !== null) {
      router.replace('/dashboard');
    }
  }, [isStudentAuthenticated, student, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSemester) {
      setError('Please select a semester');
      return;
    }

    if (!student?.id) {
      setError('Student ID is missing');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Update the student's semester in the database
      const { data, error: updateError } = await supabase
        .from('students')
        .update({ semester: parseInt(selectedSemester, 10) })
        .eq('id', student.id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Update the local student state
      if (data) {
        setStudent({ ...student!, semester: data.semester });
      }

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to update semester');
    } finally {
      setIsSubmitting(false);
    }
  };

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