# Contributing to Vidyalankar Credits System

## 🎯 Development Workflow

### Branch Strategy
- `main` - Production-ready code
- `develop` - Active development branch
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Critical production fixes

### Getting Started

1. **Fork and Clone**
   ```bash
   git clone https://github.com/yourusername/vidyalankar-credits-system.git
   cd vidyalankar-credits-system
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Configure your Supabase credentials
   ```

3. **Database Setup**
   ```bash
   # Run migrations in Supabase SQL Editor:
   # sql/migrations/001-005 in order
   ```

### Development Process

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Write clean, documented code
   - Follow existing code patterns
   - Add tests where appropriate

3. **Test Your Changes**
   ```bash
   npm run dev # Test locally
   node scripts/test-all-admin-roles.js # Test admin system
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "✨ feat: add your feature description"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   # Create Pull Request on GitHub
   ```

## 📝 Commit Convention

Use conventional commits for clear history:

- `✨ feat:` - New features
- `🐛 fix:` - Bug fixes
- `📝 docs:` - Documentation changes
- `💄 style:` - Code style changes (formatting, etc.)
- `♻️ refactor:` - Code refactoring
- `⚡ perf:` - Performance improvements
- `✅ test:` - Adding or updating tests
- `🔒 security:` - Security fixes
- `🔧 chore:` - Build process or auxiliary tool changes

## 🛠️ Code Standards

### TypeScript
- Use TypeScript for all new code
- Define proper interfaces and types
- Avoid `any` types

### React/Next.js
- Use functional components with hooks
- Follow Next.js best practices
- Use proper error boundaries

### Database
- Always use migrations for schema changes
- Follow RLS (Row Level Security) patterns
- Use proper indexes for performance

### API Routes
- Implement proper error handling
- Use consistent response formats
- Add authentication where needed

## 🧪 Testing

### Manual Testing
```bash
# Test admin roles
node scripts/test-all-admin-roles.js

# Verify system
node scripts/verify-admin-system.js

# Check admin accounts
node scripts/check-admins.js
```

### Areas to Test
- Admin login and permissions
- Student registration and login
- Course enrollment and tracking
- API endpoints
- Database operations

## 📋 Pull Request Guidelines

### Before Submitting
- [ ] Code follows project conventions
- [ ] No console.logs left in production code
- [ ] Environment variables properly configured
- [ ] Tests pass locally
- [ ] Documentation updated if needed

### PR Description Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested locally
- [ ] Admin system tested
- [ ] Database migrations verified

## Screenshots (if applicable)
Add screenshots for UI changes
```

## 🚀 Deployment

### Environment Variables
Ensure all required environment variables are documented and configured:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
JWT_SECRET=
ADMIN_PASSCODE=
```

### Database Migrations
Always run migrations in order:
1. 001_initial_schema.sql
2. 002_schema_fixes.sql
3. 003_admin_system.sql
4. 004_fix_admin_rls.sql
5. 005_correct_rbac_structure.sql

## 🆘 Getting Help

- Check existing issues on GitHub
- Review documentation in `/docs`
- Test with scripts in `/scripts`
- Ask questions in pull requests

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)

Thank you for contributing to the Vidyalankar Credits System! 🎓
