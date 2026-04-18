import express from 'express';
import { 
    createBatch, 
    getBatches, 
    addStudentToBatch, 
    updateBatch 
} from '../controllers/batch.controller.js';
import { isAuthenticated, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.route('/')
    .get(isAuthenticated, getBatches)
    .post(isAuthenticated, authorizeRoles('admin', 'staff'), createBatch);

router.post('/assign-student', isAuthenticated, authorizeRoles('admin', 'staff'), addStudentToBatch);

router.route('/:id')
    .put(isAuthenticated, authorizeRoles('admin', 'staff'), updateBatch);

export default router;
