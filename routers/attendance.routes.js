import express from 'express';
import { 
    markAttendance, 
    getAttendanceByBatch, 
    getStudentAttendanceSummary 
} from '../controllers/attendance.controller.js';
import { isAuthenticated, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/mark', isAuthenticated, authorizeRoles('admin', 'staff'), markAttendance);

router.get('/batch/:batchId', isAuthenticated, authorizeRoles('admin', 'staff'), getAttendanceByBatch);

router.get('/summary/:batchId/:studentId', isAuthenticated, getStudentAttendanceSummary);

export default router;
