import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { Course, ApiResponse } from '../types';

const app = express();
const port = process.env.SERVER_PORT || 4000; // Use SERVER_PORT to avoid conflicts

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002']
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// In-memory database (in a production app, use a real database)
const courses: Course[] = [];

// Routes - removing /api prefix since Next.js will add it
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Course routes
app.get('/courses', (req: Request, res: Response<ApiResponse<{ courses: Course[] }>>) => {
  res.json({ success: true, data: { courses } });
});

app.post('/courses', (req: Request, res: Response<ApiResponse<{ course: Course }>>) => {
  try {
    const { 
      name, description, duration, 
      code, title, type, credits, semester, 
      degree, branch, vertical, basket 
    } = req.body;
    
    // Check for required fields
    if (!code || !title || !type || credits === undefined || semester === undefined || 
        !degree || !branch || !vertical || !basket) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    
    const newCourse: Course = {
      id: Date.now().toString(),
      name: name || title, // Use title as name if name is not provided
      description: description || '',
      duration: duration || '',
      createdAt: new Date().toISOString(),
      // New required fields
      code,
      title,
      type,
      credits: Number(credits),
      semester: Number(semester),
      degree, 
      branch,
      vertical,
      basket
    };
    
    courses.push(newCourse);
    return res.status(201).json({ success: true, data: { course: newCourse } });
  } catch (error) {
    console.error('Error creating course:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.get('/courses/:id', (req: Request, res: Response<ApiResponse<{ course: Course }>>) => {
  const course = courses.find(c => c.id === req.params.id);
  if (!course) {
    return res.status(404).json({ success: false, error: 'Course not found' });
  }
  return res.json({ success: true, data: { course } });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Something went wrong!' });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
