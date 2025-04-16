import React from 'react';
import { useRouter } from 'next/router';

const Home: React.FC = () => {
  const router = useRouter();

  const handleAdminClick = () => {
    router.push('/admin-auth');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl">
        <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-2xl font-semibold mb-4">Student</h2>
          <p className="text-gray-600">Access your courses and track your progress.</p>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-2xl font-semibold mb-4">Teacher</h2>
          <p className="text-gray-600">Manage your classes and interact with students.</p>
        </div>
        <div
          className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
          onClick={handleAdminClick}
        >
          <h2 className="text-2xl font-semibold mb-4">Admin</h2>
          <p className="text-gray-600">Oversee the platform and manage users.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
