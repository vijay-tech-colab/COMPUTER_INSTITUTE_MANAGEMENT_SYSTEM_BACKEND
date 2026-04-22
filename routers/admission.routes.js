import express from 'express';
import { 
    newEnquiry, 
    updateAdmissionStatus, 
    convertToStudent,
    getAdmissions
} from '../controllers/admission.controller.js';
import { isAuthenticated, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', isAuthenticated, authorizeRoles('admin', 'staff'), getAdmissions);
router.post('/enquiry', newEnquiry);

router.put('/status/:id', isAuthenticated, authorizeRoles('admin', 'staff'), updateAdmissionStatus);
router.post('/enroll/:id', isAuthenticated, authorizeRoles('admin'), convertToStudent);

export default router;
