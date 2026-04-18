import express from 'express';
import { 
    recordPayment, 
    getStudentFeeStatus, 
    getCollectionReports 
} from '../controllers/fee.controller.js';
import { isAuthenticated, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Student can see their own fee status
router.get('/my-status/:studentId', isAuthenticated, getStudentFeeStatus);

// Staff/Admin can record payments and see collections
router.post('/record', isAuthenticated, authorizeRoles('admin', 'staff'), recordPayment);
router.get('/reports', isAuthenticated, authorizeRoles('admin'), getCollectionReports);

export default router;
