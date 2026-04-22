import express from 'express';
import {
    createBranch,
    getAllBranches,
    getBranchDetails,
    updateBranch,
    deleteBranch
} from '../controllers/branch.controller.js';
import { isAuthenticated, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', getAllBranches);
router.post('/', isAuthenticated, authorizeRoles('admin'), createBranch);

router.route('/:id')
    .get(getBranchDetails)
    .put(isAuthenticated, authorizeRoles('admin'), updateBranch)
    .delete(isAuthenticated, authorizeRoles('admin'), deleteBranch);

export default router;
