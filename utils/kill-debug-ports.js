/**
 * Utility script to kill any Node.js processes using debug ports
 * Run with: node utils/kill-debug-ports.js
 */
const { exec } = require('child_process');

// List of debug ports we want to free up
const portsToCheck = [9229, 9230, 9231, 9232];

console.log('Checking for processes using debug ports...');

// Check each port and kill any processes using it
portsToCheck.forEach(port => {
  // Command differs based on platform
  const command = process.platform === 'win32' 
    ? `netstat -ano | findstr :${port}` 
    : `lsof -i :${port} | grep LISTEN`;

  exec(command, (error, stdout) => {
    if (error) {
      // No process found using this port
      console.log(`✓ Port ${port} is not in use`);
      return;
    }

    if (stdout) {
      console.log(`Found process using port ${port}. Attempting to kill...`);
      
      // Extract PID and kill the process
      try {
        let pid;
        if (process.platform === 'win32') {
          // Windows: Last column is PID
          pid = stdout.trim().split(/\s+/).pop();
        } else {
          // Unix: Second column is PID
          pid = stdout.trim().split(/\s+/)[1];
        }

        if (pid) {
          const killCommand = process.platform === 'win32' ? `taskkill /F /PID ${pid}` : `kill -9 ${pid}`;
          exec(killCommand, (err) => {
            if (err) {
              console.error(`Failed to kill process on port ${port}: ${err.message}`);
            } else {
              console.log(`✓ Successfully killed process using port ${port} (PID: ${pid})`);
            }
          });
        }
      } catch (err) {
        console.error(`Error processing port ${port}: ${err}`);
      }
    }
  });
});

console.log('Ports cleanup initiated. Wait a few seconds before starting your application.');