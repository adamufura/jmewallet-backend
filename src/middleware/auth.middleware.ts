import { Response, NextFunction } from 'express';
import { AuthRequest, AdminAuthRequest } from '../types';
import { verifyToken, extractTokenFromHeader } from '../utils/jwt';
import { unauthorizedResponse } from '../utils/response';

export const authenticateUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      unauthorizedResponse(res, 'No token provided');
      return;
    }

    const decoded = verifyToken(token);

    if (decoded.role !== 'user') {
      unauthorizedResponse(res, 'Invalid token for user access');
      return;
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: 'user',
    };

    next();
  } catch (error) {
    unauthorizedResponse(res, 'Invalid or expired token');
  }
};

export const authenticateAdmin = async (
  req: AdminAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      unauthorizedResponse(res, 'No token provided');
      return;
    }

    const decoded = verifyToken(token);

    if (decoded.role !== 'admin') {
      unauthorizedResponse(res, 'Invalid token for admin access');
      return;
    }

    req.admin = {
      id: decoded.id,
      email: decoded.email,
      role: 'admin',
    };

    next();
  } catch (error) {
    unauthorizedResponse(res, 'Invalid or expired token');
  }
};

