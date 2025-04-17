/**
 * Environment Configuration
 * 
 * Provides environment detection and related configuration
 */

// Environment detection
export const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
export const isProduction = process.env.NODE_ENV === 'production';
export const isTest = process.env.NODE_ENV === 'test';

// Common environment variables
export const nodeEnv = process.env.NODE_ENV || 'development';
export const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

// Admin authentication
export const adminPasscode = process.env.ADMIN_PASSCODE || '117110';

// Environment helper functions
export const getEnvironment = () => nodeEnv;

// Function to check if we're running on the server or client
export const isServer = () => typeof window === 'undefined';
export const isBrowser = () => !isServer();

// Debug mode
export const isDebugMode = isDevelopment && process.env.DEBUG === 'true';