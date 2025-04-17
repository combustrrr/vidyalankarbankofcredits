#!/usr/bin/env node
/**
 * Interactive Application Startup Script
 * Vidyalankar Bank of Credits
 * 
 * This script helps to set up and start the application with proper configurations.
 */

const { spawn, exec } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk') || { green: (t) => '\x1b[32m' + t + '\x1b[0m', red: (t) => '\x1b[31m' + t + '\x1b[0m', yellow: (t) => '\x1b[33m' + t + '\x1b[0m', blue: (t) => '\x1b[34m' + t + '\x1b[0m', bold: (t) => '\x1b[1m' + t + '\x1b[0m' };

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Check environment
const envChecker = require('./utils/check-env');

// ASCII Art
const displayHeader = () => {
  console.log('\n');
  console.log(chalk.blue('██████  ██████  ███████ ██████  ██ ████████     ███████ ██    ██ ███████ ████████ ███████ ███    ███ '));
  console.log(chalk.blue('██      ██   ██ ██      ██   ██ ██    ██        ██       ██  ██  ██         ██    ██      ████  ████ '));
  console.log(chalk.blue('██      ██████  █████   ██   ██ ██    ██        ███████   ████   ███████    ██    █████   ██ ████ ██ '));
  console.log(chalk.blue('██      ██   ██ ██      ██   ██ ██    ██             ██    ██         ██    ██    ██      ██  ██  ██ '));
  console.log(chalk.blue('██████  ██   ██ ███████ ██████  ██    ██        ███████    ██    ███████    ██    ███████ ██      ██ '));
  console.log('\n');
  console.log(chalk.bold('Vidyalankar Bank of Credits - Credit System Management'));
  console.log(chalk.bold('===================================================='));
  console.log('\n');
}

// Configuration
const CONFIG = {
  SERVER_PORT: 4000,
  CLIENT_PORT: 3000,
  ENV_FILE: '.env.local'
};

// Check if required files and dependencies are present
async function checkPrerequisites() {
  console.log(chalk.blue('\n🔍 Checking prerequisites...'));

  // Check for package.json
  if (!fs.existsSync('./package.json')) {
    console.error(chalk.red('❌ package.json not found. Are you in the correct directory?'));
    process.exit(1);
  }

  // Check for node_modules
  if (!fs.existsSync('./node_modules')) {
    console.log(chalk.yellow('⚠️ node_modules not found. Installing dependencies...'));
    
    return new Promise((resolve, reject) => {
      const install = spawn('npm', ['install'], { stdio: 'inherit' });
      
      install.on('close', (code) => {
        if (code !== 0) {
          console.error(chalk.red(`❌ npm install failed with code ${code}`));
          reject(new Error('Failed to install dependencies'));
        } else {
          console.log(chalk.green('✅ Dependencies installed successfully'));
          resolve();
        }
      });
    });
  }
  
  // Check if .env.local exists
  if (!fs.existsSync(CONFIG.ENV_FILE)) {
    console.log(chalk.yellow(`⚠️ ${CONFIG.ENV_FILE} not found. Creating from template...`));
    
    const envExample = `NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
`;
    
    fs.writeFileSync(CONFIG.ENV_FILE, envExample);
    console.log(chalk.yellow(`⚠️ Created ${CONFIG.ENV_FILE}. Please update it with your Supabase credentials.`));
    return Promise.reject(new Error('Please update .env.local with your Supabase credentials and run this script again.'));
  }

  return Promise.resolve();
}

// Start Database Setup
function setupDatabase() {
  return new Promise((resolve, reject) => {
    console.log(chalk.blue('\n🗄️ Setting up the database...'));
    
    const setup = spawn('npm', ['run', 'migrate:supabase'], { stdio: 'inherit' });
    
    setup.on('close', (code) => {
      if (code !== 0) {
        console.warn(chalk.yellow('⚠️ Database setup completed with warnings. You may need to check the Supabase setup.'));
      } else {
        console.log(chalk.green('✅ Database setup completed successfully'));
      }
      resolve();
    });
  });
}

// Start Server
function startServer() {
  return new Promise((resolve) => {
    console.log(chalk.blue('\n🚀 Starting server...'));
    
    const server = spawn('npm', ['run', 'server:dev'], { 
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: true
    });
    
    // Listen for server ready
    server.stdout.on('data', (data) => {
      const output = data.toString();
      process.stdout.write(output);
      
      if (output.includes('Server started') || output.includes('listening')) {
        console.log(chalk.green(`✅ Server running at http://localhost:${CONFIG.SERVER_PORT}`));
        resolve(server);
      }
    });
    
    server.stderr.on('data', (data) => {
      process.stderr.write(data.toString());
    });
    
    // Fallback resolve after 10 seconds if no "listening" message
    setTimeout(() => {
      console.log(chalk.yellow('⚠️ Server may still be starting...'));
      resolve(server);
    }, 10000);
  });
}

// Start Client
function startClient() {
  console.log(chalk.blue('\n🖥️ Starting client application...'));
  
  const client = spawn('npm', ['run', 'dev:client'], { 
    stdio: 'inherit',
    detached: false
  });
  
  return client;
}

// Main menu
function showMainMenu() {
  displayHeader();
  
  console.log(chalk.blue('\n📋 Please select an option:'));
  console.log('1. Start full application (Server + Client)');
  console.log('2. Start server only');
  console.log('3. Start client only');
  console.log('4. Setup/reset database');
  console.log('5. Check environment');
  console.log('6. Exit');
  
  rl.question('\nEnter your choice (1-6): ', (answer) => {
    switch(answer.trim()) {
      case '1':
        startFullApplication();
        break;
      case '2':
        startServerOnly();
        break;
      case '3':
        startClientOnly();
        break;
      case '4':
        setupDatabaseOnly();
        break;
      case '5':
        checkEnvironment();
        break;
      case '6':
        console.log(chalk.blue('\nExiting application. Goodbye!'));
        process.exit(0);
        break;
      default:
        console.log(chalk.yellow('\nInvalid option. Please try again.'));
        showMainMenu();
    }
  });
}

// Start full application
function startFullApplication() {
  checkPrerequisites()
    .then(() => setupDatabase())
    .then(() => startServer())
    .then((server) => {
      const client = startClient();
      
      // Handle exit
      process.on('SIGINT', () => {
        console.log(chalk.blue('\n🛑 Shutting down...'));
        
        try {
          if (server && server.pid) {
            process.kill(-server.pid);
          }
        } catch (e) {
          // Ignore errors if process is already gone
        }
        
        process.exit(0);
      });
      
      client.on('close', () => {
        console.log(chalk.blue('\n🛑 Client stopped. Shutting down server...'));
        if (server && server.pid) {
          try {
            process.kill(-server.pid);
          } catch (e) {
            // Ignore
          }
        }
        process.exit(0);
      });
    })
    .catch((err) => {
      console.error(chalk.red(`\n❌ Error: ${err.message}`));
      process.exit(1);
    });
}

// Start server only
function startServerOnly() {
  checkPrerequisites()
    .then(() => startServer())
    .then((server) => {
      console.log(chalk.green('\n✅ Server is running. Press Ctrl+C to stop.'));
      
      // Handle exit
      process.on('SIGINT', () => {
        console.log(chalk.blue('\n🛑 Shutting down server...'));
        if (server && server.pid) {
          try {
            process.kill(-server.pid);
          } catch (e) {
            // Ignore errors if process is already gone
          }
        }
        process.exit(0);
      });
    })
    .catch((err) => {
      console.error(chalk.red(`\n❌ Error: ${err.message}`));
      rl.close();
    });
}

// Start client only
function startClientOnly() {
  checkPrerequisites()
    .then(() => {
      const client = startClient();
      
      console.log(chalk.green('\n✅ Client is starting. Press Ctrl+C to stop.'));
      
      client.on('close', () => {
        console.log(chalk.blue('\n🛑 Client stopped.'));
        process.exit(0);
      });
      
      // Handle exit
      process.on('SIGINT', () => {
        console.log(chalk.blue('\n🛑 Shutting down client...'));
        process.exit(0);
      });
    })
    .catch((err) => {
      console.error(chalk.red(`\n❌ Error: ${err.message}`));
      rl.close();
    });
}

// Setup database only
function setupDatabaseOnly() {
  checkPrerequisites()
    .then(() => setupDatabase())
    .then(() => {
      console.log(chalk.green('\n✅ Database setup complete.'));
      rl.question('\nPress Enter to return to the main menu...', () => {
        showMainMenu();
      });
    })
    .catch((err) => {
      console.error(chalk.red(`\n❌ Error: ${err.message}`));
      rl.question('\nPress Enter to return to the main menu...', () => {
        showMainMenu();
      });
    });
}

// Check environment
function checkEnvironment() {
  console.log(chalk.blue('\n🔍 Checking environment...'));
  
  if (envChecker.isValid) {
    console.log(chalk.green('\n✅ Environment looks good!'));
  } else {
    console.log(chalk.red('\n❌ Environment issues detected:'));
    envChecker.errors.forEach(error => {
      console.log(chalk.red(`  - ${error}`));
    });
  }
  
  if (envChecker.warnings.length > 0) {
    console.log(chalk.yellow('\n⚠️ Environment warnings:'));
    envChecker.warnings.forEach(warning => {
      console.log(chalk.yellow(`  - ${warning}`));
    });
  }

  // Show the current program structure configuration
  try {
    const { verticals, baskets, creditDistributionTable } = require('./config/program-structure');
    
    console.log(chalk.blue('\n📊 Current Program Structure Configuration:'));
    console.log(chalk.bold('\nVerticals:'));
    verticals.forEach(v => console.log(`  - ${v}`));
    
    console.log(chalk.bold('\nBaskets (Semesters):'));
    baskets.forEach(b => console.log(`  - ${b}`));
    
    console.log(chalk.bold('\nCredit Distribution:'));
    console.log('Vertical          | Sem1 | Sem2 | Sem3 | Sem4 | Sem5 | Sem6 | Sem7 | Sem8 | Total');
    console.log('----------------- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | -----');
    
    creditDistributionTable.forEach(item => {
      const row = [
        item.vertical.padEnd(17),
        String(item.semester1).padStart(4),
        String(item.semester2).padStart(4),
        String(item.semester3).padStart(4),
        String(item.semester4).padStart(4),
        String(item.semester5).padStart(4),
        String(item.semester6).padStart(4),
        String(item.semester7).padStart(4),
        String(item.semester8).padStart(4),
        String(item.total).padStart(5)
      ];
      console.log(row.join(' | '));
    });
    
  } catch (err) {
    console.log(chalk.yellow('\n⚠️ Could not load program structure configuration.'));
  }
  
  rl.question('\nPress Enter to return to the main menu...', () => {
    showMainMenu();
  });
}

// Start the application
showMainMenu();