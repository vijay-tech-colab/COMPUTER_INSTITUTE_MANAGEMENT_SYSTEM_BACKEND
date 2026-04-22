import express from 'express';
import {
    registerUser,
    loginUser,
    logoutUser,
    getUserDetails,
    updateProfile,
    manageUserPermissions
} from '../controllers/auth.controller.js';
import { isAuthenticated, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/logout', logoutUser);

router.get('/me', isAuthenticated, getUserDetails);
router.put('/me/update', isAuthenticated, updateProfile);

// Admin Routes
router.put('/admin/permissions', isAuthenticated, authorizeRoles('admin'), manageUserPermissions);

export default router;
