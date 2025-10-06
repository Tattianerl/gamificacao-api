import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma'; 

export interface AuthRequest extends Request {
  userId?: number;
}

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

// middleware que garante que o token é válido e que o usuário é admin (role === 'admin')
export async function ensureAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ error: 'Token não enviado' });
  }

  const [, token] = header.split(' ');

  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;

    if (!payload || !payload.userId) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    // padronize role em lowercase no banco ('admin' / 'user' / 'atendente' etc.)
    if ((user.role ?? '').toLowerCase() !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem acessar.' });
    }

    req.userId = user.id;
    return next();
  } catch (err) {
    console.error('ensureAdmin error:', err);
    return res.status(401).json({ error: 'Token inválido' });
  }
}
