# 🚀 Production Deployment Guide

Complete guide for deploying the Vidyalankar Credits System to production environments.

## ✅ System Status: PRODUCTION READY

The system includes:
- ✅ 6-role RBAC admin system with granular permissions
- ✅ Secure authentication and session management
- ✅ Production-optimized database schema
- ✅ API endpoints with proper error handling
- ✅ Responsive admin and student interfaces

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database (Supabase recommended)
- Domain name (optional)
- SSL certificate (for production)

## 🗄️ Database Setup

### Using Supabase (Recommended)

1. **Create Project**
   - Go to https://supabase.com
   - Create a new project
   - Note your project URL and API keys

2. **Run Migrations** (in order)
   ```sql
   -- In Supabase SQL Editor, execute these files in order:
   1. sql/migrations/001_initial_schema.sql
   2. sql/migrations/002_schema_fixes.sql  
   3. sql/migrations/003_admin_system.sql
   4. sql/migrations/004_fix_admin_rls.sql
   5. sql/migrations/005_correct_rbac_structure.sql
   ```

3. **Add Sample Data** (optional, for development)
   ```sql
   -- Run for demo data:
   sql/seeds/sample_data.sql
   ```

4. **Verify Setup**
   ```sql
   -- Run verification queries:
   sql/utilities/verify-deployment.sql
   ```

## 🔧 Environment Configuration

### 1. Environment Variables

Create `.env.local` (or `.env.production`):

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Authentication
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters

# Admin System  
ADMIN_PASSCODE=secure-admin-passcode-change-this

# Application
NODE_ENV=production
NEXTAUTH_URL=https://yourdomain.com
```

### 2. Security Configuration

- Use strong, unique passwords for all admin accounts
- Enable SSL/TLS in production
- Configure CORS policies appropriately
- Set secure JWT secrets (32+ characters)
- Enable database connection pooling

#### Using PostgreSQL directly

1. Create a PostgreSQL database
2. Run migrations using psql:

```bash
psql "postgresql://username:password@host:port/database" -f sql/migrations/001_initial_schema.sql
psql "postgresql://username:password@host:port/database" -f sql/migrations/002_schema_fixes.sql
psql "postgresql://username:password@host:port/database" -f sql/migrations/003_admin_system.sql
```

### 2. Environment Variables

Create `.env.local` (development) or `.env.production` (production):

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Database Direct Connection (if needed)
DATABASE_PASSWORD=your_database_password

# Security (Generate strong secrets for production)
JWT_SECRET=your_very_long_random_jwt_secret_minimum_256_bits
ADMIN_PASSCODE=your_secure_admin_passcode

# Environment
NODE_ENV=production
```

**Security Note**: Generate strong secrets for production:
```bash
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate admin passcode
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

## Deployment Options

### Option 1: Vercel (Recommended)

1. **Fork/Clone the repository**
2. **Connect to Vercel**:
   - Go to https://vercel.com
   - Import your repository
   - Configure environment variables
   - Deploy

3. **Configure Environment Variables in Vercel**:
   - Go to Project Settings → Environment Variables
   - Add all variables from your `.env.local`
   - Set `NODE_ENV=production`

4. **Domain Setup** (optional):
   - Add custom domain in Vercel dashboard
   - Configure DNS records

### Option 2: Netlify

1. **Build Configuration**:
   Create `netlify.toml`:
   ```toml
   [build]
     command = "npm run build"
     publish = ".next"

   [[redirects]]
     from = "/api/*"
     to = "/.netlify/functions/api/:splat"
     status = 200
   ```

2. **Deploy**:
   - Connect repository to Netlify
   - Configure environment variables
   - Deploy

### Option 3: Docker

1. **Create Dockerfile**:
   ```dockerfile
   FROM node:18-alpine

   WORKDIR /app
   COPY package*.json ./
   RUN npm install --only=production

   COPY . .
   RUN npm run build

   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **Build and Run**:
   ```bash
   docker build -t vidyalankar-credits .
   docker run -p 3000:3000 --env-file .env.production vidyalankar-credits
   ```

### Option 4: AWS/Google Cloud/Azure

1. **Using PM2 (Process Manager)**:
   ```bash
   npm install -g pm2
   pm2 start npm --name "credits-system" -- start
   pm2 startup
   pm2 save
   ```

2. **Nginx Configuration**:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## Post-Deployment Setup

### 1. Database Verification

Run verification queries to ensure everything is working:

```sql
-- Check admin system
SELECT COUNT(*) FROM admin_roles;
SELECT COUNT(*) FROM admin_permissions;
SELECT COUNT(*) FROM admins WHERE username = 'superadmin';

-- Check student system
SELECT COUNT(*) FROM students;
SELECT COUNT(*) FROM courses;
```

### 2. Admin Account Setup

1. **Login with default credentials**:
   - Username: `superadmin`
   - Password: `admin123`

2. **Change default password immediately**

3. **Create additional admin accounts as needed**

### 3. Security Checklist

- [ ] Changed default admin password
- [ ] Generated strong JWT secret
- [ ] Configured HTTPS/SSL
- [ ] Set up rate limiting (if needed)
- [ ] Configured database backups
- [ ] Set up monitoring/logging
- [ ] Reviewed RLS policies
- [ ] Tested permission system

### 4. Testing

Run these tests after deployment:

```bash
# Test student registration
curl -X POST https://your-domain.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","firstName":"Test","lastName":"User"}'

# Test admin login
curl -X POST https://your-domain.com/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"your_new_password"}'
```

## Monitoring and Maintenance

### 1. Health Checks

Set up health check endpoints:

```javascript
// Add to pages/api/health.js
export default function handler(req, res) {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
}
```

### 2. Database Backups

Set up automated backups:

```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump "postgresql://user:pass@host:port/db" > backup_$DATE.sql
```

### 3. Log Monitoring

Monitor application logs for:
- Authentication failures
- Permission violations
- Database errors
- Performance issues

### 4. Updates

For updates:
1. Test in staging environment
2. Backup database
3. Deploy new version
4. Run any new migrations
5. Verify functionality

## Troubleshooting

### Common Issues

1. **Database Connection Issues**:
   - Check environment variables
   - Verify database credentials
   - Check network connectivity

2. **Authentication Problems**:
   - Verify JWT secret
   - Check token expiration
   - Review RLS policies

3. **Permission Errors**:
   - Check admin role assignments
   - Verify permission mappings
   - Review API endpoint permissions

4. **Build Failures**:
   - Check Node.js version
   - Clear `.next` folder and rebuild
   - Verify all dependencies

### Debug Mode

Enable debug mode by setting:
```bash
NODE_ENV=development
DEBUG=true
```

### Support

For deployment issues:
1. Check the troubleshooting guide
2. Review server logs
3. Contact development team

## Performance Optimization

### 1. Database Optimization

- Add indexes for frequently queried columns
- Enable connection pooling
- Configure statement timeout

### 2. Application Optimization

- Enable Next.js image optimization
- Use static generation where possible
- Implement caching strategies

### 3. CDN and Caching

- Use CDN for static assets
- Configure browser caching
- Implement API response caching

## Scaling

For high-traffic scenarios:

1. **Database Scaling**:
   - Read replicas
   - Connection pooling
   - Query optimization

2. **Application Scaling**:
   - Horizontal scaling with load balancer
   - Stateless application design
   - Session management

3. **Monitoring**:
   - Performance metrics
   - Error tracking
   - Resource usage monitoring
