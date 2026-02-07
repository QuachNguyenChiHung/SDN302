import type { Request, Response, NextFunction } from 'express';

/**
 * Middleware factory to require a specific role.
 * Must be used AFTER verifyToken middleware.
 */
export function requireRole(role: 'admin' | 'user') {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ msg: 'Authentication required' });
        }

        if (role === 'admin' && !req.user.isAdmin) {
            return res.status(403).json({ msg: 'Admin access required' });
        }

        // If role is 'user', any authenticated user can proceed
        next();
    };
}

/**
 * Middleware factory to require owner or admin access.
 * getOwnerIdFromReq is a function that extracts the owner ID from the request.
 */
export function requireOwnerOrAdmin(getOwnerIdFromReq: (req: Request) => string | Promise<string>) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                return res.status(401).json({ msg: 'Authentication required' });
            }

            // Admin can access anything
            if (req.user.isAdmin) {
                return next();
            }

            const ownerId = await getOwnerIdFromReq(req);

            if (req.user.id !== ownerId) {
                return res.status(403).json({ msg: 'Access denied' });
            }

            next();
        } catch (error) {
            return res.status(500).json({ msg: 'Error checking ownership' });
        }
    };
}

export default { requireRole, requireOwnerOrAdmin };
