import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const JWT_SECRET =
  process.env.JWT_SECRET || 'change-this-in-production-immediately';
const JWT_EXPIRES_IN = '7d';
const ISSUER = 'vityaz-game';

export interface JWTPayload {
  userId: number;
  username: string;
  role: 'user' | 'admin' | 'moderator';
  iat?: number;
  exp?: number;
}

/**
 * Generate JWT token
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: ISSUER,
  });
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: ISSUER,
    }) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Middleware to authenticate requests
 */
export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Middleware to check admin role
 */
export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'moderator')) {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  next();
}

/**
 * Middleware to check moderator role
 */
export function requireModerator(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user || req.user.role !== 'moderator') {
    res.status(403).json({ error: 'Moderator access required' });
    return;
  }
  next();
}

/**
 * Type augmentation for Request
 */
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}
