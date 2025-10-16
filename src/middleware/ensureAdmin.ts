import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';

// Define a tipagem personalizada para Request
export interface AuthRequest extends Request {
  user?: {
    id: number;
    role: string;
  };
}

// Middleware que valida o token e verifica se o usuário é admin
export const ensureAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const [, token] = authHeader.split(' ');
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number; role: string };

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // 🔥 Verifica se o usuário é admin
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado: apenas administradores' });
    }

    req.user = { id: user.id, role: user.role };
    next();
  } catch (err) {
    console.error('Erro no ensureAdmin:', err);
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};
