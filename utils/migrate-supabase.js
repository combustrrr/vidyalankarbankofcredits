// Supabase migration script
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Check for required environment variables
const requiredEnvVars = ['SUPABASE_DB_HOST', 'SUPABASE_DB_USER', 'SUPABASE_DB_PASSWORD'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
  console.error('Make sure these are set in your .env.local file or environment');
  process.exit(1);
}

// Define SQL files to run
const migrationFiles = [
  'setup-program-structure.sql',
  'update-courses-table.sql'
];

// Function to execute SQL file using psql
async function executeSqlFile(filePath) {
  return new Promise((resolve, reject) => {
    console.log(`📄 Executing ${filePath}...`);
    
    if (!fs.existsSync(filePath)) {
      return reject(`File not found: ${filePath}`);
    }
    
    // Using the psql command line utility
    const psql = spawn('psql', [
      '-h', process.env.SUPABASE_DB_HOST,
      '-U', process.env.SUPABASE_DB_USER,
      '-d', 'postgres', // database name
      '-f', filePath
    ], {
      env: {
        ...process.env,
        PGPASSWORD: process.env.SUPABASE_DB_PASSWORD
      },
      stdio: 'inherit' // Show output in console
    });
    
    psql.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ Successfully executed ${filePath}`);
        resolve();
      } else {
        reject(`❌ Failed to execute ${filePath} (exit code: ${code})`);
      }
    });
  });
}

// Main function to run migrations
async function runMigrations() {
  console.log('🚀 Starting Supabase migrations...');
  
  for (const file of migrationFiles) {
    const filePath = path.join(__dirname, file);
    
    try {
      await executeSqlFile(filePath);
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  }
  
  console.log('✨ All migrations completed successfully!');
}

// Run migrations
runMigrations();