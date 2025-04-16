import React from 'react';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">Welcome to Vidyalankar Bank of Credits</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl">
        <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-2xl font-semibold mb-4">Student</h2>
          <p className="text-gray-600">Access your courses and track your progress.</p>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-2xl font-semibold mb-4">Teacher</h2>
          <p className="text-gray-600">Manage your classes and interact with students.</p>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-2xl font-semibold mb-4">Admin</h2>
          <p className="text-gray-600">Oversee the platform and manage users.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
