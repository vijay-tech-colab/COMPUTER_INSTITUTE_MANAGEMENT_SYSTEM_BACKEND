import express from 'express';
import {
    createRole,
    getRoles,
    updateRole,
    deleteRole,
    getPermissionManifest,
    seedPermissions
} from '../controllers/role.controller.js';
import { isAuthenticated, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(isAuthenticated, authorizeRoles('admin'));

router.route('/')
    .get(getRoles)
    .post(createRole);

router.get('/manifest', getPermissionManifest);
router.post('/seed', seedPermissions);

router.route('/:id')
    .put(updateRole)
    .delete(deleteRole);

export default router;
