#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function comprehensiveVerification() {
  console.log('🔍 COMPREHENSIVE ADMIN SYSTEM VERIFICATION\n');
  
  try {
    // 1. Check all admin roles
    console.log('📋 1. CHECKING ADMIN ROLES:');
    const { data: roles, error: rolesError } = await supabase
      .from('admin_roles')
      .select('*')
      .order('role_code');
    
    if (rolesError) {
      console.error('❌ Error fetching roles:', rolesError.message);
      return;
    }
    
    console.log(`   ✅ Total roles found: ${roles.length}`);
    roles.forEach(role => {
      console.log(`   - ${role.role_name} (${role.role_code}) - Active: ${role.is_active}`);
    });
    
    // 2. Check all admin users
    console.log('\n👥 2. CHECKING ADMIN USERS:');
    const { data: admins, error: adminsError } = await supabase
      .from('admins')
      .select(`
        id,
        username,
        email,
        full_name,
        is_active,
        admin_role_id,
        admin_roles (
          role_name,
          role_code
        )
      `)
      .order('username');
    
    if (adminsError) {
      console.error('❌ Error fetching admins:', adminsError.message);
      return;
    }
    
    console.log(`   ✅ Total admin users: ${admins.length}`);
    
    // Group admins by role
    const adminsByRole = {};
    const expectedRoles = ['super_admin', 'university_admin', 'department_admin', 'academic_coordinator', 'student_affairs', 'report_viewer'];
    
    expectedRoles.forEach(roleCode => {
      adminsByRole[roleCode] = [];
    });
    
    admins.forEach(admin => {
      const roleCode = admin.admin_roles?.role_code || 'unknown';
      if (!adminsByRole[roleCode]) {
        adminsByRole[roleCode] = [];
      }
      adminsByRole[roleCode].push(admin);
    });
    
    expectedRoles.forEach(roleCode => {
      const roleUsers = adminsByRole[roleCode];
      const roleName = roles.find(r => r.role_code === roleCode)?.role_name || 'Unknown Role';
      
      if (roleUsers.length === 0) {
        console.log(`   ❌ ${roleName} (${roleCode}): NO USERS`);
      } else {
        console.log(`   ✅ ${roleName} (${roleCode}): ${roleUsers.length} user(s)`);
        roleUsers.forEach(user => {
          const status = user.is_active ? '🟢' : '🔴';
          console.log(`      ${status} ${user.username} (${user.email})`);
        });
      }
    });
    
    // 3. Check permissions
    console.log('\n🔑 3. CHECKING PERMISSIONS SYSTEM:');
    const { data: permissions, error: permError } = await supabase
      .from('admin_permissions')
      .select('*')
      .order('category', { ascending: true });
    
    if (permError) {
      console.error('❌ Error fetching permissions:', permError.message);
      return;
    }
    
    console.log(`   ✅ Total permissions: ${permissions.length}`);
    
    // Group permissions by category
    const permsByCategory = {};
    permissions.forEach(perm => {
      if (!permsByCategory[perm.category]) {
        permsByCategory[perm.category] = [];
      }
      permsByCategory[perm.category].push(perm);
    });
    
    Object.keys(permsByCategory).forEach(category => {
      console.log(`   📂 ${category.toUpperCase()}: ${permsByCategory[category].length} permissions`);
      permsByCategory[category].slice(0, 3).forEach(perm => {
        console.log(`      - ${perm.permission_name} (${perm.permission_code})`);
      });
      if (permsByCategory[category].length > 3) {
        console.log(`      ... and ${permsByCategory[category].length - 3} more`);
      }
    });
    
    // 4. Check role-permission mappings
    console.log('\n🔗 4. CHECKING ROLE-PERMISSION MAPPINGS:');
    const { data: rolePerm, error: rolePermError } = await supabase
      .from('admin_role_permissions')
      .select(`
        admin_roles (role_name, role_code),
        admin_permissions (permission_name, permission_code)
      `);
    
    if (rolePermError) {
      console.error('❌ Error fetching role permissions:', rolePermError.message);
      return;
    }
    
    const permissionsByRole = {};
    rolePerm.forEach(rp => {
      const roleCode = rp.admin_roles?.role_code;
      if (!permissionsByRole[roleCode]) {
        permissionsByRole[roleCode] = [];
      }
      permissionsByRole[roleCode].push(rp.admin_permissions?.permission_code);
    });
    
    expectedRoles.forEach(roleCode => {
      const roleName = roles.find(r => r.role_code === roleCode)?.role_name || 'Unknown';
      const rolePermissions = permissionsByRole[roleCode] || [];
      console.log(`   ${roleCode === 'super_admin' ? '👑' : '📝'} ${roleName}: ${rolePermissions.length} permissions`);
      if (rolePermissions.length > 0) {
        console.log(`      Key permissions: ${rolePermissions.slice(0, 3).join(', ')}${rolePermissions.length > 3 ? '...' : ''}`);
      }
    });
    
    // 5. Generate test credentials summary
    console.log('\n🔑 5. TEST CREDENTIALS FOR ALL ROLES:');
    console.log('   Use these credentials to test different role interfaces:');
    console.log('   ');
    
    expectedRoles.forEach(roleCode => {
      const roleUsers = adminsByRole[roleCode];
      const roleName = roles.find(r => r.role_code === roleCode)?.role_name || 'Unknown';
      
      if (roleUsers.length > 0) {
        const user = roleUsers[0]; // Get first user for this role
        console.log(`   🔐 ${roleName}:`);
        console.log(`      Username: ${user.username}`);
        console.log(`      Password: admin123`);
        console.log(`      Email: ${user.email}`);
        console.log('   ');
      } else {
        console.log(`   ❌ ${roleName}: NO ACCOUNT AVAILABLE`);
        console.log('   ');
      }
    });
    
    // 6. Role coverage analysis
    console.log('📊 6. ROLE COVERAGE ANALYSIS:');
    const totalExpectedRoles = expectedRoles.length;
    const rolesWithUsers = expectedRoles.filter(roleCode => adminsByRole[roleCode].length > 0).length;
    const coverage = Math.round((rolesWithUsers / totalExpectedRoles) * 100);
    
    console.log(`   ✅ Roles implemented: ${roles.length}/${totalExpectedRoles}`);
    console.log(`   👥 Roles with users: ${rolesWithUsers}/${totalExpectedRoles} (${coverage}%)`);
    console.log(`   🔑 Total permissions: ${permissions.length}`);
    console.log(`   🔗 Role-permission mappings: ${rolePerm.length}`);
    
    if (coverage === 100) {
      console.log('\n🎉 SUCCESS: All 6 admin roles have user accounts!');
    } else {
      console.log(`\n⚠️  INCOMPLETE: ${totalExpectedRoles - rolesWithUsers} roles missing user accounts`);
    }
    
    // 7. Next steps
    console.log('\n📝 NEXT STEPS TO VERIFY:');
    console.log('   1. Test login with each role\'s credentials');
    console.log('   2. Verify role-specific dashboard content');
    console.log('   3. Check permission-based UI element visibility');
    console.log('   4. Test admin management interface (superadmin only)');
    console.log('   5. Verify role-specific API access restrictions');
    
  } catch (error) {
    console.error('❌ Fatal error during verification:', error);
  }
}

// Run the verification
comprehensiveVerification().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
