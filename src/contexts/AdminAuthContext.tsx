/**
 * Admin Authentication Context with RBAC Support
 */

'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface AdminRole {
  id: string;
  roleName: string;
  roleCode: string;
}

interface AdminUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: AdminRole;
  permissions: string[];
  universityId?: string;
  departmentAccess?: string[];
}

interface AdminAuthContextProps {
  isAdminAuthenticated: boolean;
  admin: AdminUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasRole: (roleCode: string) => boolean;
  isUniversityAdmin: () => boolean;
  isSuperAdmin: () => boolean;
}

export const AdminAuthContext = createContext<AdminAuthContextProps | undefined>(undefined);

interface AdminAuthProviderProps {
  children: ReactNode;
}

export const AdminAuthProvider: React.FC<AdminAuthProviderProps> = ({ children }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        const { token, admin: adminData } = data.data;
        
        // Store token
        localStorage.setItem('adminToken', token);
        
        // Update state
        setAdmin(adminData);
        setIsAdminAuthenticated(true);
        
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const token = localStorage.getItem('adminToken');
      if (token) {
        await fetch('/api/admin/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state regardless of API call result
      localStorage.removeItem('adminToken');
      setAdmin(null);
      setIsAdminAuthenticated(false);
    }
  };

  const checkAuth = async (): Promise<void> => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch('/api/admin/auth/check', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success && data.data) {
        setAdmin(data.data.admin);
        setIsAdminAuthenticated(true);
      } else {
        // Token invalid, clear it
        localStorage.removeItem('adminToken');
        setAdmin(null);
        setIsAdminAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      localStorage.removeItem('adminToken');
      setAdmin(null);
      setIsAdminAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (permission: string): boolean => {
    return admin?.permissions?.includes(permission) || false;
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!admin?.permissions) return false;
    return permissions.some(permission => admin.permissions.includes(permission));
  };

  const hasRole = (roleCode: string): boolean => {
    return admin?.role?.roleCode === roleCode;
  };

  const isUniversityAdmin = (): boolean => {
    return hasRole('university_admin');
  };

  const isSuperAdmin = (): boolean => {
    return hasRole('super_admin');
  };

  return (
    <AdminAuthContext.Provider value={{ 
      isAdminAuthenticated,
      admin,
      loading,
      login,
      logout,
      checkAuth,
      hasPermission,
      hasAnyPermission,
      hasRole,
      isUniversityAdmin,
      isSuperAdmin
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
