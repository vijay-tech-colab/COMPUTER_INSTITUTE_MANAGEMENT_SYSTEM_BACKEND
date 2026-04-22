import express from 'express';
import { 
    getAllStudents, 
    getStudentById, 
    updateStudentInfo, 
    deleteStudent 
} from '../controllers/student.controller.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';
import { checkPermission } from '../middlewares/rbac.middleware.js';

const router = express.Router();

router.route('/')
    .get(isAuthenticated, checkPermission('student', 'list'), getAllStudents);

router.route('/:id')
    .get(isAuthenticated, checkPermission('student', 'view'), getStudentById)
    .put(isAuthenticated, checkPermission('student', 'update'), updateStudentInfo)
    .delete(isAuthenticated, checkPermission('student', 'delete'), deleteStudent);

export default router;
