import express from 'express';
import { 
    getAllStudents, 
    getStudentById, 
    updateStudentInfo, 
    deleteStudent 
} from '../controllers/student.controller.js';
import { isAuthenticated, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.route('/')
    .get(isAuthenticated, authorizeRoles('admin', 'staff'), getAllStudents);

router.route('/:id')
    .get(isAuthenticated, getStudentById)
    .put(isAuthenticated, authorizeRoles('admin'), updateStudentInfo)
    .delete(isAuthenticated, authorizeRoles('admin'), deleteStudent);

export default router;
