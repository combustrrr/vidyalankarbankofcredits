import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useStudentAuth } from '../context/StudentAuthContext';
import { Course, CompletedCourse } from '../types';

interface CompletedCourseWithDetails extends CompletedCourse {
  course: Course;
}

interface BasketCredit {
  vertical: string;
  basket: string;
  completed_credits: number;
  total_credits: number;
}

const ProgressReport: React.FC = () => {
  const router = useRouter();
  const { isStudentAuthenticated, student, logout } = useStudentAuth();
  const [completedCourses, setCompletedCourses] = useState<CompletedCourseWithDetails[]>([]);
  const [totalCredits, setTotalCredits] = useState<number>(0);
  const [basketCredits, setBasketCredits] = useState<BasketCredit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Protect this route - redirect to login page if not authenticated
  useEffect(() => {
    if (!isStudentAuthenticated) {
      router.replace('/');
    } else if (student && student.semester === null) {
      router.replace('/select-semester');
    } else {
      fetchData();
    }
  }, [isStudentAuthenticated, student, router]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Fetch completed courses
      const completionResponse = await fetch('/api/courses/completion', {
        headers: {
          'Student-Authorization': `Bearer ${localStorage.getItem('studentToken')}`
        }
      });
      
      if (!completionResponse.ok) {
        throw new Error('Failed to fetch completed courses');
      }
      
      const completionData = await completionResponse.json();
      if (completionData.success) {
        // Format the data to include course details
        const formattedCourses = completionData.data.map(item => ({
          ...item,
          course: item.courses
        }));
        
        setCompletedCourses(formattedCourses);
      }

      // Fetch credit totals and basket breakdown
      const creditsResponse = await fetch('/api/students/credits', {
        headers: {
          'Student-Authorization': `Bearer ${localStorage.getItem('studentToken')}`
        }
      });
      
      if (!creditsResponse.ok) {
        throw new Error('Failed to fetch credit data');
      }
      
      const creditsData = await creditsResponse.json();
      if (creditsData.success) {
        setTotalCredits(creditsData.totalCredits);
        setBasketCredits(creditsData.basketCredits);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch progress data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Function to compute academic year based on semester value
  const computeAcademicYear = (semester: number | null) => {
    if (semester === null) return 'Unknown';
    if (semester >= 1 && semester <= 2) return '1st Year';
    if (semester >= 3 && semester <= 4) return '2nd Year';
    if (semester >= 5 && semester <= 6) return '3rd Year';
    if (semester >= 7 && semester <= 8) return '4th Year';
    return 'Unknown';
  };

  // Group completed courses by semester
  const coursesBySemester = completedCourses.reduce((acc, completedCourse) => {
    const semester = completedCourse.semester;
    if (!acc[semester]) {
      acc[semester] = [];
    }
    acc[semester].push(completedCourse);
    return acc;
  }, {} as Record<number, CompletedCourseWithDetails[]>);

  // Don't render anything until we're sure the user is authenticated
  if (!isStudentAuthenticated || !student) {
    return null; // Or a loading indicator
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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
            <div className="flex space-x-4">
              <Link href="/dashboard" className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                Dashboard
              </Link>
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
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Academic Progress Report</h1>
          <p className="text-gray-600">
            Student: {student.full_name} | Roll Number: {student.roll_number} | Semester: {student.semester} | {computeAcademicYear(student.semester)}
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-2">Loading your progress...</span>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Credit Summary</h2>
              <div className="mb-6">
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                  <p className="text-lg mb-1">Total Credits Completed:</p>
                  <p className="text-3xl font-bold text-indigo-600">{totalCredits} <span className="text-lg font-normal text-indigo-400">/ 162</span></p>
                </div>
              </div>
              
              <h3 className="text-lg font-medium mb-3">Basket-wise Breakdown</h3>
              {basketCredits.length === 0 ? (
                <p className="text-gray-500 italic">No credits completed yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {basketCredits.map((basket, index) => (
                    <div key={index} className="border p-4 rounded-lg">
                      <h4 className="font-medium text-gray-800 mb-2">{basket.vertical} - {basket.basket}</h4>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress:</span>
                        <span>{basket.completed_credits}/{basket.total_credits} credits ({basket.total_credits > 0 ? Math.round(basket.completed_credits / basket.total_credits * 100) : 0}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-indigo-600 h-3 rounded-full"
                          style={{ width: `${basket.total_credits > 0 ? (basket.completed_credits / basket.total_credits * 100) : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Completed Courses</h2>
              
              {Object.keys(coursesBySemester).length === 0 ? (
                <p className="text-gray-500 italic">No courses completed yet.</p>
              ) : (
                <div className="space-y-6">
                  {Object.entries(coursesBySemester)
                    .sort(([semA], [semB]) => parseInt(semA) - parseInt(semB))
                    .map(([semester, courses]) => (
                      <div key={semester} className="border rounded-lg overflow-hidden">
                        <div className="bg-gray-50 p-4 border-b">
                          <h3 className="text-lg font-semibold">Semester {semester}</h3>
                          <p className="text-sm text-gray-500">
                            {courses.length} course{courses.length !== 1 ? 's' : ''} completed | 
                            {courses.reduce((sum, course) => sum + course.credit_awarded, 0)} credits earned
                          </p>
                        </div>
                        
                        <div className="p-0">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Code</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Basket</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credits</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion Date</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {courses.map((completedCourse) => (
                                <tr key={completedCourse.id}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {completedCourse.course.course_code}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {completedCourse.course.title}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {completedCourse.course.vertical} - {completedCourse.course.basket}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {completedCourse.credit_awarded}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatDate(completedCourse.completed_at)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">All Completed Courses</h2>
              
              {completedCourses.length === 0 ? (
                <p className="text-gray-500 italic">No courses completed yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Code</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Name</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semester</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Basket</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credits</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {completedCourses
                        .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())
                        .map((completedCourse) => (
                          <tr key={completedCourse.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {completedCourse.course.course_code}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {completedCourse.course.title}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {completedCourse.semester}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {completedCourse.course.vertical} - {completedCourse.course.basket}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {completedCourse.course.type}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {completedCourse.credit_awarded}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(completedCourse.completed_at)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProgressReport;
