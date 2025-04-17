import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useStudentAuth } from '../context/StudentAuthContext';
import { courseApi, adminApi } from '../utils/api';
import { Course } from '../types';

const Dashboard: React.FC = () => {
  const router = useRouter();
  const { isStudentAuthenticated, student, logout } = useStudentAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
  const [totalCredits, setTotalCredits] = useState<number>(0); // P0316
  const [basketCredits, setBasketCredits] = useState<Array<{ vertical: string; basket: string; total_credits: number }>>([]); // P9f89

  // Protect this route - redirect to login page if not authenticated
  useEffect(() => {
    if (!isStudentAuthenticated) {
      router.replace('/');
    } else if (student && student.semester === null) {
      router.replace('/select-semester');
    } else if (student) {
      setSelectedSemester(student.semester);
    }
  }, [isStudentAuthenticated, student, router]);

  useEffect(() => {
    if (selectedSemester !== null) {
      fetchCourses(selectedSemester);
    }
  }, [selectedSemester]);

  const fetchCourses = async (semester: number) => {
    try {
      const response = await courseApi.getAll({ semester });
      if (response.success) {
        setCourses(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchCredits = async () => {
    try {
      const response = await adminApi.getBasketCredits();
      setTotalCredits(response.totalCredits);
      setBasketCredits(response.basketCredits);
    } catch (error) {
      console.error('Error fetching credits:', error);
    }
  };

  useEffect(() => {
    fetchCredits();
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleCourseCompletionChange = (courseId: string, completed: boolean) => {
    setCourses((prevCourses) =>
      prevCourses.map((course) =>
        course.id === courseId ? { ...course, completed } : course
      )
    );
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
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome, {student.first_name}!</h1>
          <p className="text-gray-600">
            You're now logged into your student dashboard.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Student Information</h2>
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
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Academic Year:</p>
              <p className="font-medium">{computeAcademicYear(student.semester)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Your Credits</h2>
          <p className="text-gray-600 mb-4">
            Welcome to Vidyalankar Bank of Credits system! Your course credits and program structure will be displayed here.
          </p>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Your course data will be available soon. Please check back later.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Total Credits Completed</h2>
          <p className="text-gray-600 mb-4">{totalCredits} credits completed</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Credits Breakdown by Basket</h2>
          {basketCredits.map((basketCredit, index) => (
            <div key={index} className="mb-4">
              <h3 className="text-lg font-semibold mb-2">{basketCredit.vertical} - {basketCredit.basket}</h3>
              <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                <div
                  className="bg-indigo-600 h-4 rounded-full"
                  style={{ width: `${(basketCredit.total_credits / totalCredits) * 100}%` }}
                ></div>
              </div>
              <p className="text-gray-600">{basketCredit.total_credits} / {totalCredits} credits completed</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Your Academic Progress</h2>
          {Array.from({ length: selectedSemester || 0 }, (_, i) => i + 1).map((semester) => (
            <div key={semester} className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Semester {semester}</h3>
              {courses
                .filter((course) => course.semester === semester)
                .map((course) => (
                  <div key={course.id} className="mb-2">
                    <p className="font-medium">{course.course_code} - {course.title}</p>
                    <div className="flex items-center">
                      <label className="mr-4">
                        <input
                          type="radio"
                          name={`course-${course.id}`}
                          value="yes"
                          checked={course.completed === true}
                          onChange={() => handleCourseCompletionChange(course.id, true)}
                        />
                        Yes, I have completed this course
                      </label>
                      <label>
                        <input
                          type="radio"
                          name={`course-${course.id}`}
                          value="no"
                          checked={course.completed === false}
                          onChange={() => handleCourseCompletionChange(course.id, false)}
                        />
                        No, I have not completed this course
                      </label>
                    </div>
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
