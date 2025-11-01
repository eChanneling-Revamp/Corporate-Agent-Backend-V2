"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimit = exports.selfOrAdmin = exports.adminOnly = exports.agentOnly = exports.optionalAuth = exports.authorize = exports.authenticate = void 0;
const jwt_1 = require("@/utils/jwt");
const response_1 = require("@/utils/response");
const prisma_1 = require("@/config/prisma");
/**
 * Authentication middleware to verify JWT tokens
 */
const authenticate = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return response_1.ResponseUtils.unauthorized(res, 'Access token required');
        }
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        // Verify token
        const decoded = jwt_1.JwtUtils.verifyAccessToken(token);
        if (decoded.type !== 'access') {
            return response_1.ResponseUtils.unauthorized(res, 'Invalid token type');
        }
        // Get user from database
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: decoded.userId },
            include: {
                agent: true,
            },
        });
        if (!user) {
            return response_1.ResponseUtils.unauthorized(res, 'User not found');
        }
        if (!user.isActive) {
            return response_1.ResponseUtils.unauthorized(res, 'Account is deactivated');
        }
        // Attach user to request
        req.user = {
            id: user.id,
            email: user.email,
            role: user.role,
            agent: user.agent || undefined,
        };
        next();
    }
    catch (error) {
        if (error.name === 'TokenExpiredError') {
            return response_1.ResponseUtils.unauthorized(res, 'Token expired');
        }
        if (error.name === 'JsonWebTokenError') {
            return response_1.ResponseUtils.unauthorized(res, 'Invalid token');
        }
        next(error);
    }
};
exports.authenticate = authenticate;
/**
 * Authorization middleware to check user roles
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return response_1.ResponseUtils.unauthorized(res, 'Authentication required');
        }
        if (!roles.includes(req.user.role)) {
            return response_1.ResponseUtils.forbidden(res, 'Insufficient permissions for this action');
        }
        next();
    };
};
exports.authorize = authorize;
/**
 * Optional authentication middleware (doesn't fail if no token)
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }
        const token = authHeader.substring(7);
        const decoded = jwt_1.JwtUtils.verifyAccessToken(token);
        if (decoded.type !== 'access') {
            return next();
        }
        const user = await prisma_1.prisma.user.findUnique({
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
    }
    catch (error) {
        // Ignore authentication errors for optional auth
        next();
    }
};
exports.optionalAuth = optionalAuth;
/**
 * Agent-only middleware
 */
const agentOnly = (req, res, next) => {
    if (!req.user) {
        return response_1.ResponseUtils.unauthorized(res, 'Authentication required');
    }
    if (req.user.role !== 'AGENT') {
        return response_1.ResponseUtils.forbidden(res, 'Agent access required');
    }
    if (!req.user.agent) {
        return response_1.ResponseUtils.forbidden(res, 'Agent profile not found');
    }
    next();
};
exports.agentOnly = agentOnly;
/**
 * Admin-only middleware
 */
const adminOnly = (req, res, next) => {
    if (!req.user) {
        return response_1.ResponseUtils.unauthorized(res, 'Authentication required');
    }
    if (req.user.role !== 'ADMIN') {
        return response_1.ResponseUtils.forbidden(res, 'Admin access required');
    }
    next();
};
exports.adminOnly = adminOnly;
/**
 * Self or admin access middleware (user can access their own data or admin can access any)
 */
const selfOrAdmin = (paramName = 'id') => {
    return (req, res, next) => {
        if (!req.user) {
            return response_1.ResponseUtils.unauthorized(res, 'Authentication required');
        }
        const resourceId = req.params[paramName];
        // Admin can access any resource
        if (req.user.role === 'ADMIN') {
            return next();
        }
        // User can only access their own resources
        if (req.user.id !== resourceId && req.user.agent?.id !== resourceId) {
            return response_1.ResponseUtils.forbidden(res, 'Access denied');
        }
        next();
    };
};
exports.selfOrAdmin = selfOrAdmin;
/**
 * Rate limiting middleware
 */
const rateLimit = (windowMs, maxRequests) => {
    const requests = new Map();
    return (req, res, next) => {
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
            return response_1.ResponseUtils.error(res, 'Too many requests, please try again later', 429);
        }
        clientRequests.count++;
        next();
    };
};
exports.rateLimit = rateLimit;
//# sourceMappingURL=auth.js.map