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
      console.log('⚠️ Creating courses table...');
      console.log('Please run this SQL in the Supabase SQL editor:');
      
      const sqlContent = fs.readFileSync(path.join(__dirname, '../create-courses-table.sql'), 'utf8');
      console.log(sqlContent);
      
      const answer = await createPrompt('Have you created the courses table in the Supabase dashboard? (yes/no): ');
      
      if (answer !== 'yes') {
        console.error('❌ Please create the table before continuing.');
        return false;
      }
      
      console.log('✅ Courses table created successfully.');
    } else {
      console.log('✅ Courses table already exists.');
    }
    
    return true;
  },
  
  async setupProgramStructure() {
    console.log('📊 Setting up program structure...');
    
    // Check if program_structure table exists
    const { data: existingTable, error: tableCheckError } = await supabase
      .from('program_structure')
      .select('id')
      .limit(1);
    
    if (tableCheckError) {
      console.log('⚠️ Creating program structure table...');
      console.log('Please run this SQL in the Supabase SQL editor:');
      
      const sqlContent = fs.readFileSync(path.join(__dirname, '../setup-program-structure.sql'), 'utf8');
      console.log(sqlContent);
      
      const answer = await createPrompt('Have you created the program_structure table in the Supabase dashboard? (yes/no): ');
      
      if (answer !== 'yes') {
        console.error('❌ Please create the table before continuing.');
        return false;
      }
    } else {
      console.log('✅ Program structure table already exists.');
    }
    
    // Insert or update program structure data
    console.log('📊 Inserting program structure data...');
    
    // Define program structure data from config.ts
    const verticals = [
      // BSC/ ESC Vertical
      { vertical: 'BSC/ ESC', semester: 1, recommended_credits: 12 },
      { vertical: 'BSC/ ESC', semester: 2, recommended_credits: 9 },
      { vertical: 'BSC/ ESC', semester: 3, recommended_credits: 3 },
      { vertical: 'BSC/ ESC', semester: 4, recommended_credits: 3 },
      { vertical: 'BSC/ ESC', semester: 5, recommended_credits: 0 },
      { vertical: 'BSC/ ESC', semester: 6, recommended_credits: 0 },
      { vertical: 'BSC/ ESC', semester: 7, recommended_credits: 0 },
      { vertical: 'BSC/ ESC', semester: 8, recommended_credits: 0 },
      
      // Program Courses Vertical
      { vertical: 'Program Courses', semester: 1, recommended_credits: 0 },
      { vertical: 'Program Courses', semester: 2, recommended_credits: 0 },
      { vertical: 'Program Courses', semester: 3, recommended_credits: 9 },
      { vertical: 'Program Courses', semester: 4, recommended_credits: 12 },
      { vertical: 'Program Courses', semester: 5, recommended_credits: 15 },
      { vertical: 'Program Courses', semester: 6, recommended_credits: 15 },
      { vertical: 'Program Courses', semester: 7, recommended_credits: 12 },
      { vertical: 'Program Courses', semester: 8, recommended_credits: 0 },
      
      // Multidisciplinary Courses Vertical
      { vertical: 'Multidisciplinary Courses', semester: 1, recommended_credits: 0 },
      { vertical: 'Multidisciplinary Courses', semester: 2, recommended_credits: 2 },
      { vertical: 'Multidisciplinary Courses', semester: 3, recommended_credits: 3 },
      { vertical: 'Multidisciplinary Courses', semester: 4, recommended_credits: 3 },
      { vertical: 'Multidisciplinary Courses', semester: 5, recommended_credits: 6 },
      { vertical: 'Multidisciplinary Courses', semester: 6, recommended_credits: 3 },
      { vertical: 'Multidisciplinary Courses', semester: 7, recommended_credits: 5 },
      { vertical: 'Multidisciplinary Courses', semester: 8, recommended_credits: 0 },
      
      // Skill Courses Vertical
      { vertical: 'Skill Courses', semester: 1, recommended_credits: 3 },
      { vertical: 'Skill Courses', semester: 2, recommended_credits: 3 },
      { vertical: 'Skill Courses', semester: 3, recommended_credits: 2 },
      { vertical: 'Skill Courses', semester: 4, recommended_credits: 0 },
      { vertical: 'Skill Courses', semester: 5, recommended_credits: 0 },
      { vertical: 'Skill Courses', semester: 6, recommended_credits: 0 },
      { vertical: 'Skill Courses', semester: 7, recommended_credits: 0 },
      { vertical: 'Skill Courses', semester: 8, recommended_credits: 0 },
      
      // HSSM Vertical
      { vertical: 'Humanities Social Science and Management (HSSM)', semester: 1, recommended_credits: 6 },
      { vertical: 'Humanities Social Science and Management (HSSM)', semester: 2, recommended_credits: 3 },
      { vertical: 'Humanities Social Science and Management (HSSM)', semester: 3, recommended_credits: 0 },
      { vertical: 'Humanities Social Science and Management (HSSM)', semester: 4, recommended_credits: 0 },
      { vertical: 'Humanities Social Science and Management (HSSM)', semester: 5, recommended_credits: 3 },
      { vertical: 'Humanities Social Science and Management (HSSM)', semester: 6, recommended_credits: 3 },
      { vertical: 'Humanities Social Science and Management (HSSM)', semester: 7, recommended_credits: 3 },
      { vertical: 'Humanities Social Science and Management (HSSM)', semester: 8, recommended_credits: 3 },
      
      // Experiential Learning Courses Vertical
      { vertical: 'Experiential Learning Courses', semester: 1, recommended_credits: 0 },
      { vertical: 'Experiential Learning Courses', semester: 2, recommended_credits: 0 },
      { vertical: 'Experiential Learning Courses', semester: 3, recommended_credits: 0 },
      { vertical: 'Experiential Learning Courses', semester: 4, recommended_credits: 0 },
      { vertical: 'Experiential Learning Courses', semester: 5, recommended_credits: 2 },
      { vertical: 'Experiential Learning Courses', semester: 6, recommended_credits: 4 },
      { vertical: 'Experiential Learning Courses', semester: 7, recommended_credits: 2 },
      { vertical: 'Experiential Learning Courses', semester: 8, recommended_credits: 9 },
      
      // Liberal Learning Courses Vertical
      { vertical: 'Liberal Learning Courses', semester: 1, recommended_credits: 0 },
      { vertical: 'Liberal Learning Courses', semester: 2, recommended_credits: 2 },
      { vertical: 'Liberal Learning Courses', semester: 3, recommended_credits: 2 },
      { vertical: 'Liberal Learning Courses', semester: 4, recommended_credits: 0 },
      { vertical: 'Liberal Learning Courses', semester: 5, recommended_credits: 0 },
      { vertical: 'Liberal Learning Courses', semester: 6, recommended_credits: 0 },
      { vertical: 'Liberal Learning Courses', semester: 7, recommended_credits: 0 },
      { vertical: 'Liberal Learning Courses', semester: 8, recommended_credits: 0 }
    ];
    
    let successCount = 0;
    let errorCount = 0;
    
    // Insert each structure with upsert operation
    for (const structure of verticals) {
      const { error } = await supabase
        .from('program_structure')
        .upsert([structure], {
          onConflict: 'vertical,semester',
          ignoreDuplicates: false
        });
      
      if (error) {
        console.error(`❌ Error inserting program structure for ${structure.vertical} semester ${structure.semester}:`, error.message);
        errorCount++;
      } else {
        successCount++;
      }
    }
    
    console.log(`✅ Program structure data updated: ${successCount} successful, ${errorCount} failed.`);
    return errorCount === 0;
  },
  
  async updateCourseStructureIds() {
    console.log('🔄 Updating course structure IDs...');
    
    try {
      // Get all courses without a structure_id
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('id, vertical, semester')
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
        .select('id, vertical, semester');
      
      if (structuresError) {
        console.error('❌ Error fetching program structures:', structuresError.message);
        return false;
      }
      
      // Create a map for easy lookup
      const structureMap = {};
      structures.forEach(s => {
        const key = `${s.vertical}-${s.semester}`;
        structureMap[key] = s.id;
      });
      
      // Update each course with the matching structure_id
      let updatedCount = 0;
      let failedCount = 0;
      
      for (const course of courses) {
        const key = `${course.vertical}-${course.semester}`;
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
          console.warn(`⚠️ No matching program structure found for vertical: ${course.vertical}, semester: ${course.semester}`);
          failedCount++;
        }
      }
      
      console.log(`✅ Updated structure_id for ${updatedCount} courses, ${failedCount} failed.`);
      
      // Verify the update
      const { data: verifyData, error: queryError } = await supabase
        .from('courses')
        .select('id, course_code, vertical, semester, structure_id')
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
          semester: c.semester,
          structure_id: c.structure_id
        })));
      }
      
      return updatedCount > 0 || courses.length === 0;
    } catch (err) {
      console.error('❌ Unexpected error:', err.message);
      return false;
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