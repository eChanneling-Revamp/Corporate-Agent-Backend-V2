"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.notFoundHandler = exports.asyncHandler = exports.errorHandler = exports.AppError = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const response_1 = require("@/utils/response");
class AppError extends Error {
    statusCode;
    isOperational;
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
/**
 * Handle Prisma errors and convert them to appropriate HTTP responses
 */
const handlePrismaError = (error) => {
    switch (error.code) {
        case 'P2002':
            // Unique constraint violation
            const target = error.meta?.target;
            const field = target?.[0] || 'field';
            return new AppError(`${field} already exists`, 409);
        case 'P2014':
            // Invalid ID
            return new AppError('Invalid ID provided', 400);
        case 'P2003':
            // Foreign key constraint violation
            return new AppError('Related record not found', 400);
        case 'P2025':
            // Record not found
            return new AppError('Record not found', 404);
        case 'P2016':
            // Query interpretation error
            return new AppError('Invalid query parameters', 400);
        default:
            return new AppError('Database operation failed', 500);
    }
};
/**
 * Handle Zod validation errors
 */
const handleZodError = (error) => {
    const errors = {};
    error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!errors[path]) {
            errors[path] = [];
        }
        errors[path].push(err.message);
    });
    return {
        message: 'Validation failed',
        errors,
    };
};
/**
 * Development error response
 */
const sendErrorDev = (err, res) => {
    response_1.ResponseUtils.error(res, err.message, err.statusCode, err.stack);
};
/**
 * Production error response
 */
const sendErrorProd = (err, res) => {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        response_1.ResponseUtils.error(res, err.message, err.statusCode);
    }
    else {
        // Programming or other unknown error: don't leak error details
        console.error('ERROR 💥', err);
        response_1.ResponseUtils.error(res, 'Something went wrong!', 500);
    }
};
/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
    console.error('Error occurred:', err);
    // Handle Zod validation errors
    if (err instanceof zod_1.ZodError) {
        const { message, errors } = handleZodError(err);
        response_1.ResponseUtils.validationError(res, message, errors);
        return;
    }
    // Handle Prisma errors
    if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        const appError = handlePrismaError(err);
        err = appError;
    }
    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        err = new AppError('Invalid token', 401);
    }
    else if (err.name === 'TokenExpiredError') {
        err = new AppError('Token expired', 401);
    }
    // Convert unknown errors to AppError
    if (!(err instanceof AppError)) {
        err = new AppError(err.message || 'Something went wrong', 500, false);
    }
    const appError = err;
    // Send error response
    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(appError, res);
    }
    else {
        sendErrorProd(appError, res);
    }
};
exports.errorHandler = errorHandler;
/**
 * Handle async errors in route handlers
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        return Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
/**
 * Handle 404 errors
 */
const notFoundHandler = (req, res, next) => {
    const error = new AppError(`Route ${req.originalUrl} not found`, 404);
    next(error);
};
exports.notFoundHandler = notFoundHandler;
/**
 * Validation middleware factory
 */
const validate = (schema) => {
    return (req, res, next) => {
        try {
            const { body, query, params } = req;
            // Validate request data
            const validationData = {
                ...(schema.body && { body }),
                ...(schema.query && { query }),
                ...(schema.params && { params }),
            };
            if (schema.body) {
                req.body = schema.body.parse(body);
            }
            if (schema.query) {
                req.query = schema.query.parse(query);
            }
            if (schema.params) {
                req.params = schema.params.parse(params);
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.validate = validate;
//# sourceMappingURL=errorHandler.js.map