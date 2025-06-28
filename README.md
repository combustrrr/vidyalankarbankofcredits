# 🎓 Credits Management System

A comprehensive credit management system with Role-Based Access Control (RBAC) for educational institutions.

**Created by Sarthak Kulkarni** (icsarthak9@gmail.com)

## 🎯 Overview

The Credits Management System is a modern web application built with Next.js and Supabase that provides:

- **Student Portal**: Credit tracking, course enrollment, and progress monitoring
- **Admin System**: 6-role RBAC with granular permissions for institutional management
- **API-First Design**: RESTful APIs for all operations
- **Production Ready**: Secure authentication, database migrations, and deployment guides

## ✨ Features

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

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd credits-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

4. **Database Setup**
   ```bash
   # Run migrations in order
   npm run db:migrate
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
/credits-management-system/
├── docs/                          # 📚 All documentation
│   ├── api/                       # API documentation
│   ├── deployment/                # Deployment guides  
│   ├── INDEX.md                   # Documentation hub
│   ├── README.md                  # Detailed project docs
│   ├── QUICKSTART.md             # Quick start guide
│   └── *.md                      # Other documentation files
├── sql/                          # 🗄️ Database related files
│   ├── migrations/               # Database migration files (001-005)
│   ├── seeds/                    # Sample data for development  
│   ├── utilities/                # Helper and troubleshooting scripts
│   └── README.md                 # SQL documentation
├── src/                          # 💻 Source code
│   ├── contexts/                 # React contexts (Auth)
│   ├── lib/                      # Utility libraries
│   ├── styles/                   # Global styles
│   └── types/                    # TypeScript definitions
├── pages/                        # 🌐 Next.js pages
│   ├── api/                      # API routes (auth, courses, students)
│   ├── admin/                    # Admin pages (login, dashboard)
│   └── *.tsx                     # Student pages
├── scripts/                      # 🔧 Development and testing scripts
│   ├── test-all-admin-roles.js   # Comprehensive role testing
│   ├── create-sample-admins.js   # Create test admin accounts
│   ├── verify-admin-system.js    # Deployment verification
│   └── README.md                 # Scripts documentation
└── public/                       # 📁 Static assets
```

## 🔐 Admin Roles & Permissions

### Super Administrator
- Full system access across all universities
- Can manage other administrators
- System configuration and maintenance
- All permissions granted

### University Administrator
- Full access within assigned university
- Manage students, faculty, and courses
- Generate reports for their university
- Cannot manage other administrators

### Department Administrator
- Access to specific departments within university
- Manage students and courses within their departments
- Limited reporting capabilities

### Academic Coordinator
- Course and curriculum management
- Student enrollment management
- Academic reporting

### Student Affairs Officer
- Student account management
- Enrollment assistance
- Communication management

### Report Viewer
- Read-only access to reports and analytics
- Data export capabilities

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: JWT, bcrypt
- **ORM**: Supabase Client
- **Deployment**: Vercel (recommended)

## Getting Started

1. **Clone the repository**
2. **Install dependencies**: `npm install`
3. **Set up environment variables**: Copy `.env.example` to `.env.local`
4. **Run database migrations**: See `docs/deployment/` for instructions
5. **Start development server**: `npm run dev`

## Environment Variables

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Database Direct Connection
DATABASE_PASSWORD=your_database_password

# Security
JWT_SECRET=your_jwt_secret
ADMIN_PASSCODE=your_admin_passcode

# Environment
NODE_ENV=development
```

## Default Admin Credentials

- **Username**: superadmin
- **Password**: admin123

*Change these credentials immediately after first login in production.*

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks

## Security Features

- Row Level Security (RLS) policies
- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Session management
- Audit logging

## API Structure

### Student APIs
- `/api/auth/*` - Student authentication
- `/api/students/*` - Student management
- `/api/courses/*` - Course information

### Admin APIs
- `/api/admin/auth/*` - Admin authentication
- `/api/admin/users/*` - User management
- `/api/admin/academic/*` - Academic management
- `/api/admin/reports/*` - Reporting

## Contributing

1. Follow the established folder structure
2. Use TypeScript for all new code
3. Follow the existing code style
4. Add proper error handling
5. Update documentation for new features

## Support

For technical support or questions, refer to the documentation in the `docs/` folder or contact the development team.
