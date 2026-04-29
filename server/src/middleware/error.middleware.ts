import { NextFunction, Request, Response } from 'express';

const databaseErrorCodes = new Set([
  'ECONNREFUSED',
  'ENOTFOUND',
  'EAI_AGAIN',
  'ETIMEDOUT',
  'EACCES',
  '28P01',
  '3D000',
  '57P01',
]);

const isDatabaseConnectionError = (error: any) => {
  if (databaseErrorCodes.has(error?.code)) {
    return true;
  }

  if (Array.isArray(error?.errors)) {
    return error.errors.some((nestedError: any) => databaseErrorCodes.has(nestedError?.code));
  }

  return false;
};

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error(error);

  if (isDatabaseConnectionError(error)) {
    return res.status(503).json({
      success: false,
      message: 'Database connection failed. Check DATABASE_URL and DATABASE_SSL on Render.',
    });
  }

  const status = error.status || 500;
  const message = status >= 500 ? 'Internal server error' : error.message || 'Internal server error';
  const details = error.details || undefined;

  res.status(status).json({ success: false, message, details });
};
