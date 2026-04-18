import express from 'express';
import { 
    getAdminStudentStats, 
    getAdminFinancialStats, 
    getAdminAdmissionStats,
    getAdminCourseDistribution,
    getStaffBatchStats,
    getStaffTodaySchedule,
    getStudentAttendanceStats,
    getStudentFeeStats,
    getStudentLatestResults,
    getStudentNotifications,
    getStudentLibrarySummary
} from '../controllers/dashboard.controller.js';
import { isAuthenticated, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Admin Widgets
router.get('/admin/students', isAuthenticated, authorizeRoles('admin'), getAdminStudentStats);
router.get('/admin/finances', isAuthenticated, authorizeRoles('admin'), getAdminFinancialStats);
router.get('/admin/admissions', isAuthenticated, authorizeRoles('admin'), getAdminAdmissionStats);
router.get('/admin/courses-chart', isAuthenticated, authorizeRoles('admin'), getAdminCourseDistribution);

// Staff Widgets
router.get('/staff/batches', isAuthenticated, authorizeRoles('staff', 'admin'), getStaffBatchStats);
router.get('/staff/schedule', isAuthenticated, authorizeRoles('staff', 'admin'), getStaffTodaySchedule);

// Student Widgets
router.get('/student/attendance', isAuthenticated, authorizeRoles('student'), getStudentAttendanceStats);
router.get('/student/fees', isAuthenticated, authorizeRoles('student'), getStudentFeeStats);
router.get('/student/results', isAuthenticated, authorizeRoles('student'), getStudentLatestResults);
router.get('/student/notifications', isAuthenticated, authorizeRoles('student'), getStudentNotifications);
router.get('/student/library', isAuthenticated, authorizeRoles('student'), getStudentLibrarySummary);

export default router;
