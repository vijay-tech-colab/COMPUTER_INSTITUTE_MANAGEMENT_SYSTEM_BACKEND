import express from 'express';
import { 
    createCourse, 
    getCourses, 
    updateCourse, 
    deleteCourse 
} from '../controllers/course.controller.js';
import { isAuthenticated, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Get all courses (Public/Authenticated)
router.get('/', getCourses);

// Admin-only operations
router.post('/', isAuthenticated, authorizeRoles('admin'), createCourse);

router.route('/:id')
    .put(isAuthenticated, authorizeRoles('admin'), updateCourse)
    .delete(isAuthenticated, authorizeRoles('admin'), deleteCourse);

export default router;
