/**
 * Global error handler middleware for Express server
 */
import { Request, Response, NextFunction } from 'express';
import { isDevelopment } from '../../config';

// Error interface
export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
  isOperational?: boolean;
}

/**
 * Global error handler middleware for Express
 */
export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Set default status code if not provided
  const statusCode = err.statusCode || 500;
  
  // Prepare error response
  const errorResponse = {
    success: false,
    error: {
      message: err.message || 'Server error occurred',
      code: err.code || 'INTERNAL_SERVER_ERROR'
    }
  };
  
  // Add stack trace in development mode only
  if (isDevelopment) {
    errorResponse.error['stack'] = err.stack;
    
    // Add detailed error information in development
    if (err.details) {
      errorResponse.error['details'] = err.details;
    }
    
    console.error(`[ERROR] ${req.method} ${req.path}:`, {
      statusCode,
      error: err.message,
      stack: err.stack
    });
  } else {
    // Log error in production but don't expose details to client
    console.error(`[ERROR] ${req.method} ${req.path} (${statusCode}):`, err.message);
    if (statusCode === 500) {
      console.error(err);
    }
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * Create an API error with status code and optional details
 */
export function createApiError(
  message: string, 
  statusCode: number = 500,
  code: string = 'INTERNAL_SERVER_ERROR',
  details?: any
): ApiError {
  const error: ApiError = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  error.details = details;
  error.isOperational = true;
  return error;
}

/**
 * 404 not found error handler
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = createApiError(`Not found: ${req.originalUrl}`, 404, 'RESOURCE_NOT_FOUND');
  next(error);
};