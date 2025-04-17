/**
 * Consolidated Database Migration Manager for Vidyalankar Bank of Credits
 * 
 * This script handles all database migration tasks in a unified approach:
 * - Checks environment variables
 * - Sets up database tables and structure
 * - Updates relationships between tables
 * - Provides programmatic and CLI interfaces
 */
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');
const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');
const { Pool } = require('pg');

// Check environment variables
console.log('🔍 Checking environment variables...');
try {
  const env = require('../check-env');
  if (!env.isValid) {
    console.error('❌ Environment check failed. Please fix the issues above.');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Failed to load environment variables:', error.message);
  process.exit(1);
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables. Please check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Create a PostgreSQL connection pool for direct SQL execution
let pool = null;
try {
  if (process.env.SUPABASE_DB_HOST && 
      process.env.SUPABASE_DB_USER && 
      process.env.SUPABASE_DB_PASSWORD) {
    pool = new Pool({
      host: process.env.SUPABASE_DB_HOST,
      port: 5432,
      user: process.env.SUPABASE_DB_USER,
      password: process.env.SUPABASE_DB_PASSWORD,
      database: 'postgres',
      ssl: { rejectUnauthorized: false } // Required for Supabase connections
    });
    console.log('✅ PostgreSQL connection pool created successfully');
  } else {
    console.log('⚠️ Some database connection parameters are missing. Direct SQL execution will be unavailable.');
  }
} catch (error) {
  console.error('❌ Failed to create PostgreSQL connection pool:', error.message);
}

// Function to execute SQL directly using PostgreSQL connection
async function executeSqlDirect(sql) {
  if (!pool) {
    throw new Error('PostgreSQL connection pool is not available. Cannot execute SQL directly.');
  }
  
  const client = await pool.connect();
  try {
    console.log('🔄 Executing SQL directly through PostgreSQL connection...');
    await client.query(sql);
    console.log('✅ SQL executed successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to execute SQL:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

// Helper function to check if psql is installed
function isPsqlInstalled() {
  try {
    execSync('which psql', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// Helper function to execute SQL file using psql
async function executeSqlFile(filePath) {
  return new Promise((resolve, reject) => {
    console.log(`📄 Executing ${filePath}...`);
    
    if (!fs.existsSync(filePath)) {
      return reject(`❌ File not found: ${filePath}`);
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
        reject('❌ The psql command was not found. Please make sure PostgreSQL client tools are installed.');
      } else {
        reject(`❌ Error executing psql: ${err.message}`);
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

// Function to create a user prompt
function createPrompt(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question(question, answer => {
      rl.close();
      resolve(answer.toLowerCase());
    });
  });
}

// Read SQL file and execute it directly or prompt for manual execution
async function executeSqlFileOrPrompt(filePath, tableName) {
  const sqlContent = fs.readFileSync(filePath, 'utf8');
  
  if (pool) {
    try {
      // Try to execute SQL directly
      await executeSqlDirect(sqlContent);
      console.log(`✅ ${tableName} table created or updated successfully.`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to execute SQL for ${tableName} table:`, error.message);
      console.log('Falling back to manual execution...');
    }
  }
  
  // If direct execution fails or pool is not available, fall back to manual mode
  console.log(`⚠️ Creating ${tableName} table...`);
  console.log('Please run this SQL in the Supabase SQL editor:');
  console.log(sqlContent);
  
  const answer = await createPrompt(`Have you created the ${tableName} table in the Supabase dashboard? (yes/no): `);
  
  if (answer !== 'yes') {
    console.error(`❌ Please create the ${tableName} table before continuing.`);
    return false;
  }
  
  console.log(`✅ ${tableName} table created successfully.`);
  return true;
}

// Database Migration Tasks
const migrationTasks = {
  async createCoursesTable() {
    console.log('📊 Setting up courses table...');
    
    // First check if the table exists
    const { data: existingTable, error: tableCheckError } = await supabase
      .from('courses')
      .select('id')
      .limit(1);
    
    if (tableCheckError) {
      // Table doesn't exist, create it
      return executeSqlFileOrPrompt(path.join(__dirname, '../create-courses-table.sql'), 'courses');
    } else {
      console.log('✅ Courses table already exists.');
      return true;
    }
  },
  
  async createStudentsTable() {
    console.log('📊 Setting up students table...');
    
    // Check if the table exists
    const { data: existingTable, error: tableCheckError } = await supabase
      .from('students')
      .select('id')
      .limit(1);
    
    if (tableCheckError) {
      // Table doesn't exist, create it
      return executeSqlFileOrPrompt(path.join(__dirname, '../create-students-table.sql'), 'students');
    } else {
      console.log('✅ Students table already exists.');
      return true;
    }
  },
  
  async setupProgramStructure() {
    console.log('📊 Setting up program structure...');
    
    // Check if program_structure table exists with basket column
    const { data: existingTable, error: tableCheckError } = await supabase
      .from('program_structure')
      .select('id, basket')
      .limit(1);
    
    if (tableCheckError || (existingTable && existingTable.length > 0 && !existingTable[0].basket)) {
      // Table doesn't exist or doesn't have basket column, create/recreate it
      console.log('⚠️ Program structure table needs to be updated with basket column...');
      return executeSqlFileOrPrompt(path.join(__dirname, '../setup-program-structure.sql'), 'program_structure');
    } else {
      console.log('✅ Program structure table already exists with basket column.');
      return true;
    }
  },
  
  async updateCourseStructureIds() {
    console.log('🔄 Updating course structure IDs...');
    
    try {
      // Get all courses without a structure_id
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('id, vertical, basket, semester')
        .is('structure_id', null)
        .limit(500);
      
      if (coursesError) {
        console.error('❌ Error fetching courses:', coursesError.message);
        return false;
      }
      
      if (!courses || courses.length === 0) {
        console.log('✅ No courses need updating. All courses have structure_ids already.');
        return true;
      }
      
      console.log(`🔄 Found ${courses.length} courses without structure_id.`);
      
      // Get all program structures
      const { data: structures, error: structuresError } = await supabase
        .from('program_structure')
        .select('id, vertical, basket, semester');
      
      if (structuresError) {
        console.error('❌ Error fetching program structures:', structuresError.message);
        return false;
      }
      
      // Create a map for easy lookup
      const structureMap = {};
      structures.forEach(s => {
        const key = `${s.vertical}-${s.basket}-${s.semester}`;
        structureMap[key] = s.id;
      });
      
      // Update each course with the matching structure_id
      let updatedCount = 0;
      let failedCount = 0;
      
      for (const course of courses) {
        const key = `${course.vertical}-${course.basket}-${course.semester}`;
        const structureId = structureMap[key];
        
        if (structureId) {
          const { error: updateError } = await supabase
            .from('courses')
            .update({ structure_id: structureId })
            .eq('id', course.id);
          
          if (updateError) {
            console.error(`❌ Error updating course ${course.id}:`, updateError.message);
            failedCount++;
          } else {
            updatedCount++;
          }
        } else {
          console.warn(`⚠️ No matching program structure found for vertical: ${course.vertical}, basket: ${course.basket}, semester: ${course.semester}`);
          failedCount++;
        }
      }
      
      console.log(`✅ Updated structure_id for ${updatedCount} courses, ${failedCount} failed.`);
      
      // Verify the update
      const { data: verifyData, error: queryError } = await supabase
        .from('courses')
        .select('id, course_code, vertical, basket, semester, structure_id')
        .not('structure_id', 'is', null)
        .limit(5);
      
      if (queryError) {
        console.error('❌ Error querying updated courses:', queryError.message);
      } else if (verifyData && verifyData.length > 0) {
        console.log('✅ Sample of updated courses:');
        console.table(verifyData.map(c => ({
          id: c.id,
          code: c.course_code,
          vertical: c.vertical,
          basket: c.basket,
          semester: c.semester,
          structure_id: c.structure_id
        })));
      }
      
      return updatedCount > 0 || courses.length === 0;
    } catch (err) {
      console.error('❌ Unexpected error:', err.message);
      return false;
    }
  },

  async createBasketCreditsView() {
    console.log('📊 Setting up basket credits view...');
    
    // Try to query the view to see if it exists
    const { data: viewData, error: viewError } = await supabase
      .from('basket_credits')
      .select('vertical, basket')
      .limit(1);
    
    if (viewError) {
      // View doesn't exist, create it
      return executeSqlFileOrPrompt(path.join(__dirname, '../create-basket-credits-view.sql'), 'basket_credits view');
    } else {
      console.log('✅ Basket credits view already exists.');
      return true;
    }
  }
};

// Main migration function - for programmatic use
async function runMigrations({ interactive = true, forceContinue = false } = {}) {
  console.log('🚀 Starting database migrations...');
  
  let tasksSucceeded = 0;
  const totalTasks = Object.keys(migrationTasks).length;
  
  try {
    // Create courses table
    if (await migrationTasks.createCoursesTable() || forceContinue) {
      tasksSucceeded++;
    } else if (!forceContinue) {
      throw new Error('Failed to create courses table');
    }
    
    // Create students table
    if (await migrationTasks.createStudentsTable() || forceContinue) {
      tasksSucceeded++;
    } else if (!forceContinue) {
      throw new Error('Failed to create students table');
    }
    
    // Setup program structure
    if (await migrationTasks.setupProgramStructure() || forceContinue) {
      tasksSucceeded++;
    } else if (!forceContinue) {
      throw new Error('Failed to set up program structure');
    }
    
    // Update course structure IDs
    if (await migrationTasks.updateCourseStructureIds() || forceContinue) {
      tasksSucceeded++;
    } else if (!forceContinue) {
      throw new Error('Failed to update course structure IDs');
    }

    // Create basket credits view
    if (await migrationTasks.createBasketCreditsView() || forceContinue) {
      tasksSucceeded++;
    } else if (!forceContinue) {
      throw new Error('Failed to create basket credits view');
    }
    
    console.log(`✅ Migration completed: ${tasksSucceeded}/${totalTasks} tasks successful.`);
    return true;
  } catch (error) {
    console.error(`❌ Migration failed: ${error.message}`);
    console.log(`${tasksSucceeded}/${totalTasks} tasks completed successfully.`);
    if (!interactive) {
      throw error;
    }
    return false;
  }
}

// Run migrations if called directly (via CLI)
if (require.main === module) {
  // Parse CLI args for any options
  const args = process.argv.slice(2);
  const forceContinue = args.includes('--force');
  
  runMigrations({ interactive: true, forceContinue })
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(err => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}

// Export for programmatic use
module.exports = {
  runMigrations,
  migrationTasks
};