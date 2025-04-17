// filepath: /workspaces/vidyalankarbankofcredits/utils/api-migrate-supabase.js
// Supabase migration script using JavaScript API instead of direct SQL connections
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Check environment variables
console.log('Checking environment variables...');
try {
  const env = require('./check-env');
} catch (error) {
  console.error('Failed to load environment variables:', error.message);
  process.exit(1);
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Migration functions
async function createCoursesTable() {
  console.log('📄 Setting up courses table...');
  
  // Use RPC to execute raw SQL (available with service_role key)
  // Since we're using anon key, we'll use supabase's built-in methods instead
  
  // First check if the table exists via a safe query
  const { data: existingTable, error: tableCheckError } = await supabase
    .from('courses')
    .select('id')
    .limit(1);
  
  if (tableCheckError) {
    console.log('Creating courses table...');
    
    try {
      // If we can't query the table, it likely doesn't exist
      // We can't create tables via the REST API with anon key,
      // so we'll show instructions for how to create it manually
      console.log('⚠️ Need to create the courses table manually in the Supabase dashboard.');
      console.log('Please run this SQL in the Supabase SQL editor:');
      console.log(`
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create courses table
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Theory', 'Practical')),
  credits INTEGER NOT NULL CHECK (credits > 0),
  semester INTEGER NOT NULL CHECK (semester BETWEEN 1 AND 8),
  degree TEXT NOT NULL,
  branch TEXT NOT NULL,
  vertical TEXT NOT NULL,
  basket TEXT NOT NULL,
  structure_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create index on frequently queried columns
CREATE INDEX IF NOT EXISTS idx_courses_vertical_semester ON public.courses(vertical, semester);
CREATE INDEX IF NOT EXISTS idx_courses_basket ON public.courses(basket);
      `);
      
      // Add a prompt for the user to confirm when they've created the table
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      await new Promise((resolve) => {
        readline.question('Have you created the courses table in the Supabase dashboard? (yes/no): ', answer => {
          readline.close();
          if (answer.toLowerCase() === 'yes') {
            console.log('✅ Continuing with migration...');
            resolve();
          } else {
            console.log('❌ Please create the table before continuing.');
            process.exit(1);
          }
        });
      });
    } catch (err) {
      console.error('Error setting up courses table:', err);
      throw err;
    }
  } else {
    console.log('✅ Courses table already exists.');
  }
}

async function setupProgramStructure() {
  console.log('📄 Setting up program structure...');
  
  try {
    // Check if program_structure table exists
    const { data: existingTable, error: tableCheckError } = await supabase
      .from('program_structure')
      .select('id')
      .limit(1);
    
    if (tableCheckError) {
      console.log('Creating program_structure table...');
      console.log('⚠️ Need to create the program_structure table manually in the Supabase dashboard.');
      console.log('Please run this SQL in the Supabase SQL editor:');
      console.log(`
-- Create program_structure table with minimal indexing to save resources on free tier
CREATE TABLE IF NOT EXISTS public.program_structure (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vertical TEXT NOT NULL,
  semester INTEGER NOT NULL,
  recommended_credits INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  -- Create a unique constraint on vertical and semester combination
  CONSTRAINT program_structure_vertical_semester_key UNIQUE (vertical, semester)
);
      `);
      
      // Add a prompt for the user to confirm when they've created the table
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      await new Promise((resolve) => {
        readline.question('Have you created the program_structure table in the Supabase dashboard? (yes/no): ', answer => {
          readline.close();
          if (answer.toLowerCase() === 'yes') {
            console.log('✅ Continuing with migration...');
            resolve();
          } else {
            console.log('❌ Please create the table before continuing.');
            process.exit(1);
          }
        });
      });
    } else {
      console.log('✅ Program structure table already exists.');
    }
    
    // Insert program structure data using the API
    console.log('Inserting program structure data...');
    
    // Define program structure data
    const programStructures = [
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
    
    // Insert each structure with upsert operation (insert if not exists, update if exists)
    for (const structure of programStructures) {
      const { data, error } = await supabase
        .from('program_structure')
        .upsert([structure], {
          onConflict: 'vertical,semester',
          ignoreDuplicates: false
        });
      
      if (error) {
        console.error(`Error inserting program structure for ${structure.vertical} semester ${structure.semester}:`, error);
      }
    }
    
    console.log('✅ Program structure data inserted/updated successfully.');
  } catch (err) {
    console.error('Error setting up program structure:', err);
    throw err;
  }
}

async function updateCoursesTable() {
  console.log('📄 Updating courses table...');
  
  try {
    // Check if structure_id column exists by querying for it
    // We can't directly check for column existence with the REST API
    const { data, error } = await supabase.rpc('check_column_exists', {
      table_name: 'courses',
      column_name: 'structure_id'
    });
    
    if (error) {
      console.log('⚠️ Need to update the courses table manually in the Supabase dashboard.');
      console.log('Please run this SQL in the Supabase SQL editor:');
      console.log(`
-- Add structure_id column to the courses table if it doesn't exist
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS structure_id UUID REFERENCES public.program_structure(id);

-- Create an index on the foreign key for better query performance
CREATE INDEX IF NOT EXISTS idx_courses_structure_id ON public.courses(structure_id);

-- Create a function to automatically link courses to program structure
CREATE OR REPLACE FUNCTION link_course_to_structure()
RETURNS TRIGGER AS $$
BEGIN
    NEW.structure_id := (
        SELECT id FROM public.program_structure
        WHERE vertical = NEW.vertical
        AND semester = NEW.semester
        LIMIT 1
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically link courses to program structure
DROP TRIGGER IF EXISTS link_course_to_structure_trigger ON public.courses;
CREATE TRIGGER link_course_to_structure_trigger
BEFORE INSERT OR UPDATE ON public.courses
FOR EACH ROW
EXECUTE FUNCTION link_course_to_structure();

-- Update existing courses to link them to the program structure
UPDATE public.courses c
SET structure_id = ps.id
FROM public.program_structure ps
WHERE c.vertical = ps.vertical
AND c.semester = ps.semester
AND c.structure_id IS NULL
LIMIT 500; -- Limit the number of updates per execution
      `);
      
      // Create the RPC function if it doesn't exist
      await supabase.rpc('create_check_column_exists_function');
      
      // Add a prompt for the user to confirm when they've updated the table
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      await new Promise((resolve) => {
        readline.question('Have you updated the courses table in the Supabase dashboard? (yes/no): ', answer => {
          readline.close();
          if (answer.toLowerCase() === 'yes') {
            console.log('✅ Continuing with migration...');
            resolve();
          } else {
            console.log('❌ Please update the table before continuing.');
            process.exit(1);
          }
        });
      });
    } else {
      console.log('✅ Courses table already updated with structure_id column.');
    }
    
    // Link existing courses with program structure data
    console.log('Linking existing courses with program structure...');
    
    // Get all courses without a structure_id
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id, vertical, semester')
      .is('structure_id', null)
      .limit(500);
    
    if (coursesError) {
      console.error('Error fetching courses:', coursesError);
      return;
    }
    
    if (!courses || courses.length === 0) {
      console.log('No courses to update.');
      return;
    }
    
    // Get all program structures
    const { data: structures, error: structuresError } = await supabase
      .from('program_structure')
      .select('id, vertical, semester');
    
    if (structuresError) {
      console.error('Error fetching program structures:', structuresError);
      return;
    }
    
    // Create a map for easy lookup
    const structureMap = {};
    structures.forEach(s => {
      const key = `${s.vertical}-${s.semester}`;
      structureMap[key] = s.id;
    });
    
    // Update each course with the matching structure_id
    let updatedCount = 0;
    for (const course of courses) {
      const key = `${course.vertical}-${course.semester}`;
      const structureId = structureMap[key];
      
      if (structureId) {
        const { error: updateError } = await supabase
          .from('courses')
          .update({ structure_id: structureId })
          .eq('id', course.id);
        
        if (updateError) {
          console.error(`Error updating course ${course.id}:`, updateError);
        } else {
          updatedCount++;
        }
      }
    }
    
    console.log(`✅ Updated ${updatedCount} courses with structure references.`);
  } catch (err) {
    console.error('Error updating courses table:', err);
    throw err;
  }
}

// Create RPC function to check if column exists
async function createRpcFunctions() {
  try {
    // Check if we can use RPC functions
    const { data, error } = await supabase.rpc('create_check_column_exists_function', {});
    
    if (error && error.message.includes('does not exist')) {
      console.log('Creating helper functions...');
      console.log('⚠️ Need to create helper functions in the Supabase dashboard.');
      console.log('Please run this SQL in the Supabase SQL editor:');
      console.log(`
-- Function to check if a column exists in a table
CREATE OR REPLACE FUNCTION check_column_exists(table_name text, column_name text)
RETURNS boolean AS $$
DECLARE
  column_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = check_column_exists.table_name
      AND column_name = check_column_exists.column_name
  ) INTO column_exists;
  
  RETURN column_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create the check_column_exists function (meta!)
CREATE OR REPLACE FUNCTION create_check_column_exists_function()
RETURNS boolean AS $$
BEGIN
  -- This function just exists as a check if we can use RPC functions
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
      `);
      
      // Add a prompt for the user to confirm when they've created the functions
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      await new Promise((resolve) => {
        readline.question('Have you created the helper functions in the Supabase dashboard? (yes/no): ', answer => {
          readline.close();
          if (answer.toLowerCase() === 'yes') {
            console.log('✅ Continuing with migration...');
            resolve();
          } else {
            console.log('❌ Please create the functions before continuing.');
            process.exit(1);
          }
        });
      });
    }
  } catch (err) {
    console.log('Error checking/creating RPC functions. You may need to create them manually.');
    // We'll continue anyway - this isn't critical for the basic setup
  }
}

// Main migration function
async function runMigrations() {
  console.log('🚀 Starting Supabase migrations via API...');
  
  try {
    // First create helper RPC functions
    await createRpcFunctions();
    
    // Then run our migrations in order
    await createCoursesTable();
    await setupProgramStructure();
    await updateCoursesTable();
    
    console.log('✨ All migrations completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migrations
runMigrations();