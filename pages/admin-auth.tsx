import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAdminAuth } from '../context/AdminAuthContext';
import { adminPasscode } from '../config/environment';

const AdminAuth: React.FC = () => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const router = useRouter();
  const { isAdminAuthenticated, setIsAdminAuthenticated } = useAdminAuth();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAdminAuthenticated) {
      router.replace('/admin/dashboard');
    }
  }, [isAdminAuthenticated, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === adminPasscode) {
      setIsAdminAuthenticated(true);
      setConfirmation('Admin logged in');
      setTimeout(() => {
        router.push('/admin/dashboard');
      }, 2000);
    } else {
      setError('Invalid passcode');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4">Admin Authentication</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="passcode" className="block text-gray-700">Enter Admin Passcode</label>
            <input
              type="password"
              id="passcode"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              autoFocus
            />
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          {confirmation && <p className="text-green-500 text-sm mb-4">{confirmation}</p>}
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-300"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminAuth;
