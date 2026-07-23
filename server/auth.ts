import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import type { Request, Response, NextFunction } from 'express';
import { env } from './config/env';
import { storage } from './storage';
import type { AuthUser } from '@shared/schema';

export interface AuthRequest extends Request {
  user?: AuthUser;
}

// JWT token generation
export const generateToken = (user: AuthUser): string => {
  if (!env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign(
    {
      userId: user.id,
      username: user.username,
      role: user.role
    },
    env.JWT_SECRET,
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
    if (!env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured');
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as any;
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

// Check if current user can access target user's data - SECURITY SCOPED
export const canAccessUserData = (currentUser: AuthUser, targetUserId?: string): boolean => {
  // Admin can access all users
  if (currentUser.role === 'admin') return true;
  
  // Manager can only access their own data unless specifically checking user relationships
  if (currentUser.role === 'manager') {
    return !targetUserId || targetUserId === currentUser.id;
  }
  
  // Investors can only access their own data
  if (currentUser.role === 'investor') {
    return !targetUserId || targetUserId === currentUser.id;
  }
  
  return false;
};

// SECURITY CRITICAL: Check if manager can access specific investor data
export const canManagerAccessInvestor = async (managerId: string, investorId: string): Promise<boolean> => {
  try {
    // Import here to avoid circular dependency
    const { storage } = await import('./storage');
    
    // Check if there's an active assignment between this manager and investor
    const hasAssignment = await storage.checkManagerInvestorAssignment(managerId, investorId);
    
    return hasAssignment;
  } catch (error) {
    console.error('Error checking manager-investor assignment:', error);
    // FAIL SECURE: Return false on any error to prevent unauthorized access
    return false;
  }
};

// NEW: Role-based data access helper for specific operations
export const hasDataAccess = (userRole: string, operation: 'read' | 'write' | 'delete', dataType: 'investors' | 'users' | 'payments'): boolean => {
  const permissions = {
    admin: { investors: ['read', 'write', 'delete'], users: ['read', 'write', 'delete'], payments: ['read', 'write', 'delete'] },
    manager: { investors: ['read', 'write'], users: ['read'], payments: ['read'] },
    investor: { investors: [], users: [], payments: ['read'] }
  };

  const perms = permissions[userRole as keyof typeof permissions]?.[dataType] as string[] | undefined;
  return perms?.includes(operation) ?? false;
};

// Extract user info from token without throwing errors
export const getUserFromToken = async (token: string): Promise<AuthUser | null> => {
  try {
    if (!env.JWT_SECRET) {
      return null;
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as any;
    const user = await storage.getAuthUser(decoded.userId);
    
    return user && user.status === 'active' ? user : null;
  } catch {
    return null;
  }
};