import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface Student {
  id: string;
  roll_number: string;
  first_name: string;
  last_name: string;
  full_name: string;
  legal_name?: string;
  division: string;
  degree: string;
  branch: string;
  semester: number | null; // Ensure semester can be null
  created_at?: string;
  updated_at?: string;
}

interface AuthState {
  isStudentAuthenticated: boolean;
  student: Student | null;
  token: string | null;
}

interface StudentAuthContextProps extends AuthState {
  setIsStudentAuthenticated: (isAuthenticated: boolean) => void;
  setStudent: (student: Student | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
  checkAndRedirectLegacyAccount: () => boolean;
}

export const StudentAuthContext = createContext<StudentAuthContextProps | undefined>(undefined);

interface StudentAuthProviderProps {
  children: ReactNode;
}

export const StudentAuthProvider: React.FC<StudentAuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isStudentAuthenticated: false,
    student: null,
    token: null
  });

  const [redirectToSelectSemester, setRedirectToSelectSemester] = useState(false);

  // Initialize auth state from localStorage when the provider mounts
  useEffect(() => {
    const storedAuthState = localStorage.getItem('studentAuth');
    const storedToken = localStorage.getItem('studentToken');
    
    if (storedAuthState && storedToken) {
      try {
        const parsedAuthState = JSON.parse(storedAuthState);
        
        // Ensure we have a valid student object with ID
        if (!parsedAuthState || !parsedAuthState.id) {
          throw new Error('Invalid student data stored');
        }
        
        setAuthState({
          isStudentAuthenticated: true,
          student: parsedAuthState,
          token: storedToken
        });

        // Handle legacy accounts that don't have semester set
        if (parsedAuthState.semester === null || parsedAuthState.semester === undefined) {
          setRedirectToSelectSemester(true);
        }
      } catch (error) {
        // If there's an error parsing the stored state, clear it
        console.error('Error parsing stored auth state:', error);
        localStorage.removeItem('studentAuth');
        localStorage.removeItem('studentToken');
      }
    }
  }, []);

  // Update localStorage whenever auth state changes
  useEffect(() => {
    if (authState.isStudentAuthenticated && authState.student && authState.token) {
      localStorage.setItem('studentAuth', JSON.stringify(authState.student));
      localStorage.setItem('studentToken', authState.token);
    }
  }, [authState]);

  // Handle redirection to /select-semester if needed for legacy accounts
  useEffect(() => {
    if (redirectToSelectSemester && window) {
      window.location.href = '/select-semester';
    }
  }, [redirectToSelectSemester]);

  // Setter functions
  const setIsStudentAuthenticated = (isAuthenticated: boolean) => {
    setAuthState(prev => ({ ...prev, isStudentAuthenticated: isAuthenticated }));
    if (!isAuthenticated) {
      setAuthState(prev => ({ ...prev, student: null, token: null }));
    }
  };

  const setStudent = (student: Student | null) => {
    setAuthState(prev => ({ ...prev, student }));
  };

  const setToken = (token: string | null) => {
    setAuthState(prev => ({ ...prev, token }));
  };

  // Check if the current account is a legacy account without semester
  // Returns true if redirection is needed
  const checkAndRedirectLegacyAccount = (): boolean => {
    if (authState.student && (authState.student.semester === null || authState.student.semester === undefined)) {
      setRedirectToSelectSemester(true);
      return true;
    }
    return false;
  };

  // Logout function to clear auth state
  const logout = () => {
    localStorage.removeItem('studentAuth');
    localStorage.removeItem('studentToken');
    setAuthState({
      isStudentAuthenticated: false,
      student: null,
      token: null
    });
  };

  return (
    <StudentAuthContext.Provider value={{ 
      ...authState,
      setIsStudentAuthenticated, 
      setStudent, 
      setToken,
      logout,
      checkAndRedirectLegacyAccount
    }}>
      {children}
    </StudentAuthContext.Provider>
  );
};

export const useStudentAuth = () => {
  const context = useContext(StudentAuthContext);
  if (context === undefined) {
    throw new Error('useStudentAuth must be used within a StudentAuthProvider');
  }
  return context;
};
