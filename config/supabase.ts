/**
 * Supabase Configuration
 * 
 * Contains Supabase-specific configuration and credentials
 */

// Supabase configuration
export const supabaseConfig = {
  // Supabase URL and keys
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  
  // Database connection info (for migrations)
  database: {
    host: process.env.SUPABASE_DB_HOST || '',
    port: 5432, // Default PostgreSQL port
    user: process.env.SUPABASE_DB_USER || 'postgres',
    password: process.env.SUPABASE_DB_PASSWORD || '',
    database: 'postgres',
    ssl: true
  },
  
  // Table names
  tables: {
    courses: 'courses',
    programStructure: 'program_structure'
  },
  
  // Functions to generate fully qualified table names
  getTableName: (table: string) => table
};