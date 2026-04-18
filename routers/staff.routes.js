import express from 'express';
import { 
    onboardStaff, 
    getStaffList, 
    updateStaffSalary, 
    deleteStaff 
} from '../controllers/staff.controller.js';
import { isAuthenticated, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All staff routes are typically Admin only
router.use(isAuthenticated, authorizeRoles('admin'));

router.route('/')
    .get(getStaffList)
    .post(onboardStaff);

router.route('/:id')
    .put(updateStaffSalary)
    .delete(deleteStaff);

export default router;
