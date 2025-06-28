/**
 * Student Authentication Context
 */

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { Student, StudentLoginData, StudentRegistrationData } from '@/types';

interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  student: Student | null;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (data: StudentLoginData) => Promise<void>;
  signup: (data: StudentRegistrationData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  updateSemester: (semester: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PROTECTED_ROUTES = ['/dashboard', '/progress-report', '/select-semester'];

export function StudentAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isLoading: true,
    isAuthenticated: false,
    student: null,
    error: null,
  });

  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!state.isLoading && !state.isAuthenticated && PROTECTED_ROUTES.includes(router.pathname)) {
      router.replace('/login');
    }
  }, [state.isAuthenticated, state.isLoading, router.pathname]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/check', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setState(prev => ({
          ...prev,
          isAuthenticated: true,
          student: data.student,
          isLoading: false
        }));
      } else {
        setState(prev => ({
          ...prev,
          isAuthenticated: false,
          student: null,
          isLoading: false
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isAuthenticated: false,
        student: null,
        isLoading: false,
        error: 'Failed to check authentication status'
      }));
    }
  };

  const login = async (data: StudentLoginData) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });

      const result = await response.json();

      if (response.ok) {
        setState(prev => ({
          ...prev,
          isAuthenticated: true,
          student: result.student,
          isLoading: false,
          error: null
        }));

        if (result.student.semester) {
          router.push('/dashboard');
        } else {
          router.push('/select-semester');
        }
      } else {
        throw new Error(result.error || 'Login failed');
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isAuthenticated: false,
        student: null,
        isLoading: false,
        error: error.message
      }));
    }
  };

  const signup = async (data: StudentRegistrationData) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });

      const result = await response.json();

      if (response.ok) {
        setState(prev => ({
          ...prev,
          isAuthenticated: true,
          student: result.student,
          isLoading: false,
          error: null
        }));
        router.push('/select-semester');
      } else {
        throw new Error(result.error || 'Signup failed');
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message
      }));
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } finally {
      setState({
        isLoading: false,
        isAuthenticated: false,
        student: null,
        error: null
      });
      router.replace('/');
    }
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  const updateSemester = async (semester: number) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await fetch('/api/students/update-semester', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ semester }),
        credentials: 'include'
      });

      const result = await response.json();

      if (response.ok) {
        setState(prev => ({
          ...prev,
          student: result.student,
          isLoading: false,
          error: null
        }));
        router.push('/dashboard');
      } else {
        throw new Error(result.error || 'Failed to update semester');
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message
      }));
    }
  };

  const value = {
    ...state,
    login,
    signup,
    logout,
    clearError,
    updateSemester
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useStudentAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useStudentAuth must be used within a StudentAuthProvider');
  }
  return context;
}
