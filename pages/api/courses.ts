import { NextApiRequest, NextApiResponse } from 'next';

// In-memory storage for courses (in a real app, this would be a database)
let courses: any[] = [];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return getCourses(req, res);
    case 'POST':
      return createCourse(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// Get all courses
function getCourses(req: NextApiRequest, res: NextApiResponse) {
  return res.status(200).json({ courses });
}

// Create a new course
function createCourse(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { name, description, duration } = req.body;
    
    // Validate request body
    if (!name || !description || !duration) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Create new course with a unique ID
    const newCourse = {
      id: Date.now().toString(),
      name,
      description,
      duration,
      createdAt: new Date().toISOString()
    };
    
    // Add to our "database"
    courses.push(newCourse);
    
    // Return the newly created course
    return res.status(201).json({ course: newCourse });
  } catch (error) {
    console.error('Error creating course:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}