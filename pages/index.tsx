import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useStudentAuth } from '@/contexts/StudentAuthContext';

const Home: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated } = useStudentAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Vidyalankar Bank of Credits
        </h1>
        
        <div className="space-y-4">
          <Link 
            href="/login" 
            className="block w-full bg-blue-600 text-white text-center py-3 px-4 rounded-md hover:bg-blue-700 transition duration-300"
          >
            Student Login
          </Link>
          
          <Link 
            href="/admin/login" 
            className="block w-full bg-green-600 text-white text-center py-3 px-4 rounded-md hover:bg-green-700 transition duration-300"
          >
            Admin Login
          </Link>
          
          <Link 
            href="/signup" 
            className="block w-full bg-gray-600 text-white text-center py-3 px-4 rounded-md hover:bg-gray-700 transition duration-300"
          >
            Sign Up
          </Link>
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Credit System Management</p>
          <p className="mt-2">Version 2.0</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
