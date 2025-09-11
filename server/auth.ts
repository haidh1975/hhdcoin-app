import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import type { Request, Response, NextFunction } from 'express';
import { storage } from './storage';
import type { AuthUser } from '@shared/schema';

export interface AuthRequest extends Request {
  user?: AuthUser;
}

// JWT token generation
export const generateToken = (user: AuthUser): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  
  return jwt.sign(
    { 
      userId: user.id, 
      username: user.username, 
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' } // Token expires in 7 days
  );
};

// Hash password
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12; // High security salt rounds
  return await bcrypt.hash(password, saltRounds);
};

// Verify password
export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

// Authentication middleware
export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required', code: 'NO_TOKEN' });
  }

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
    const user = await storage.getAuthUser(decoded.userId);
    
    if (!user || user.status !== 'active') {
      return res.status(401).json({ message: 'User not found or inactive', code: 'USER_INACTIVE' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Token expired', code: 'TOKEN_EXPIRED' });
    } else if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Invalid token', code: 'INVALID_TOKEN' });
    }
    
    return res.status(500).json({ message: 'Authentication error', code: 'AUTH_ERROR' });
  }
};

// Role-based authorization middleware
export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required', code: 'AUTH_REQUIRED' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Insufficient permissions', 
        code: 'INSUFFICIENT_PERMISSIONS',
        required: roles,
        current: req.user.role
      });
    }

    next();
  };
};

// Role-based access control shortcuts
export const requireAdmin = requireRole(['admin']);
export const requireManager = requireRole(['admin', 'manager']); // Admin or Manager
export const requireInvestor = requireRole(['admin', 'manager', 'investor']); // Any authenticated user

// Role-based access control helper
export const hasPermission = (userRole: string, requiredRoles: string[]): boolean => {
  return requiredRoles.includes(userRole);
};

// Check if current user can access target user's data
export const canAccessUserData = (currentUser: AuthUser, targetUserId?: string): boolean => {
  // Admin can access all users
  if (currentUser.role === 'admin') return true;
  
  // Manager can access their managed investors (for now, all investors)
  if (currentUser.role === 'manager') return true;
  
  // Investors can only access their own data
  if (currentUser.role === 'investor') {
    return !targetUserId || targetUserId === currentUser.id;
  }
  
  return false;
};

// Extract user info from token without throwing errors
export const getUserFromToken = async (token: string): Promise<AuthUser | null> => {
  try {
    if (!process.env.JWT_SECRET) {
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
    const user = await storage.getAuthUser(decoded.userId);
    
    return user && user.status === 'active' ? user : null;
  } catch {
    return null;
  }
};