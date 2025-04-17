/**
 * Client Configuration
 * 
 * Contains configuration specific to the client-side application
 */
import { isDevelopment } from './environment';

// API configuration
export const clientConfig = {
  // API configuration
  apiUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
  apiTimeout: 30000,
  
  // Authentication configuration
  authCookieName: 'auth_token',
  authStorageKey: 'auth_data',
  authTokenExpiry: 7 * 24 * 60 * 60, // 7 days in seconds
  
  // UI configuration
  animationDuration: 200,
  toastDuration: 5000,
  paginationOptions: [10, 20, 50, 100],
  defaultPageSize: 20,
  
  // Feature toggles (client-side)
  features: {
    darkMode: true,
    courseFiltering: true,
    creditSummary: true,
    instructorView: isDevelopment,
    adminAuth: true,
  }
};