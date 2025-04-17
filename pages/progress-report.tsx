import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useStudentAuth } from '../context/StudentAuthContext';
import { courseApi } from '../utils/api';
import { Course } from '../types';

const ProgressReport: React.FC = () => {
  const router = useRouter();
  const { isStudentAuthenticated, student, logout } = useStudentAuth();
  const [progressReport, setProgressReport] = useState<any>({});
  const [totalCreditsCompleted, setTotalCreditsCompleted] = useState<number>(0);
  const [basketWiseBreakdown, setBasketWiseBreakdown] = useState<any>({});

  // Protect this route - redirect to login page if not authenticated
  useEffect(() => {
    if (!isStudentAuthenticated) {
      router.replace('/');
    } else if (student && student.semester === null) {
      router.replace('/select-semester');
    } else if (student) {
      fetchProgressReport(student.id);
    }
  }, [isStudentAuthenticated, student, router]);

  const fetchProgressReport = async (studentId: string) => {
    try {
      const response = await courseApi.getProgressReport({ studentId });
      if (response.success) {
        setProgressReport(response.data.progressReport);
        setTotalCreditsCompleted(response.data.totalCreditsCompleted);
        setBasketWiseBreakdown(response.data.basketWiseBreakdown);
      }
    } catch (error) {
      console.error('Error fetching progress report:', error);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Don't render anything until we're sure the user is authenticated
  if (!isStudentAuthenticated || !student) {
    return null; // Or a loading indicator
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-indigo-600 shadow-lg">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center">
              <span className="text-white text-lg font-semibold">
                Vidyalankar Bank of Credits
              </span>
            </div>
            <div>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Progress Report</h1>
          <p className="text-gray-600">
            Here is your full academic progress report.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Total Credits Completed</h2>
          <p className="text-gray-600 mb-4">{totalCreditsCompleted} / 162 credits completed</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Basket-wise Breakdown</h2>
          {Object.keys(basketWiseBreakdown).map((basket, index) => (
            <div key={index} className="mb-4">
              <h3 className="text-lg font-semibold mb-2">{basket}</h3>
              <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                <div
                  className="bg-indigo-600 h-4 rounded-full"
                  style={{ width: `${(basketWiseBreakdown[basket] / totalCreditsCompleted) * 100}%` }}
                ></div>
              </div>
              <p className="text-gray-600">{basketWiseBreakdown[basket]} / {totalCreditsCompleted} credits completed</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Completed Courses</h2>
          {Object.keys(progressReport).map((semester, index) => (
            <div key={index} className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Semester {semester}</h3>
              {progressReport[semester].map((course: any, courseIndex: number) => (
                <div key={courseIndex} className="mb-2">
                  <p className="font-medium">{course.courseCode} - {course.courseName}</p>
                  <p className="text-gray-600">Basket: {course.basket}</p>
                  <p className="text-gray-600">Credits Earned: {course.creditsEarned}</p>
                  <p className="text-gray-600">Completion Date: {new Date(course.completionDate).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressReport;
