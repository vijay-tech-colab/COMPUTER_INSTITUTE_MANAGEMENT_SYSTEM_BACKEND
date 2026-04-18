import express from 'express';
import { 
    getMyNotifications, 
    markAsRead, 
    sendBulkNotification 
} from '../controllers/notification.controller.js';
import { isAuthenticated, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/me', isAuthenticated, getMyNotifications);

router.put('/read/:id', isAuthenticated, markAsRead);

router.post('/send-bulk', isAuthenticated, authorizeRoles('admin'), sendBulkNotification);

export default router;
