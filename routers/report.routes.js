import express from 'express';
import { 
    generateFeeReceipt, 
    generateAdmissionReport,
    exportStudentsExcel,
    exportAttendanceExcel
} from '../controllers/report.controller.js';
import { isAuthenticated, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

// PDF Receipts
router.get('/receipt/:feeId/:paymentId', isAuthenticated, generateFeeReceipt);
router.get('/admission/:id', isAuthenticated, authorizeRoles('admin', 'staff'), generateAdmissionReport);

// Excel Exports
router.get('/export/students', isAuthenticated, authorizeRoles('admin'), exportStudentsExcel);
router.get('/export/attendance/:batchId', isAuthenticated, authorizeRoles('admin', 'staff'), exportAttendanceExcel);

export default router;
