import React from 'react';
import { useRouter } from 'next/router';
import { useAdminAuth } from '../contexts/AdminAuthContext';

interface AdminRouteGuardProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  requiredRole?: string;
  fallbackComponent?: React.ReactNode;
}

export const AdminRouteGuard: React.FC<AdminRouteGuardProps> = ({
  children,
  requiredPermissions = [],
  requiredRole,
  fallbackComponent
}) => {
  const { isAdminAuthenticated, admin, loading, hasPermission, hasRole } = useAdminAuth();
  const router = useRouter();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAdminAuthenticated) {
    router.push('/admin/login');
    return null;
  }

  // Check role requirement
  if (requiredRole && !hasRole(requiredRole)) {
    return fallbackComponent || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="mt-4 text-lg font-medium text-gray-900">Access Denied</h2>
          <p className="mt-2 text-gray-500">You don't have the required role to access this page.</p>
          <p className="text-sm text-gray-400 mt-1">Required: {requiredRole}</p>
        </div>
      </div>
    );
  }

  // Check permission requirements
  if (requiredPermissions.length > 0) {
    const hasRequiredPermissions = requiredPermissions.some(permission => hasPermission(permission));
    
    if (!hasRequiredPermissions) {
      return fallbackComponent || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="mt-4 text-lg font-medium text-gray-900">Insufficient Permissions</h2>
            <p className="mt-2 text-gray-500">You don't have the required permissions to access this page.</p>
            <p className="text-sm text-gray-400 mt-1">Required: {requiredPermissions.join(', ')}</p>
          </div>
        </div>
      );
    }
  }

  // All checks passed, render children
  return <>{children}</>;
};

export default AdminRouteGuard;
