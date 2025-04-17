/**
 * Server Configuration
 * 
 * Contains configuration specific to the server-side application
 */
import { frontendUrl, isDevelopment } from './environment';

// Server configuration
export const serverConfig = {
  // Server settings
  port: process.env.SERVER_PORT ? parseInt(process.env.SERVER_PORT) : 4000,
  
  // API configuration
  apiPrefix: '/api',
  
  // CORS configuration
  allowedOrigins: isDevelopment 
    ? ['http://localhost:3000', 'http://localhost:4000'] 
    : [frontendUrl],
  
  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  },
  
  // Security
  useHelmet: !isDevelopment,
  
  // Logging
  logFormat: isDevelopment ? 'dev' : 'combined',
  
  // Request body limits
  bodyLimit: '1mb',
  
  // Timeouts
  timeout: 30000 // 30 seconds
};