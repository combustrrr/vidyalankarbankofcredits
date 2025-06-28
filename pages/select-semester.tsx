import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useStudentAuth } from '@/contexts/StudentAuthContext';

const SelectSemester: React.FC = () => {
  const router = useRouter();
  const { student, isAuthenticated, updateSemester } = useStudentAuth();
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated || !student) {
      router.replace('/login');
      return;
    }

    // If student already has a semester set, pre-select it
    if (student.semester) {
      setSelectedSemester(student.semester);
    }
  }, [isAuthenticated, student, router]);

  const handleSemesterUpdate = async () => {
    if (!student) return;

    try {
      setIsUpdating(true);
      setError('');

      const response = await fetch(`/api/students/${student.id}/semester`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ semester: selectedSemester }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update semester');
      }

      // Update the context
      await updateSemester(selectedSemester);
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      console.error('Error updating semester:', err);
      setError(err instanceof Error ? err.message : 'Failed to update semester');
    } finally {
      setIsUpdating(false);
    }
  };

  const getSemesterLabel = (semester: number) => {
    const year = Math.ceil(semester / 2);
    const term = semester % 2 === 1 ? '1st' : '2nd';
    return `Semester ${semester} (${year}${year === 1 ? 'st' : year === 2 ? 'nd' : year === 3 ? 'rd' : 'th'} Year, ${term} Term)`;
  };

  if (!isAuthenticated || !student) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
          Select Your Current Semester
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Choose your current semester to see relevant courses
        </p>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="mb-6">
          <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-2">
            Current Semester
          </label>
          <select
            id="semester"
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((semester) => (
              <option key={semester} value={semester}>
                {getSemesterLabel(semester)}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Student Information</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p><span className="font-medium">Name:</span> {student.full_name}</p>
            <p><span className="font-medium">Roll Number:</span> {student.roll_number}</p>
            <p><span className="font-medium">Degree:</span> {student.degree}</p>
            <p><span className="font-medium">Branch:</span> {student.branch}</p>
            <p><span className="font-medium">Division:</span> {student.division}</p>
          </div>
        </div>

        <button
          onClick={handleSemesterUpdate}
          disabled={isUpdating}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300"
        >
          {isUpdating ? 'Updating...' : 'Continue to Dashboard'}
        </button>

        {student.semester && (
          <div className="mt-4 text-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-sm text-gray-600 hover:text-gray-500"
            >
              Skip and go to dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectSemester;
