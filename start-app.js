#!/usr/bin/env node

/**
 * Unified application startup script
 * This script handles:
 * 1. Checking and killing processes using needed ports
 * 2. Setting up the database (running migrations)
 * 3. Starting the full application (both frontend and backend)
 */

const { spawn, exec } = require('child_process');
const readline = require('readline');
const path = require('path');

// ANSI color codes for prettier console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

console.log(`${colors.bright}${colors.cyan}🚀 Starting Vidyalankar Bank of Credits Application...${colors.reset}\n`);

// Step 1: Clear ports
console.log(`${colors.yellow}⏳ Step 1: Checking and cleaning up ports...${colors.reset}`);

const portsToCheck = [3000, 4000, 9229, 9230, 9231, 9232];

// Promise-based port checker and killer
function checkAndKillPorts() {
  console.log(`Checking ports: ${portsToCheck.join(', ')}`);
  
  return new Promise((resolve, reject) => {
    const promises = portsToCheck.map(port => {
      return new Promise((resolvePort) => {
        const command = process.platform === 'win32'
          ? `netstat -ano | findstr :${port}`
          : `lsof -i :${port} | grep LISTEN`;
          
        exec(command, (error, stdout) => {
          if (!stdout || error) {
            console.log(`✅ Port ${port} is free`);
            resolvePort();
            return;
          }
          
          console.log(`Found process using port ${port}. Attempting to kill...`);
          
          try {
            let pid;
            if (process.platform === 'win32') {
              pid = stdout.trim().split(/\s+/).pop();
            } else {
              pid = stdout.trim().split(/\s+/)[1];
            }
            
            if (pid) {
              const killCommand = process.platform === 'win32' 
                ? `taskkill /F /PID ${pid}` 
                : `kill -9 ${pid}`;
                
              exec(killCommand, (err) => {
                if (err) {
                  console.error(`Failed to kill process on port ${port}: ${err.message}`);
                } else {
                  console.log(`✅ Freed port ${port} (killed process ${pid})`);
                }
                resolvePort();
              });
            } else {
              console.log(`⚠️ Could not find PID for process on port ${port}`);
              resolvePort();
            }
          } catch (err) {
            console.error(`Error processing port ${port}: ${err}`);
            resolvePort();
          }
        });
      });
    });
    
    Promise.all(promises)
      .then(() => {
        console.log(`${colors.green}✅ All ports have been checked and freed if necessary${colors.reset}\n`);
        resolve();
      })
      .catch(reject);
  });
}

// Step 2: Run database migrations
function setupDatabase() {
  console.log(`${colors.yellow}⏳ Step 2: Setting up database...${colors.reset}`);
  
  return new Promise((resolve, reject) => {
    const migrate = spawn('node', [path.join(__dirname, 'utils', 'migrate-supabase.js')], {
      stdio: 'inherit',
      env: process.env
    });
    
    migrate.on('close', (code) => {
      if (code === 0) {
        console.log(`${colors.green}✅ Database setup completed successfully${colors.reset}\n`);
        resolve();
      } else {
        console.error(`${colors.red}❌ Database setup failed with exit code ${code}${colors.reset}`);
        reject(new Error(`Database setup failed with exit code ${code}`));
      }
    });
  });
}

// Step 3: Start the application
function startApplication() {
  console.log(`${colors.yellow}⏳ Step 3: Starting the application...${colors.reset}`);
  
  return new Promise((resolve) => {
    console.log(`${colors.green}Starting development server...${colors.reset}`);
    
    const app = spawn('npm', ['run', 'dev'], {
      stdio: 'inherit',
      env: process.env
    });
    
    console.log(`${colors.cyan}🌐 Frontend will be available at: http://localhost:3000${colors.reset}`);
    console.log(`${colors.cyan}🔌 Backend API will be available at: http://localhost:4000${colors.reset}`);
    console.log(`\n${colors.bright}Press Ctrl+C to stop all services${colors.reset}\n`);
    
    app.on('close', (code) => {
      console.log(`\n${colors.yellow}Application exited with code ${code}${colors.reset}`);
      resolve();
    });
  });
}

// Run everything in sequence
async function run() {
  try {
    await checkAndKillPorts();
    await setupDatabase();
    await startApplication();
  } catch (error) {
    console.error(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Start the sequence
run();