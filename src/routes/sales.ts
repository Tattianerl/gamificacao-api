import express from 'express';
import { prisma } from '../prisma';
import { ensureAuth, AuthRequest } from '../middleware/auth';
import { calculatePointsFromReais } from '../utils/calcPoints';

const router = express.Router();

// Registrar venda (usuario logado faz o registro)
router.post('/', ensureAuth, async (req: AuthRequest, res) => {
  const { value, role } = req.body; 
  if (!value || !role) return res.status(400).json({ error: 'value e role são obrigatórios' });

  const roleStr = (role as string).toLowerCase();
  if (!['tendente', 'caixa', 'estoque'].includes(roleStr)) {
    return res.status(400).json({ error: 'role inválida' });
  }
  if (!req.userId) return res.status(401).json({ error: 'Usuário não autenticado' });

  const { cents, points } = calculatePointsFromReais(Number(value), roleStr as any);

  
  const roleEnum = roleStr.toUpperCase();

  const sale = await prisma.sale.create({
    data: {
      userId: req.userId,
      role: roleEnum as any,
      valueCents: cents,
      points: points
    }
  });

  // atualiza pontos do usuário
  const updatedUser = await prisma.user.update({
    where: { id: req.userId },
    data: { points: { increment: points } }
  });

  return res.json({ sale, userPoints: updatedUser.points });
});

// listar vendas do usuário logado
router.get('/me', ensureAuth, async (req: AuthRequest, res) => {
  if (!req.userId) return res.status(401).json({ error: 'Usuário não autenticado' });
  const sales = await prisma.sale.findMany({ where: { userId: req.userId }, orderBy: { createdAt: 'desc' } });
  return res.json({ sales });
});

export default router;
