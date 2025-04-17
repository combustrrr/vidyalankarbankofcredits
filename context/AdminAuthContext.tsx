import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface AdminAuthContextProps {
  isAdminAuthenticated: boolean;
  setIsAdminAuthenticated: (isAuthenticated: boolean) => void;
  logout: () => void;
  canUpdateSemester: boolean; // Added canUpdateSemester field
}

export const AdminAuthContext = createContext<AdminAuthContextProps | undefined>(undefined);

interface AdminAuthProviderProps {
  children: ReactNode;
}

export const AdminAuthProvider: React.FC<AdminAuthProviderProps> = ({ children }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [canUpdateSemester, setCanUpdateSemester] = useState(false); // Added state variable

  // Initialize auth state from sessionStorage when the provider mounts
  useEffect(() => {
    const storedAuthState = sessionStorage.getItem('adminAuth');
    if (storedAuthState) {
      setIsAdminAuthenticated(JSON.parse(storedAuthState));
      setCanUpdateSemester(JSON.parse(storedAuthState)); // Initialize canUpdateSemester
    }
  }, []);

  // Update sessionStorage whenever auth state changes
  useEffect(() => {
    sessionStorage.setItem('adminAuth', JSON.stringify(isAdminAuthenticated));
    sessionStorage.setItem('canUpdateSemester', JSON.stringify(canUpdateSemester)); // Update canUpdateSemester
  }, [isAdminAuthenticated, canUpdateSemester]);

  // Logout function to clear auth state
  const logout = () => {
    sessionStorage.removeItem('adminAuth');
    sessionStorage.removeItem('canUpdateSemester'); // Clear canUpdateSemester
    setIsAdminAuthenticated(false);
    setCanUpdateSemester(false); // Reset canUpdateSemester
  };

  return (
    <AdminAuthContext.Provider value={{ isAdminAuthenticated, setIsAdminAuthenticated, logout, canUpdateSemester }}>
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
