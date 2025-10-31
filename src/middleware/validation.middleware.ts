import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { validationErrorResponse } from '../utils/response';

export const validate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    validationErrorResponse(res, errors.array());
    return;
  }
  
  next();
};

