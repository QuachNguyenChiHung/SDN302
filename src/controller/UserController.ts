import type { Request, Response } from 'express';
import UserService from '../services/UserService.js';
import AuthService from '../services/AuthService.js';

/**
 * POST /api/users/login
 * Body: { username, password }
 * Returns: { token, user: { id, username, isAdmin } }
 */
export async function login(req: Request, res: Response) {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ msg: 'Username and password are required' });
        }

        const token = await AuthService.login(username, password);

        if (!token) {
            return res.status(401).json({ msg: 'Invalid username or password' });
        }

        // Set signed httpOnly cookie
        res.cookie('token', token, {
            httpOnly: true,
            signed: true,
            sameSite: 'lax',
            secure: false, // Set to true in production with HTTPS
            maxAge: 60 * 60 * 1000, // 1 hour
            path: '/'
        });

        // Also return token in response for frontend storage if needed
        const user = await UserService.getUserByUsername(username);
        return res.status(200).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                isAdmin: user.isAdmin
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ msg: 'Login failed' });
    }
}

/**
 * POST /api/users/register
 * Body: { username, password, isAdmin? }
 * Returns: { id, username }
 */
export async function register(req: Request, res: Response) {
    try {
        const { username, password, isAdmin } = req.body;

        if (!username || !password) {
            return res.status(400).json({ msg: 'Username and password are required' });
        }

        if (password.length < 4) {
            return res.status(400).json({ msg: 'Password must be at least 4 characters' });
        }

        const userData = {
            username,
            password,
            isAdmin: isAdmin || false
        };

        const user = await UserService.createUser(userData);

        return res.status(201).json({
            id: user._id,
            username: user.username
        });
    } catch (error: any) {
        if (error.message?.includes('duplicate') || error.code === 11000) {
            return res.status(400).json({ msg: 'Username already exists' });
        }
        console.error('Register error:', error);
        return res.status(500).json({ msg: 'Registration failed' });
    }
}

/**
 * GET /api/users/me
 * Returns current authenticated user info
 * Requires: verifyToken middleware
 */
export async function getMe(req: Request, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ msg: 'Not authenticated' });
        }

        const user = await UserService.getUserById(req.user.id);

        return res.status(200).json({
            id: user._id,
            username: user.username,
            isAdmin: user.isAdmin
        });
    } catch (error) {
        console.error('GetMe error:', error);
        return res.status(500).json({ msg: 'Failed to get user info' });
    }
}

/**
 * POST /api/users/logout
 * Clears the auth cookie
 */
export async function logout(req: Request, res: Response) {
    res.clearCookie('token');
    return res.status(200).json({ msg: 'Logged out successfully' });
}

export default { login, register, getMe, logout };
