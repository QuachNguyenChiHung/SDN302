import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'I spent five nights at Freddy';

export interface UserPayload {
    id: string;
    username: string;
    isAdmin: boolean;
}

declare global {
    namespace Express {
        interface Request {
            user?: UserPayload;
        }
    }
}

/**
 * Middleware to verify JWT token from signed cookie or Authorization header.
 * Sets req.user = { id, username, isAdmin }
 */
export function verifyToken(req: Request, res: Response, next: NextFunction) {
    try {
        let token: string | undefined;

        // Check signed cookie first
        if (req.signedCookies && req.signedCookies.token) {
            token = req.signedCookies.token;
        }
        // Fallback to Authorization header
        else if (req.headers.authorization?.startsWith('Bearer ')) {
            token = req.headers.authorization.slice(7);
        }
        // Also check regular cookies
        else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return res.status(401).json({ msg: 'Authentication required' });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ msg: 'Invalid or expired token' });
    }
}

/**
 * Optional: verify token if present, but don't require it
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
    try {
        let token: string | undefined;

        if (req.signedCookies && req.signedCookies.token) {
            token = req.signedCookies.token;
        } else if (req.headers.authorization?.startsWith('Bearer ')) {
            token = req.headers.authorization.slice(7);
        } else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        if (token) {
            const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
            req.user = decoded;
        }
        next();
    } catch {
        // Token invalid, but continue without user
        next();
    }
}

export default { verifyToken, optionalAuth };
