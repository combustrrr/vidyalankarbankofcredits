# Vidyalankar Bank of Credits

A full-stack web application for Vidyalankar Bank of Credits with Next.js, Tailwind CSS, and Express backend.

## 🚀 Introduction

This application manages the credit system for Vidyalankar Institute's academic programs. It features a course management system, program structure tracking, credit calculation, and an admin interface to manage courses and program structures.

## 📋 Features

- Course management (create, update, delete)
- Program structure tracking with verticals and baskets
- Credit recommendation system
- Admin authentication
- Responsive UI with Tailwind CSS
- REST API with Express
- Database integration with Supabase

## 🏗️ Project Structure

```
/
├── config/                    # Modular configuration
│   ├── index.ts               # Configuration entry point
│   ├── environment.ts         # Environment detection
│   ├── server.ts              # Server configuration
│   ├── client.ts              # Client-side configuration
│   ├── supabase.ts            # Supabase configuration
│   ├── features.ts            # Feature flags
│   ├── course.ts              # Course configuration 
│   └── program-structure.ts   # Program structure definitions
├── context/                   # React context providers
│   └── AdminAuthContext.tsx   # Admin authentication context
├── pages/                     # Next.js pages
│   ├── _app.tsx               # Next.js app entry point
│   ├── index.tsx              # Home page
│   ├── admin-auth.tsx         # Admin authentication page
│   └── admin/                 # Admin pages
│       ├── dashboard.tsx      # Admin dashboard
│       ├── create-course.tsx  # Create course page
│       ├── manage-courses.tsx # Manage courses page
│       └── edit-course/       # Edit course pages
│           └── [id].tsx       # Edit course by ID
├── public/                    # Static assets
├── server/                    # Express server
│   ├── index.ts               # Server entry point
│   ├── config/                # Server configuration
│   │   └── supabase.ts        # Server Supabase client
│   ├── controllers/           # API controllers
│   │   └── courses.ts         # Course controller
│   ├── middleware/            # Express middleware
│   │   └── errorHandler.ts    # Global error handler
│   └── routes/                # API routes
│       └── courses.ts         # Course routes
├── styles/                    # CSS styles
├── types/                     # TypeScript type definitions
│   ├── index.ts               # Common types
│   └── supabase.ts            # Supabase-specific types
└── utils/                     # Utility functions
    ├── api.ts                 # Frontend API client
    ├── supabase.ts            # Supabase client
    ├── check-env.js           # Environment variable checker
    └── database/              # Database utilities
        └── migration-manager.js # Consolidated database migration tool
```

## 🛠️ Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SERVER_PORT=4000
```

## 🔌 Database Setup

This project uses Supabase as its primary database. The setup is handled by our consolidated migration manager:

```bash
npm run migrate:db
```

For force migration with error skipping:

```bash
npm run migrate:db:force
```

## 🚀 Development

Run the development server:

```bash
npm run dev
```

This starts both the Next.js frontend and Express backend concurrently.

## 🔧 Production Build

Build for production:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## 🔒 Admin Access

To access the admin dashboard:

1. Navigate to the home page
2. Click on the Admin panel
3. Use the passcode: `117110`

## 📦 API Endpoints

### Courses

- `GET /api/courses` - Get all courses (with pagination and filtering)
- `GET /api/courses/:id` - Get a course by ID
- `POST /api/courses` - Create a new course
- `PUT /api/courses/:id` - Update a course
- `DELETE /api/courses/:id` - Delete a course
- `GET /api/courses/vertical/:vertical/semester/:semester/credits` - Get recommended credits

## 📚 Key Technologies

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Express.js, Node.js
- **Database**: Supabase (PostgreSQL)
- **Language**: TypeScript
- **Authentication**: Custom admin auth
- **Deployment**: Vercel (frontend), Heroku (backend)

## 🧪 Development Guidelines

1. **Configuration**: Use the centralized config modules in the `/config` directory
2. **API Utilities**: Use the API utilities in `/utils/api.ts`
3. **Type Safety**: Define types in `/types` directory
4. **Database Access**: Use the Supabase client in `/utils/supabase.ts`
5. **Error Handling**: Use the `createApiError` utility for consistent API errors

## 📖 License

[MIT](LICENSE)
