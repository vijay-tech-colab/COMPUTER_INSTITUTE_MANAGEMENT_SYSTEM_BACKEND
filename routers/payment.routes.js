import express from 'express';
import { createOrder, verifyPayment } from '../controllers/payment.controller.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/checkout', isAuthenticated, createOrder);
router.post('/verify', isAuthenticated, verifyPayment);

export default router;
