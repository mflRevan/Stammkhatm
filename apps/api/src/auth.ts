import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

export interface AuthPayload {
  userId: string;
}

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export function signToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
}

export function verifyToken(token: string): AuthPayload {
  return jwt.verify(token, JWT_SECRET) as AuthPayload;
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.token;
  if (!token) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  try {
    const payload = verifyToken(token);
    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function optionalAuthMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const token = req.cookies?.token;
  if (!token) {
    next();
    return;
  }
  try {
    const payload = verifyToken(token);
    req.userId = payload.userId;
  } catch {
    req.userId = undefined;
  }
  next();
}

export async function adminMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.userId) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) {
    res.status(401).json({ error: 'User not found' });
    return;
  }
  const admin = await prisma.admin.findUnique({ where: { email: user.email } });
  if (!admin) {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  next();
}
