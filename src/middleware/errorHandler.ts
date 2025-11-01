import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { ResponseUtils } from '@/utils/response';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handle Prisma errors and convert them to appropriate HTTP responses
 */
const handlePrismaError = (error: Prisma.PrismaClientKnownRequestError): AppError => {
  switch (error.code) {
    case 'P2002':
      // Unique constraint violation
      const target = error.meta?.target as string[] | undefined;
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
const handleZodError = (error: ZodError): { message: string; errors: Record<string, string[]> } => {
  const errors: Record<string, string[]> = {};
  
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
const sendErrorDev = (err: AppError, res: Response): void => {
  ResponseUtils.error(res, err.message, err.statusCode, err.stack);
};

/**
 * Production error response
 */
const sendErrorProd = (err: AppError, res: Response): void => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    ResponseUtils.error(res, err.message, err.statusCode);
  } else {
    // Programming or other unknown error: don't leak error details
    console.error('ERROR 💥', err);
    ResponseUtils.error(res, 'Something went wrong!', 500);
  }
};

/**
 * Global error handling middleware
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error occurred:', err);

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const { message, errors } = handleZodError(err);
    ResponseUtils.validationError(res, message, errors);
    return;
  }

  // Handle Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const appError = handlePrismaError(err);
    err = appError;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    err = new AppError('Invalid token', 401);
  } else if (err.name === 'TokenExpiredError') {
    err = new AppError('Token expired', 401);
  }

  // Convert unknown errors to AppError
  if (!(err instanceof AppError)) {
    err = new AppError(err.message || 'Something went wrong', 500, false);
  }

  const appError = err as AppError;

  // Send error response
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(appError, res);
  } else {
    sendErrorProd(appError, res);
  }
};

/**
 * Handle async errors in route handlers
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction): Promise<any> => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Handle 404 errors
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

/**
 * Validation middleware factory
 */
export const validate = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction): void => {
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
    } catch (error) {
      next(error);
    }
  };
};