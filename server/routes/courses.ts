/**
 * Course routes
 */
import { Router } from 'express';
import * as courseController from '../controllers/courses';

const router = Router();

// Course CRUD operations
router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseById);
router.post('/', courseController.createCourse);
router.put('/:id', courseController.updateCourse);
router.delete('/:id', courseController.deleteCourse);

// Additional course-related endpoints
router.get('/vertical/:vertical/semester/:semester/credits', 
  courseController.getRecommendedCreditsForVertical
);

export default router;