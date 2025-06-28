#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAdmins() {
  console.log('🔍 Checking existing admin accounts...\n');

  // First, check all roles
  const { data: roles, error: rolesError } = await supabase
    .from('admin_roles')
    .select('id, role_code, role_name')
    .order('role_code');

  if (rolesError) {
    console.error('❌ Error fetching roles:', rolesError.message);
    return;
  }

  console.log('📋 Available Admin Roles:');
  roles.forEach(role => {
    console.log(`   - ${role.role_name} (${role.role_code})`);
  });
  console.log('');

  // Check existing admins
  const { data: admins, error: adminsError } = await supabase
    .from('admins')
    .select(`
      username,
      email,
      full_name,
      is_active,
      created_at,
      admin_roles (role_name, role_code)
    `)
    .order('username');

  if (adminsError) {
    console.error('❌ Error fetching admins:', adminsError.message);
    return;
  }

  console.log('👥 Existing Admin Accounts:');
  if (admins && admins.length > 0) {
    admins.forEach(admin => {
      const status = admin.is_active ? '🟢' : '🔴';
      const role = admin.admin_roles?.role_name || 'No Role';
      console.log(`   ${status} ${admin.username} - ${role} (${admin.email})`);
    });
  } else {
    console.log('   ⚠️  No admin accounts found!');
  }

  // Check which roles have admin accounts
  console.log('\n🔍 Role Coverage Analysis:');
  const roleMap = {};
  roles.forEach(role => {
    roleMap[role.role_code] = { name: role.role_name, hasAdmin: false };
  });

  if (admins) {
    admins.forEach(admin => {
      if (admin.admin_roles) {
        roleMap[admin.admin_roles.role_code].hasAdmin = true;
      }
    });
  }

  roles.forEach(role => {
    const coverage = roleMap[role.role_code].hasAdmin ? '✅' : '❌';
    console.log(`   ${coverage} ${role.role_name} (${role.role_code})`);
  });

  console.log('\n📊 Summary:');
  console.log(`   🎯 Total Roles: ${roles.length}`);
  console.log(`   👥 Total Admins: ${admins ? admins.length : 0}`);
  const coveredRoles = Object.values(roleMap).filter(r => r.hasAdmin).length;
  console.log(`   ✅ Roles with Admins: ${coveredRoles}/${roles.length}`);
}

// Run the check
checkAdmins().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
