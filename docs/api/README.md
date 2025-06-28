# API Documentation

## Overview

The Vidyalankar Credits System provides RESTful APIs for both student and admin operations.

## Authentication

All API endpoints use JWT-based authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Student APIs

### Authentication

#### POST `/api/auth/login`
Student login endpoint.

**Request Body:**
```json
{
  "email": "student@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "student": {
      "id": "uuid",
      "email": "student@example.com",
      "fullName": "Student Name",
      "currentSemester": 3
    }
  }
}
```

#### POST `/api/auth/signup`
Student registration endpoint.

#### GET `/api/auth/check`
Verify authentication status.

#### POST `/api/auth/logout`
Student logout endpoint.

### Student Data

#### GET `/api/students`
Get student list (admin only).

#### GET `/api/students/progress`
Get student's academic progress.

#### PUT `/api/students/update-semester`
Update student's current semester.

### Courses

#### GET `/api/courses`
Get available courses for current semester.

**Query Parameters:**
- `semester` (optional): Filter by semester
- `branch` (optional): Filter by branch

## Admin APIs

### Authentication

#### POST `/api/admin/auth/login`
Admin login endpoint.

**Request Body:**
```json
{
  "username": "superadmin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "admin": {
      "id": "uuid",
      "username": "superadmin",
      "email": "admin@example.com",
      "fullName": "Admin Name",
      "role": {
        "roleCode": "super_admin",
        "roleName": "Super Administrator"
      },
      "permissions": ["manage_students", "manage_courses", ...]
    }
  }
}
```

#### GET `/api/admin/auth/check`
Verify admin authentication status.

#### POST `/api/admin/auth/logout`
Admin logout endpoint.

### Admin Management

#### GET `/api/admin/users`
Get user list with role-based filtering.

#### POST `/api/admin/users`
Create new user account.

#### PUT `/api/admin/users/:id`
Update user account.

#### DELETE `/api/admin/users/:id`
Deactivate user account.

### Academic Management

#### GET `/api/admin/courses`
Get all courses with admin privileges.

#### POST `/api/admin/courses`
Create new course.

#### PUT `/api/admin/courses/:id`
Update course information.

## Error Responses

All APIs return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE" // Optional
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

## Permissions

### Student Permissions
- View own data
- Update own profile
- View available courses
- Enroll in courses
- View own progress

### Admin Permissions

#### Super Admin
- All permissions
- System configuration
- Admin management

#### University Admin
- Manage students and faculty within university
- Manage courses and programs
- Generate reports
- System settings (limited)

#### Department Admin
- Manage students within department
- Manage department courses
- Department reports

#### Academic Coordinator
- Course management
- Curriculum planning
- Academic reports

#### Student Affairs Officer
- Student account management
- Enrollment assistance
- Communication

#### Report Viewer
- Read-only access to reports
- Data export

## Rate Limiting

- Student APIs: 100 requests per minute
- Admin APIs: 200 requests per minute
- Authentication APIs: 10 requests per minute

## Webhooks

The system supports webhooks for real-time notifications:

- Student enrollment events
- Grade updates
- System alerts

Configure webhooks in the admin panel under System Settings.

## SDK and Libraries

### JavaScript/TypeScript
```javascript
import { CreditsSystemAPI } from '@vidyalankar/credits-api';

const api = new CreditsSystemAPI({
  baseURL: 'https://your-domain.com/api',
  token: 'your_jwt_token'
});

// Student login
const result = await api.auth.login(email, password);
```

### cURL Examples

#### Student Login
```bash
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com","password":"password123"}'
```

#### Get Courses (Authenticated)
```bash
curl -X GET https://your-domain.com/api/courses \
  -H "Authorization: Bearer your_jwt_token"
```

## Testing

Use the provided test credentials:

### Student Account
- Email: student1@vit.edu.in
- Password: student123

### Admin Account
- Username: superadmin
- Password: admin123

## Support

For API support or questions, contact the development team or refer to the main documentation.
