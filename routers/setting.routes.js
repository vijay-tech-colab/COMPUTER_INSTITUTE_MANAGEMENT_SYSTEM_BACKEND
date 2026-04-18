import express from 'express';
import { isAuthenticated, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

// router.get('/', isAuthenticated, authorizeRoles('admin'), getSettings);
// router.put('/', isAuthenticated, authorizeRoles('admin'), updateSettings);

export default router;
