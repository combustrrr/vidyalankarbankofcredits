#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const sampleAdmins = [
  {
    username: 'university_admin',
    email: 'university.admin@vidyalankar.edu.in',
    password: 'admin123',
    first_name: 'University',
    last_name: 'Administrator',
    role_code: 'university_admin'
  },
  {
    username: 'dept_admin',
    email: 'dept.admin@vidyalankar.edu.in',
    password: 'admin123',
    first_name: 'Department',
    last_name: 'Administrator',
    role_code: 'department_admin'
  },
  {
    username: 'academic_coord',
    email: 'academic.coordinator@vidyalankar.edu.in',
    password: 'admin123',
    first_name: 'Academic',
    last_name: 'Coordinator', 
    role_code: 'academic_coordinator'
  },
  {
    username: 'student_affairs',
    email: 'student.affairs@vidyalankar.edu.in',
    password: 'admin123',
    first_name: 'Student Affairs',
    last_name: 'Officer',
    role_code: 'student_affairs'
  },
  {
    username: 'report_viewer',
    email: 'reports@vidyalankar.edu.in',
    password: 'admin123',
    first_name: 'Report',
    last_name: 'Viewer',
    role_code: 'report_viewer'
  }
];

async function createSampleAdmins() {
  console.log('🚀 Creating sample admin accounts for all roles...\n');

  // First, get all roles to map role codes to IDs
  const { data: roles, error: rolesError } = await supabase
    .from('admin_roles')
    .select('id, role_code, role_name');

  if (rolesError) {
    console.error('❌ Error fetching roles:', rolesError.message);
    return;
  }

  console.log('📋 Available roles:');
  roles.forEach(role => {
    console.log(`   - ${role.role_name} (${role.role_code})`);
  });
  console.log('');

  // Create role mapping
  const roleMap = {};
  roles.forEach(role => {
    roleMap[role.role_code] = { id: role.id, name: role.role_name };
  });

  // Check existing admins
  const { data: existingAdmins, error: existingError } = await supabase
    .from('admins')
    .select('username, email');

  const existingUsernames = existingAdmins?.map(admin => admin.username) || [];
  const existingEmails = existingAdmins?.map(admin => admin.email) || [];

  let createdCount = 0;
  let skippedCount = 0;

  for (const adminData of sampleAdmins) {
    try {
      console.log(`👤 Processing ${adminData.username}...`);

      // Check if admin already exists
      if (existingUsernames.includes(adminData.username) || existingEmails.includes(adminData.email)) {
        console.log(`   ⚠️  Skipped (already exists): ${adminData.username}`);
        skippedCount++;
        continue;
      }

      // Get role ID
      const roleInfo = roleMap[adminData.role_code];
      if (!roleInfo) {
        console.log(`   ❌ Skipped (invalid role): ${adminData.role_code}`);
        continue;
      }

      // Hash password
      const passwordHash = await bcrypt.hash(adminData.password, 12);

      // Create admin
      const { data: newAdmin, error: createError } = await supabase
        .from('admins')
        .insert({
          username: adminData.username,
          email: adminData.email,
          password_hash: passwordHash,
          first_name: adminData.first_name,
          last_name: adminData.last_name,
          full_name: `${adminData.first_name} ${adminData.last_name}`,
          admin_role_id: roleInfo.id,
          is_active: true,
          is_verified: true
        })
        .select()
        .single();

      if (createError) {
        console.log(`   ❌ Error creating ${adminData.username}:`, createError.message);
        continue;
      }

      console.log(`   ✅ Created: ${adminData.username} (${roleInfo.name})`);
      createdCount++;

    } catch (error) {
      console.log(`   ❌ Error processing ${adminData.username}:`, error.message);
    }
  }

  console.log('\n📊 Summary:');
  console.log(`   ✅ Created: ${createdCount} admins`);
  console.log(`   ⚠️  Skipped: ${skippedCount} admins`);
  
  // Display final admin list
  console.log('\n👥 All Admin Accounts:');
  const { data: allAdmins } = await supabase
    .from('admins')
    .select(`
      username,
      email,
      full_name,
      is_active,
      admin_roles (role_name, role_code)
    `)
    .order('username');

  if (allAdmins) {
    allAdmins.forEach(admin => {
      const status = admin.is_active ? '🟢' : '🔴';
      console.log(`   ${status} ${admin.username} - ${admin.admin_roles?.role_name} (${admin.email})`);
    });
  }

  console.log('\n🔑 Test Credentials:');
  console.log('   Username: superadmin | Password: admin123 (Super Administrator)');
  console.log('   Username: university_admin | Password: admin123 (University Administrator)');
  console.log('   Username: dept_admin | Password: admin123 (Department Administrator)');
  console.log('   Username: academic_coord | Password: admin123 (Academic Coordinator)');
  console.log('   Username: student_affairs | Password: admin123 (Student Affairs Officer)');
  console.log('   Username: report_viewer | Password: admin123 (Report Viewer)');

  console.log('\n🎉 Sample admin creation completed!');
}

// Run the script
createSampleAdmins().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
