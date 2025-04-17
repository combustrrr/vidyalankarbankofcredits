// Utility script to check if required environment variables are set
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env.local
const envLocalPath = path.resolve(process.cwd(), '.env.local');
const envPath = path.resolve(process.cwd(), '.env');

// Check if .env.local exists
if (fs.existsSync(envLocalPath)) {
  console.log('✅ Found .env.local file');
  dotenv.config({ path: envLocalPath });
} else if (fs.existsSync(envPath)) {
  console.log('✅ Found .env file');
  dotenv.config({ path: envPath });
} else {
  console.log('⚠️ No .env.local or .env file found. Creating .env.local from example...');
  // Create .env.local from .env.example if it exists
  const envExamplePath = path.resolve(process.cwd(), '.env.example');
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envLocalPath);
    console.log('✅ Created .env.local from .env.example');
    console.log('⚠️ Please update the values in .env.local with your actual credentials');
    dotenv.config({ path: envLocalPath });
  } else {
    console.error('❌ No .env.example file found. Please create one with the required variables.');
    process.exit(1);
  }
}

// Check required variables for database migration
const requiredDbVars = ['SUPABASE_DB_HOST', 'SUPABASE_DB_USER', 'SUPABASE_DB_PASSWORD'];
const missingDbVars = requiredDbVars.filter(varName => !process.env[varName]);

if (missingDbVars.length > 0) {
  console.error(`❌ Missing required environment variables for database migration: ${missingDbVars.join(', ')}`);
  console.error('Please update your .env.local file with these variables');
  process.exit(1);
} else {
  console.log('✅ All required database variables are set');
}

module.exports = {
  dbHost: process.env.SUPABASE_DB_HOST,
  dbUser: process.env.SUPABASE_DB_USER,
  dbPassword: process.env.SUPABASE_DB_PASSWORD
};

console.log('Environment check completed successfully!');