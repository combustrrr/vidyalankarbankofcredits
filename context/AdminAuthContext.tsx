import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface AdminAuthContextProps {
  isAdminAuthenticated: boolean;
  setIsAdminAuthenticated: (isAuthenticated: boolean) => void;
  logout: () => void;
}

export const AdminAuthContext = createContext<AdminAuthContextProps | undefined>(undefined);

interface AdminAuthProviderProps {
  children: ReactNode;
}

export const AdminAuthProvider: React.FC<AdminAuthProviderProps> = ({ children }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Initialize auth state from sessionStorage when the provider mounts
  useEffect(() => {
    const storedAuthState = sessionStorage.getItem('adminAuth');
    if (storedAuthState) {
      setIsAdminAuthenticated(JSON.parse(storedAuthState));
    }
  }, []);

  // Update sessionStorage whenever auth state changes
  useEffect(() => {
    sessionStorage.setItem('adminAuth', JSON.stringify(isAdminAuthenticated));
  }, [isAdminAuthenticated]);

  // Logout function to clear auth state
  const logout = () => {
    sessionStorage.removeItem('adminAuth');
    setIsAdminAuthenticated(false);
  };

  return (
    <AdminAuthContext.Provider value={{ isAdminAuthenticated, setIsAdminAuthenticated, logout }}>
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
