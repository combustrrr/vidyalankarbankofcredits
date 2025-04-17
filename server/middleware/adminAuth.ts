/**
 * Admin Authentication Middleware
 * 
 * This middleware validates admin authentication for protected routes.
 */
import { Request, Response, NextFunction } from 'express';
import { createApiError } from './errorHandler';
import { adminPasscode } from '../../config';

export interface AuthenticatedRequest extends Request {
  admin?: boolean;
}

/**
 * Middleware to check if the request has valid admin authentication
 */
export const adminAuthMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check for admin auth header
    const authHeader = req.headers['admin-auth'];
    
    // If no auth header is present or it doesn't match, reject the request
    if (!authHeader || authHeader !== adminPasscode) {
      return next(
        createApiError('Unauthorized: Admin authentication required', 401, 'UNAUTHORIZED')
      );
    }

    // Mark request as admin authenticated
    req.admin = true;
    next();
  } catch (error) {
    next(createApiError('Authentication error', 401, 'AUTH_ERROR'));
  }
};