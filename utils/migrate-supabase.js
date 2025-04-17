// Supabase migration script
const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load environment variables using our checker
try {
  console.log('Checking environment variables...');
  // This will log any missing variables and exit if required ones are not set
  const env = require('./check-env');
} catch (error) {
  console.error('Failed to load environment variables:', error.message);
  process.exit(1);
}

// Check if psql is installed
function isPsqlInstalled() {
  try {
    execSync('which psql', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// Define SQL files to run
const migrationFiles = [
  'create-courses-table.sql',
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
    
    psql.on('error', (err) => {
      if (err.code === 'ENOENT') {
        reject('The psql command was not found. Please make sure PostgreSQL client tools are installed.');
      } else {
        reject(`Error executing psql: ${err.message}`);
      }
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
  
  // Check for psql before proceeding
  if (!isPsqlInstalled()) {
    console.error('❌ Error: PostgreSQL client (psql) is not installed.');
    console.error('Please install PostgreSQL client tools with one of these commands:');
    console.error('  - Ubuntu/Debian: sudo apt-get install postgresql-client');
    console.error('  - macOS: brew install postgresql');
    console.error('  - Windows: Download from https://www.postgresql.org/download/windows/');
    console.error('After installing, run this script again.');
    process.exit(1);
  }
  
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