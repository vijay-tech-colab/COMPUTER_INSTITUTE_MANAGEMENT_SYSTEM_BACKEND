/**
 * Dynamic RBAC Middleware
 * Checks if the user has the required permission in their "permissions" array.
 * @param {string} resource - The resource (e.g., 'student')
 * @param {string} action - The action (e.g., 'view')
 */
export const checkPermission = (resource, action) => {
    return (req, res, next) => {
        const user = req.user;

        // Admin usually has all access, but we can also check for "*" permission
        if (user.role === 'admin' || (user.permissions && user.permissions.includes('*'))) {
            return next();
        }

        if (!user.permissions || user.permissions.length === 0) {
            return res.status(403).json({
                success: false,
                message: "Access Denied: You have no assigned permissions."
            });
        }

        const requiredPermission = `${resource}:${action}`;
        const wildcardPermission = `${resource}:*`;

        // 1. Check direct permissions
        if (user.permissions && (user.permissions.includes(requiredPermission) || user.permissions.includes(wildcardPermission))) {
            return next();
        }

        // 2. Check Role-based permissions (Deep Populated)
        if (user.assignedRole && user.assignedRole.permissions) {
            const rolePerm = user.assignedRole.permissions.find(p => 
                p.permission && (p.permission.resource === resource || p.permission.resource === '*')
            );
            
            if (rolePerm && (rolePerm.actions.includes(action) || rolePerm.actions.includes('*'))) {
                return next();
            }
        }

        return res.status(403).json({
            success: false,
            message: `Access Denied: You do not have permission to ${action} ${resource}.`
        });
    };
};
