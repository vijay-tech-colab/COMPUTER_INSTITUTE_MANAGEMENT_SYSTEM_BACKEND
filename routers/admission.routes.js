import express from 'express';
import { 
    newEnquiry, 
    updateAdmissionStatus, 
    convertToStudent 
} from '../controllers/admission.controller.js';
import { isAuthenticated, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/enquiry', newEnquiry);

router.put('/status/:id', isAuthenticated, authorizeRoles('admin', 'staff'), updateAdmissionStatus);
router.post('/enroll/:id', isAuthenticated, authorizeRoles('admin'), convertToStudent);

export default router;
