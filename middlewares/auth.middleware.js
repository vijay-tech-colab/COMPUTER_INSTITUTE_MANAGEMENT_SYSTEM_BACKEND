import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { getCache, setCache } from '../utils/redis.js';

export const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ success: false, message: 'Authentication required. Please login.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
        
        // Try to get user from Redis
        const cacheKey = `user:${decoded.id}`;
        let user = await getCache(cacheKey);

        if (!user) {
            user = await User.findById(decoded.id).populate({
                path: 'assignedRole',
                populate: {
                    path: 'permissions.permission'
                }
            });
            if (user) {
                await setCache(cacheKey, user, 3600); // Cache for 1 hour
            }
        }

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        req.user = user;

        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }
};

export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Role (${req.user.role}) is not allowed to access this resource`
            });
        }
        next();
    };
};
