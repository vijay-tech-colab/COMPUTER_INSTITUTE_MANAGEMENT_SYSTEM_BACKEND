import express from 'express';
import { createBook, getAllBooks, updateBook } from '../controllers/book.controller.js';
import { isAuthenticated, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', getAllBooks);

router.post('/', isAuthenticated, authorizeRoles('admin', 'staff'), createBook);
router.put('/:id', isAuthenticated, authorizeRoles('admin', 'staff'), updateBook);

export default router;
