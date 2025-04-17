import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useStudentAuth } from '../context/StudentAuthContext';
import { courseApi } from '../utils/api';
import { Course, CompletedCourse } from '../types';

const Dashboard: React.FC = () => {
  const router = useRouter();
  const { isStudentAuthenticated, student, logout } = useStudentAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [completedCourses, setCompletedCourses] = useState<CompletedCourse[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
  const [totalCredits, setTotalCredits] = useState<number>(0);
  const [basketCredits, setBasketCredits] = useState<Array<{ 
    vertical: string; 
    basket: string; 
    completed_credits: number;
    total_credits: number;
  }>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [expandedSemesters, setExpandedSemesters] = useState<number[]>([]);

  // Protect this route - redirect to login page if not authenticated
  useEffect(() => {
    if (!isStudentAuthenticated) {
      router.replace('/');
    } else if (student && student.semester === null) {
      router.replace('/select-semester');
    } else if (student) {
      setSelectedSemester(student.semester);
      // Expand current semester by default
      if (student.semester) {
        setExpandedSemesters([student.semester]);
      }
    }
  }, [isStudentAuthenticated, student, router]);

  // Fetch courses and completed courses when semester is set
  useEffect(() => {
    if (selectedSemester !== null) {
      fetchData();
    }
  }, [selectedSemester]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Fetch all courses for all semesters up to the student's current semester
      const coursesResponse = await courseApi.getAll();
      
      if (coursesResponse.success) {
        setCourses(coursesResponse.data.data);
      } else {
        console.error('Failed to fetch courses:', coursesResponse);
        setCourses([]);
      }

      // Fetch completed courses with better error handling
      try {
        const completionResponse = await fetch('/api/courses/completion', {
          headers: {
            'Student-Authorization': `Bearer ${localStorage.getItem('studentToken')}`
          }
        });
        
        if (completionResponse.ok) {
          const completionData = await completionResponse.json();
          if (completionData.success) {
            setCompletedCourses(completionData.data);
          } else {
            console.error('Completion data not successful:', completionData);
            setCompletedCourses([]);
          }
        } else if (completionResponse.status === 404) {
          console.log('No completion data found yet');
          setCompletedCourses([]);
        } else {
          console.error('Failed to fetch completed courses:', completionResponse.status);
          setCompletedCourses([]);
        }
      } catch (completionError) {
        console.error('Error fetching completion data:', completionError);
        setCompletedCourses([]);
      }

      // Fetch credit totals and basket breakdown with better error handling
      try {
        const creditsResponse = await fetch('/api/students/credits', {
          headers: {
            'Student-Authorization': `Bearer ${localStorage.getItem('studentToken')}`
          }
        });
        
        if (creditsResponse.ok) {
          const creditsData = await creditsResponse.json();
          if (creditsData.success) {
            setTotalCredits(creditsData.totalCredits || 0);
            setBasketCredits(creditsData.basketCredits || []);
          } else {
            console.error('Credits data not successful:', creditsData);
            setTotalCredits(0);
            setBasketCredits([]);
          }
        } else if (creditsResponse.status === 404) {
          console.log('No credits data found yet');
          setTotalCredits(0);
          setBasketCredits([]);
        } else {
          console.error('Failed to fetch credit data:', creditsResponse.status);
          setTotalCredits(0);
          setBasketCredits([]);
        }
      } catch (creditsError) {
        console.error('Error fetching credits data:', creditsError);
        setTotalCredits(0);
        setBasketCredits([]);
      }
    } catch (error) {
      console.error('Error in main fetchData function:', error);
      setError('Failed to fetch data. Please try again later or contact support if the problem persists.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const toggleSemester = (semester: number) => {
    setExpandedSemesters(prev => 
      prev.includes(semester) 
        ? prev.filter(s => s !== semester) 
        : [...prev, semester]
    );
  };

  const isCourseCompleted = (courseId: string): boolean => {
    return completedCourses.some(c => c.course_id === courseId);
  };

  const handleCourseCompletionChange = async (courseId: string, completed: boolean) => {
    try {
      const response = await fetch('/api/courses/completion', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Student-Authorization': `Bearer ${localStorage.getItem('studentToken')}`
        },
        body: JSON.stringify({
          courseId,
          completed
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update course completion');
      }

      // Refresh data to get updated credits and completion status
      fetchData();
    } catch (error) {
      console.error('Error changing course completion status:', error);
      setError(error.message || 'Failed to update course completion');
    }
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

  // Don't render anything until we're sure the user is authenticated
  if (!isStudentAuthenticated || !student) {
    return null; // Or a loading indicator
  }

  // Filter courses for each semester, up to student's current semester
  const semesterCourses = [];
  for (let i = 1; i <= (selectedSemester || 0); i++) {
    semesterCourses.push({
      semester: i,
      courses: courses.filter(course => course.semester === i)
    });
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
            <div className="flex space-x-4">
              <Link href="/progress-report" className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                Progress Report
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
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p>{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome, {student.first_name}!</h1>
          <p className="text-gray-600">
            You're now logged into your student dashboard.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Academic Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Roll Number:</p>
              <p className="font-medium">{student.roll_number}</p>
            </div>
            <div>
              <p className="text-gray-600">Name:</p>
              <p className="font-medium">{student.full_name}</p>
            </div>
            <div>
              <p className="text-gray-600">Degree:</p>
              <p className="font-medium">{student.degree}</p>
            </div>
            <div>
              <p className="text-gray-600">Branch:</p>
              <p className="font-medium">{student.branch}</p>
            </div>
            <div>
              <p className="text-gray-600">Division:</p>
              <p className="font-medium">{student.division}</p>
            </div>
            <div>
              <p className="text-gray-600">Semester:</p>
              <p className="font-medium">{student.semester}</p>
            </div>
            <div>
              <p className="text-gray-600">Academic Year:</p>
              <p className="font-medium">{computeAcademicYear(student.semester)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Your Credits Summary</h2>
          <div className="mb-4">
            <p className="text-gray-600">Total Credits Completed:</p>
            <p className="text-2xl font-bold text-indigo-600">{totalCredits} credits</p>
          </div>
          
          <h3 className="text-lg font-medium mb-2">Credits by Basket</h3>
          {basketCredits.length === 0 ? (
            <p className="text-gray-500 italic">No credits completed yet.</p>
          ) : (
            <div className="space-y-4">
              {basketCredits.map((basket, index) => (
                <div key={index} className="border p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-1">{basket.vertical} - {basket.basket}</h4>
                  <div className="w-full bg-gray-200 rounded-full h-4 mb-1">
                    <div
                      className="bg-indigo-600 h-4 rounded-full"
                      style={{ width: `${basket.total_credits > 0 ? (basket.completed_credits / basket.total_credits * 100) : 0}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {basket.completed_credits}/{basket.total_credits} credits completed
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Your Academic Progress</h2>
          
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="ml-2">Loading...</span>
            </div>
          ) : semesterCourses.length === 0 ? (
            <p className="text-gray-500 italic">No courses available for your semester.</p>
          ) : (
            <div className="space-y-4">
              {semesterCourses.map(({ semester, courses }) => (
                <div key={semester} className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSemester(semester)}
                    className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <h3 className="text-lg font-semibold">Semester {semester}</h3>
                    <svg
                      className={`w-5 h-5 transform transition-transform ${expandedSemesters.includes(semester) ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </button>
                  
                  {expandedSemesters.includes(semester) && (
                    <div className="p-4 divide-y">
                      {courses.length === 0 ? (
                        <p className="text-gray-500 italic py-2">No courses available for this semester.</p>
                      ) : (
                        courses.map((course) => (
                          <div key={course.id} className="py-3">
                            <div className="flex flex-col mb-2">
                              <span className="font-medium">{course.course_code} - {course.title}</span>
                              <span className="text-sm text-gray-500">
                                {course.credits} credit{course.credits !== 1 ? 's' : ''} | {course.type} | {course.vertical} - {course.basket}
                              </span>
                            </div>
                            <div className="ml-2 mt-2">
                              <label className="inline-flex items-center mr-6">
                                <input
                                  type="radio"
                                  name={`course-${course.id}`}
                                  value="yes"
                                  checked={isCourseCompleted(course.id)}
                                  onChange={() => handleCourseCompletionChange(course.id, true)}
                                  className="form-radio h-4 w-4 text-indigo-600"
                                  disabled={student.semester < course.semester}
                                />
                                <span className="ml-2">Yes, I have completed this course</span>
                              </label>
                              <label className="inline-flex items-center">
                                <input
                                  type="radio"
                                  name={`course-${course.id}`}
                                  value="no"
                                  checked={!isCourseCompleted(course.id)}
                                  onChange={() => handleCourseCompletionChange(course.id, false)}
                                  className="form-radio h-4 w-4 text-indigo-600"
                                />
                                <span className="ml-2">No, I have not completed this course</span>
                              </label>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
