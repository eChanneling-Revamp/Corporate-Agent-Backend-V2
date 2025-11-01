import { Request, Response, NextFunction } from 'express';
import { JwtUtils } from '@/utils/jwt';
import { ResponseUtils } from '@/utils/response';
import { prisma } from '@/config/prisma';
import { AppError } from './errorHandler';

/**
 * Authentication middleware to verify JWT tokens
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ResponseUtils.unauthorized(res, 'Access token required') as any;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = JwtUtils.verifyAccessToken(token);
    
    if (decoded.type !== 'access') {
      return ResponseUtils.unauthorized(res, 'Invalid token type') as any;
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        agent: true,
      },
    });

    if (!user) {
      return ResponseUtils.unauthorized(res, 'User not found') as any;
    }

    if (!user.isActive) {
      return ResponseUtils.unauthorized(res, 'Account is deactivated') as any;
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      agent: user.agent || undefined,
    };

    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return ResponseUtils.unauthorized(res, 'Token expired') as any;
    }
    if (error.name === 'JsonWebTokenError') {
      return ResponseUtils.unauthorized(res, 'Invalid token') as any;
    }
    next(error);
  }
};

/**
 * Authorization middleware to check user roles
 */
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return ResponseUtils.unauthorized(res, 'Authentication required') as any;
    }

    if (!roles.includes(req.user.role)) {
      return ResponseUtils.forbidden(
        res,
        'Insufficient permissions for this action'
      ) as any;
    }

    next();
  };
};

/**
 * Optional authentication middleware (doesn't fail if no token)
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = JwtUtils.verifyAccessToken(token);
    
    if (decoded.type !== 'access') {
      return next();
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        agent: true,
      },
    });

    if (user && user.isActive) {
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        agent: user.agent || undefined,
      };
    }

    next();
  } catch (error) {
    // Ignore authentication errors for optional auth
    next();
  }
};

/**
 * Agent-only middleware
 */
export const agentOnly = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    return ResponseUtils.unauthorized(res, 'Authentication required') as any;
  }

  if (req.user.role !== 'AGENT') {
    return ResponseUtils.forbidden(res, 'Agent access required') as any;
  }

  if (!req.user.agent) {
    return ResponseUtils.forbidden(res, 'Agent profile not found') as any;
  }

  next();
};

/**
 * Admin-only middleware
 */
export const adminOnly = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    return ResponseUtils.unauthorized(res, 'Authentication required') as any;
  }

  if (req.user.role !== 'ADMIN') {
    return ResponseUtils.forbidden(res, 'Admin access required') as any;
  }

  next();
};

/**
 * Self or admin access middleware (user can access their own data or admin can access any)
 */
export const selfOrAdmin = (paramName: string = 'id') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return ResponseUtils.unauthorized(res, 'Authentication required') as any;
    }

    const resourceId = req.params[paramName];
    
    // Admin can access any resource
    if (req.user.role === 'ADMIN') {
      return next();
    }

    // User can only access their own resources
    if (req.user.id !== resourceId && req.user.agent?.id !== resourceId) {
      return ResponseUtils.forbidden(res, 'Access denied') as any;
    }

    next();
  };
};

/**
 * Rate limiting middleware
 */
export const rateLimit = (windowMs: number, maxRequests: number) => {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction): void => {
    const clientId = req.ip || 'unknown';
    const now = Date.now();
    
    const clientRequests = requests.get(clientId);
    
    if (!clientRequests || now > clientRequests.resetTime) {
      // Reset window
      requests.set(clientId, {
        count: 1,
        resetTime: now + windowMs,
      });
      return next();
    }

    if (clientRequests.count >= maxRequests) {
      return ResponseUtils.error(
        res,
        'Too many requests, please try again later',
        429
      ) as any;
    }

    clientRequests.count++;
    next();
  };
};