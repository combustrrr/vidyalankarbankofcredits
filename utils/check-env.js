/**
 * Environment Variables Checker
 *
 * Validates that all required environment variables are present and properly formatted.
 * Exits the process with an error if any required variable is missing.
 */
require('dotenv').config({ path: '.env.local' });

// Define required environment variables
const requiredVariables = [
  'NEXT_PUBLIC_SUPABASE_URL', 
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
];

// Define conditional environment variables (required in production only)
const conditionalVariables = {
  production: [
    'SUPABASE_SERVICE_ROLE_KEY',
    'FRONTEND_URL'
  ]
};

// Check if a URL is valid
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// Check all environment variables
function checkEnvironmentVariables() {
  const isProduction = process.env.NODE_ENV === 'production';
  const errors = [];
  const warnings = [];
  
  // Check required variables
  for (const varName of requiredVariables) {
    if (!process.env[varName]) {
      errors.push(`Missing required environment variable: ${varName}`);
    } else if (varName.includes('URL') && !isValidUrl(process.env[varName])) {
      warnings.push(`${varName} does not appear to be a valid URL: ${process.env[varName]}`);
    }
  }
  
  // Check conditional variables based on environment
  if (isProduction) {
    for (const varName of conditionalVariables.production) {
      if (!process.env[varName]) {
        errors.push(`Missing environment variable required in production: ${varName}`);
      }
    }
  }
  
  // Check for Supabase URL and key format
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('supabase.co')) {
    warnings.push('NEXT_PUBLIC_SUPABASE_URL does not appear to be a valid Supabase URL');
  }
  
  if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length < 20) {
    warnings.push('NEXT_PUBLIC_SUPABASE_ANON_KEY appears to be too short for a valid Supabase key');
  }
  
  // Check database migration variables if service role key is provided
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const dbVars = ['SUPABASE_DB_HOST', 'SUPABASE_DB_USER', 'SUPABASE_DB_PASSWORD'];
    const missingDbVars = dbVars.filter(v => !process.env[v]);
    
    if (missingDbVars.length > 0) {
      warnings.push(`You provided a service role key but are missing database migration variables: ${missingDbVars.join(', ')}`);
    }
  }
  
  // Output results
  if (errors.length > 0) {
    console.error('\x1b[31m%s\x1b[0m', '❌ Environment validation failed:');
    errors.forEach(error => console.error('\x1b[31m%s\x1b[0m', ` - ${error}`));
    
    if (warnings.length > 0) {
      console.warn('\x1b[33m%s\x1b[0m', '⚠️ Warnings:');
      warnings.forEach(warning => console.warn('\x1b[33m%s\x1b[0m', ` - ${warning}`));
    }
    
    return {
      isValid: false,
      errors,
      warnings
    };
  }
  
  if (warnings.length > 0) {
    console.warn('\x1b[33m%s\x1b[0m', '⚠️ Environment validation warnings:');
    warnings.forEach(warning => console.warn('\x1b[33m%s\x1b[0m', ` - ${warning}`));
    console.warn('\x1b[33m%s\x1b[0m', 'The application might still work, but please check these issues.');
  } else {
    console.log('\x1b[32m%s\x1b[0m', '✅ Environment validation passed');
  }
  
  return {
    isValid: true,
    errors,
    warnings
  };
}

// Result of environment check
const result = checkEnvironmentVariables();

// Export for use in other modules
module.exports = result;