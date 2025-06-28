/**
 * Progress Report Page
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useStudentAuth } from '@/contexts/StudentAuthContext';
import { Course, CompletedCourse } from '@/types';
import { VERTICALS, BASKETS } from '@/lib/programStructure';

interface ProgressData {
  completedCourses: CompletedCourse[];
  totalCredits: number;
  verticalProgress: Record<string, {
    completed: number;
    required: number;
    courses: CompletedCourse[];
  }>;
  basketProgress: Record<string, {
    completed: number;
    required: number;
    courses: CompletedCourse[];
  }>;
}

const ProgressReport: React.FC = () => {
  const router = useRouter();
  const { student, isAuthenticated, isLoading } = useStudentAuth();
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (isAuthenticated && student) {
      fetchProgressData();
    }
  }, [isAuthenticated, isLoading, student, router]);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/students/progress', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setProgressData(data.progress);
      } else {
        throw new Error('Failed to fetch progress data');
      }
    } catch (error) {
      setError('Failed to load progress data');
      console.error('Progress fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading progress report...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !student) {
    return null; // Redirecting...
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const getProgressPercentage = (completed: number, required: number) => {
    return required > 0 ? Math.min((completed / required) * 100, 100) : 0;
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Progress Report</h1>
              <p className="mt-2 text-gray-600">
                {student.full_name} • {student.roll_number} • Semester {student.semester}
              </p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {progressData && (
          <>
            {/* Overall Credits */}
            <div className="bg-white shadow rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Overall Progress</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{progressData.totalCredits}</div>
                  <div className="text-gray-600">Total Credits Earned</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{progressData.completedCourses.length}</div>
                  <div className="text-gray-600">Courses Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{student.semester || 'N/A'}</div>
                  <div className="text-gray-600">Current Semester</div>
                </div>
              </div>
            </div>

            {/* Vertical Progress */}
            <div className="bg-white shadow rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Progress by Vertical</h2>
              <div className="space-y-4">
                {Object.entries(progressData.verticalProgress).map(([vertical, progress]) => (
                  <div key={vertical} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-gray-900">{vertical}</h3>
                      <span className="text-sm text-gray-600">
                        {progress.completed} / {progress.required} credits
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getProgressPercentage(progress.completed, progress.required)}%` }}
                      ></div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      {getProgressPercentage(progress.completed, progress.required).toFixed(1)}% complete
                    </div>
                    {progress.courses.length > 0 && (
                      <div className="mt-3">
                        <details className="cursor-pointer">
                          <summary className="text-sm font-medium text-blue-600 hover:text-blue-700">
                            View completed courses ({progress.courses.length})
                          </summary>
                          <div className="mt-2 space-y-1">
                            {progress.courses.map((course) => (
                              <div key={course.id} className="text-sm text-gray-600 pl-4">
                                {course.courses.course_code} - {course.courses.title} ({course.courses.credits} credits)
                              </div>
                            ))}
                          </div>
                        </details>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Basket Progress */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Progress by Basket</h2>
              <div className="space-y-4">
                {Object.entries(progressData.basketProgress).map(([basket, progress]) => (
                  <div key={basket} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-gray-900">{basket}</h3>
                      <span className="text-sm text-gray-600">
                        {progress.completed} / {progress.required} credits
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getProgressPercentage(progress.completed, progress.required)}%` }}
                      ></div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      {getProgressPercentage(progress.completed, progress.required).toFixed(1)}% complete
                    </div>
                    {progress.courses.length > 0 && (
                      <div className="mt-3">
                        <details className="cursor-pointer">
                          <summary className="text-sm font-medium text-green-600 hover:text-green-700">
                            View completed courses ({progress.courses.length})
                          </summary>
                          <div className="mt-2 space-y-1">
                            {progress.courses.map((course) => (
                              <div key={course.id} className="text-sm text-gray-600 pl-4">
                                {course.courses.course_code} - {course.courses.title} ({course.courses.credits} credits)
                              </div>
                            ))}
                          </div>
                        </details>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProgressReport;
