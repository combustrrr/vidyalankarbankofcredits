import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface Student {
  id: string;
  roll_number: string;
  first_name: string;
  last_name: string;
  full_name: string;
  division: string;
  degree: string;
  branch: string;
  semester: number | null; // Added semester field
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

  const [redirectToSelectSemester, setRedirectToSelectSemester] = useState(false); // Added state variable

  // Initialize auth state from localStorage when the provider mounts
  useEffect(() => {
    const storedAuthState = localStorage.getItem('studentAuth');
    const storedToken = localStorage.getItem('studentToken');
    
    if (storedAuthState && storedToken) {
      try {
        const parsedAuthState = JSON.parse(storedAuthState);
        setAuthState({
          isStudentAuthenticated: true,
          student: parsedAuthState,
          token: storedToken
        });

        if (parsedAuthState.semester === null) {
          setRedirectToSelectSemester(true);
        }
      } catch (error) {
        // If there's an error parsing the stored state, clear it
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

  // Handle redirection to /select-semester if needed
  useEffect(() => {
    if (redirectToSelectSemester) {
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

  // Prevent students from updating their semester once it's set
  useEffect(() => {
    if (authState.student && authState.student.semester !== null) {
      setStudent(prev => ({ ...prev, semester: authState.student.semester }));
    }
  }, [authState.student]);

  return (
    <StudentAuthContext.Provider value={{ 
      ...authState,
      setIsStudentAuthenticated, 
      setStudent, 
      setToken,
      logout 
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
