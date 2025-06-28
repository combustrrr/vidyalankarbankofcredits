import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAdminAuth } from '../../src/contexts/AdminAuthContext';

const AdminDashboard: React.FC = () => {
  const { isAdminAuthenticated, admin, loading, logout, hasPermission, isSuperAdmin, isUniversityAdmin } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAdminAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAdminAuthenticated, loading, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAdminAuthenticated || !admin) {
    return null;
  }

  const dashboardCards = [
    {
      title: 'User Management',
      description: 'Manage students and faculty accounts',
      icon: '👥',
      permissions: ['manage_students', 'view_students', 'manage_faculty'],
      link: '/admin/users'
    },
    {
      title: 'Academic Management',
      description: 'Manage courses, programs, and curriculum',
      icon: '📚',
      permissions: ['manage_courses', 'manage_programs', 'manage_curriculum'],
      link: '/admin/academic'
    },
    {
      title: 'System Settings',
      description: 'Configure system settings and universities',
      icon: '⚙️',
      permissions: ['system_settings', 'manage_universities'],
      link: '/admin/settings'
    },
    {
      title: 'Reports & Analytics',
      description: 'View reports and system analytics',
      icon: '📊',
      permissions: ['view_reports', 'generate_reports'],
      link: '/admin/reports'
    },
    {
      title: 'Admin Management',
      description: 'Manage administrator accounts',
      icon: '🔐',
      permissions: ['manage_admins'],
      link: '/admin/admins'
    },
    {
      title: 'Audit Logs',
      description: 'View system audit logs',
      icon: '📋',
      permissions: ['view_audit_logs'],
      link: '/admin/audit'
    }
  ];

  const accessibleCards = dashboardCards.filter(card => 
    card.permissions.some(permission => hasPermission(permission))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900">Admin Portal</h1>
                <p className="text-sm text-gray-500">Vidyalankar Credits System</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{admin.fullName}</p>
                <p className="text-xs text-gray-500">{admin.role.roleName}</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-8">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-2">
                Welcome back, {admin.firstName}!
              </h2>
              <p className="text-gray-600">
                You are logged in as <span className="font-semibold">{admin.role.roleName}</span>
                {admin.universityId && (
                  <span> for University ID: {admin.universityId}</span>
                )}
              </p>
              
              {/* Role-specific information */}
              {isSuperAdmin() && (
                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-800">
                    🚀 <strong>Super Administrator:</strong> You have full system access across all universities.
                  </p>
                </div>
              )}
              
              {isUniversityAdmin() && (
                <div className="mt-4 p-3 bg-green-50 rounded-md">
                  <p className="text-sm text-green-800">
                    🏛️ <strong>University Administrator:</strong> You have full access within your assigned university.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {accessibleCards.map((card, index) => (
              <div
                key={index}
                className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(card.link)}
              >
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className="text-2xl">{card.icon}</span>
                    </div>
                    <div className="ml-4 w-0 flex-1">
                      <h3 className="text-lg font-medium text-gray-900">
                        {card.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {card.description}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Stats - Will be implemented in future updates */}
          <div className="mt-8 bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">System Overview</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">6</div>
                  <div className="text-sm text-blue-800">Admin Roles</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">22</div>
                  <div className="text-sm text-green-800">Permissions</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">Active</div>
                  <div className="text-sm text-purple-800">System Status</div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Admin system is fully operational with role-based access control.
              </p>
            </div>
          </div>

          {/* Permissions Debug (only for development) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-8 bg-gray-100 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Current Permissions (Debug):</h4>
              <div className="text-xs text-gray-600 space-y-1">
                {admin.permissions.map((permission, index) => (
                  <span key={index} className="inline-block bg-gray-200 px-2 py-1 rounded mr-2 mb-1">
                    {permission}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
