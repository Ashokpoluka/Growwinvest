import { Response, NextFunction } from 'express';
import { AuthRequest } from './protect.middleware.js';

export const authorize = (...roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `User role '${req.user?.role || 'unknown'}' is not authorized to access this resource`
            });
        }
        next();
    };
};
