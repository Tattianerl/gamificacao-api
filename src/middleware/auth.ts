import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: number;
}

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export function ensureAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Token não enviado' });
  const [, token] = header.split(' ');
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    req.userId = payload.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}
