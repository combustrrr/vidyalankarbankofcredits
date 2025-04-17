#!/usr/bin/env node
/**
 * Setup Basket Credits
 * 
 * This script sets up the basket credits table in Supabase based on program-structure.ts
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('Setting up basket credits in Supabase...');

// Path to SQL file
const sqlFile = path.join(__dirname, 'create-basket-credits-table.sql');

// Check if file exists
if (!fs.existsSync(sqlFile)) {
  console.error('Error: SQL file not found:', sqlFile);
  process.exit(1);
}

try {
  // Run the SQL file against Supabase
  console.log('Applying basket credits SQL migration...');
  execSync(`npx supabase db push ${sqlFile}`, { stdio: 'inherit' });
  
  console.log('Basket credits table setup complete!');
  console.log('You can now view basket credits data in the admin dashboard.');
} catch (error) {
  console.error('Error setting up basket credits:', error.message);
  process.exit(1);
}