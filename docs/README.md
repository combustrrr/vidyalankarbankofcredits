# 📚 Credits Management System - Documentation

A comprehensive credit management system with Role-Based Access Control (RBAC) for educational institutions.

**Created by Sarthak Kulkarni** (icsarthak9@gmail.com)

## 🎯 System Overview

The Credits Management System is a modern web application built with Next.js and Supabase that provides:

- **Student Portal**: Credit tracking, course enrollment, and progress monitoring
- **Admin System**: 6-role RBAC with granular permissions for institutional management
- **API-First Design**: RESTful APIs for all operations
- **Production Ready**: Secure authentication, database migrations, and deployment guides

## ✨ Key Features

### 🎓 Student Features
- Secure registration and authentication
- Semester-wise credit tracking
- Course enrollment and progress monitoring
- Academic progress reports
- Responsive dashboard interface

### 👨‍💼 Admin Features (6 Roles)
- **Super Administrator**: Full system access across all universities
- **University Administrator**: University-wide management
- **Department Administrator**: Department-specific access
- **Academic Coordinator**: Course and curriculum management
- **Student Affairs Officer**: Student management and enrollment
- **Report Viewer**: Read-only access to reports and analytics

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Authentication**: JWT with secure HTTP-only cookies
- **State Management**: React Context API
- **Security**: RBAC with granular permissions

## 🚀 Quick Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation Steps

1. **Clone and Install Dependencies**
   ```bash
   cd credits-management-system
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your credentials
   ```

3. **Database Setup**
   ```bash
   # Run migrations in Supabase SQL Editor in order:
   # 1. sql/migrations/001_initial_schema.sql
   # 2. sql/migrations/002_schema_fixes.sql
   # 3. sql/migrations/003_admin_system.sql
   # 4. sql/migrations/004_fix_admin_rls.sql
   # 5. sql/migrations/005_correct_rbac_structure.sql
   # 6. sql/seeds/sample_data.sql (optional)
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```
4. This will create all necessary tables and seed data

### 4. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
credits-management-system/
├── pages/                  # Next.js pages and API routes
│   ├── api/               # API endpoints
│   ├── admin/             # Admin pages
│   ├── _app.tsx           # App wrapper
│   └── index.tsx          # Home page
├── src/
│   ├── contexts/          # React contexts
│   ├── lib/               # Utility libraries
│   ├── styles/            # Global styles
│   └── types/             # TypeScript types
├── database-schema.sql    # Database setup script
└── README.md
```

## Key Features

### Student Features
- Secure login/signup
- Semester selection
- Course dashboard with completion tracking
- Progress reports with credit breakdown
- Basket-wise credit analysis

### Admin Features
- Admin authentication
- Course management (CRUD operations)
- Student management
- Credit system overview

### Program Structure
- 16 different course verticals (BSC, ESC, PCC, etc.)
- Semester-wise credit distribution
- Basket-based course categorization
- Configurable credit recommendations

## API Routes

### Authentication
- `POST /api/auth/login` - Student login
- `POST /api/auth/signup` - Student registration
- `POST /api/auth/logout` - Logout
- `GET /api/auth/check` - Check authentication status

### Courses
- `GET /api/courses` - List courses with filters
- `POST /api/courses` - Create new course
- `PUT /api/courses/[id]` - Update course
- `DELETE /api/courses/[id]` - Delete course

### Students
- `GET /api/students` - List students
- `GET /api/students/[id]` - Get student details
- `PUT /api/students/[id]` - Update student
- `PATCH /api/students/[id]/semester` - Update semester

## Development

### Adding New Features

1. **Types**: Add interfaces to `src/types/index.ts`
2. **API Routes**: Create in `pages/api/`
3. **Pages**: Add to `pages/` directory
4. **Contexts**: Add shared state to `src/contexts/`
5. **Utils**: Add utilities to `src/lib/`

### Database Changes

1. Update the schema in `database-schema.sql`
2. Run the new SQL in Supabase SQL Editor
3. Update TypeScript types accordingly

## Production Deployment

### Environment Variables

Ensure these are set in production:

```env
NEXT_PUBLIC_SUPABASE_URL=your-production-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-key
JWT_SECRET=your-super-secure-jwt-secret
ADMIN_PASSCODE=your-secure-admin-passcode
NODE_ENV=production
```

### Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy!

## Default Credentials

- **Admin Passcode**: `admin123` (change in production)
- **Student Login**: Create via signup form

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

---

**Built with ❤️ by Sarthak Kulkarni**
