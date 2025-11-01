import { Request, Response, NextFunction } from 'express';
/**
 * Authentication middleware to verify JWT tokens
 */
export declare const authenticate: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Authorization middleware to check user roles
 */
export declare const authorize: (...roles: string[]) => (req: Request, res: Response, next: NextFunction) => void;
/**
 * Optional authentication middleware (doesn't fail if no token)
 */
export declare const optionalAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Agent-only middleware
 */
export declare const agentOnly: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Admin-only middleware
 */
export declare const adminOnly: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Self or admin access middleware (user can access their own data or admin can access any)
 */
export declare const selfOrAdmin: (paramName?: string) => (req: Request, res: Response, next: NextFunction) => void;
/**
 * Rate limiting middleware
 */
export declare const rateLimit: (windowMs: number, maxRequests: number) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map