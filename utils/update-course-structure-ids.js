// This script runs the corrected SQL to update course structure IDs
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Verify environment variables
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateCourseStructureIds() {
  console.log('🔄 Running SQL query to update course structure IDs...');
  
  try {
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'update-courses-table.sql');
    const sqlQueries = fs.readFileSync(sqlFilePath, 'utf8').toString();
    
    // Split the SQL into separate statements
    const statements = sqlQueries.split(';').filter(stmt => stmt.trim().length > 0);
    
    // Execute the last statement (the corrected WITH clause)
    const updateQuery = statements[statements.length - 1];
    console.log('Executing update query:', updateQuery);
    
    // Execute the query directly using Supabase's postgres extension
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql_query: updateQuery 
    });
    
    if (error) {
      // If RPC doesn't exist, we'll try another approach
      console.log('❌ Error executing RPC (this might be expected if the function doesn\'t exist):', error.message);
      console.log('Trying alternative approach...');
      
      // Manual approach: Get courses without structure_id and update them
      console.log('1. Fetching courses without structure_id...');
      const { data: coursesWithoutStructure, error: fetchError } = await supabase
        .from('courses')
        .select('id, vertical, semester')
        .is('structure_id', null)
        .limit(500);
      
      if (fetchError) {
        console.error('❌ Error fetching courses:', fetchError.message);
        return;
      }
      
      console.log(`Found ${coursesWithoutStructure?.length || 0} courses without structure_id`);
      
      if (!coursesWithoutStructure || coursesWithoutStructure.length === 0) {
        console.log('✅ No courses need updating. All courses have structure_ids already.');
        return;
      }
      
      // 2. Get program structure data
      console.log('2. Fetching program structure data...');
      const { data: programStructures, error: structError } = await supabase
        .from('program_structure')
        .select('id, vertical, semester');
      
      if (structError) {
        console.error('❌ Error fetching program structures:', structError.message);
        return;
      }
      
      console.log(`Found ${programStructures?.length || 0} program structures`);
      
      if (!programStructures || programStructures.length === 0) {
        console.error('❌ No program structures found. Please create program structures first.');
        return;
      }
      
      // 3. Match courses with program structures and update them
      console.log('3. Matching courses with program structures and updating...');
      let updatedCount = 0;
      
      // Create a map for quick lookup of program structures
      const structureMap = {};
      programStructures.forEach(ps => {
        const key = `${ps.vertical}-${ps.semester}`;
        structureMap[key] = ps.id;
      });
      
      for (const course of coursesWithoutStructure) {
        const key = `${course.vertical}-${course.semester}`;
        const structureId = structureMap[key];
        
        if (structureId) {
          const { error: updateError } = await supabase
            .from('courses')
            .update({ structure_id: structureId })
            .eq('id', course.id);
          
          if (updateError) {
            console.error(`❌ Error updating course ${course.id}:`, updateError.message);
          } else {
            updatedCount++;
          }
        } else {
          console.warn(`⚠️ No matching program structure found for vertical: ${course.vertical}, semester: ${course.semester}`);
        }
      }
      
      console.log(`✅ Updated structure_id for ${updatedCount} courses`);
    } else {
      console.log('✅ SQL executed successfully:', data);
    }
    
    // 4. Verify the update by querying courses with structure_id
    const { data: verifyData, error: queryError } = await supabase
      .from('courses')
      .select('id, course_code, vertical, semester, structure_id')
      .not('structure_id', 'is', null)
      .limit(5);
      
    if (queryError) {
      console.error('❌ Error querying updated courses:', queryError.message);
      return;
    }
    
    console.log('Sample of updated courses:');
    console.table(verifyData);
    
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
  }
}

// Run the update function
updateCourseStructureIds();