/**
 * Features Configuration
 * 
 * Centralized feature flags management for both server and client
 */
import { isDevelopment, isProduction } from './environment';

// Feature flags
export interface FeatureFlags {
  // Course features
  courseSearch: boolean;
  courseFiltering: boolean;
  creditCalculator: boolean;
  
  // Program structure features
  recommendedCredits: boolean;
  
  // Admin features
  adminDashboard: boolean;
  advancedDataExport: boolean;

  // Authentication features
  studentAuth: boolean;
  facultyAuth: boolean;
  
  // UI features
  darkMode: boolean;
}

// Default feature flags
export const features: FeatureFlags = {
  // Course features
  courseSearch: true,
  courseFiltering: true,
  creditCalculator: true,
  
  // Program structure features
  recommendedCredits: true,
  
  // Admin features
  adminDashboard: true,
  advancedDataExport: !isProduction, // Only available in non-production environments
  
  // Authentication features
  studentAuth: isDevelopment, // Still in development
  facultyAuth: isDevelopment, // Still in development
  
  // UI features
  darkMode: true
};

// Feature flag helper functions
export const isFeatureEnabled = (featureName: keyof FeatureFlags): boolean => {
  return features[featureName];
};

// Override feature flags from environment variables if provided
// Example: FEATURE_DARK_MODE=false would disable the darkMode feature
const overrideFeaturesFromEnv = () => {
  Object.keys(features).forEach(key => {
    const envKey = `FEATURE_${key.toUpperCase()}`;
    if (typeof process.env[envKey] !== 'undefined') {
      const value = process.env[envKey]?.toLowerCase();
      features[key as keyof FeatureFlags] = value === 'true';
    }
  });
};

// Apply overrides if we're in a Node.js environment
if (typeof process !== 'undefined' && process.env) {
  overrideFeaturesFromEnv();
}