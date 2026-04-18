import express from 'express';
import { 
    createExam, 
    uploadMarks, 
    getStudentPerformance 
} from '../controllers/exam.controller.js';
import { isAuthenticated, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/schedule', isAuthenticated, authorizeRoles('admin', 'staff'), createExam);

router.post('/upload-marks', isAuthenticated, authorizeRoles('admin', 'staff'), uploadMarks);

router.get('/performance/:studentId', isAuthenticated, getStudentPerformance);

export default router;
