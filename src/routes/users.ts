import express from 'express';
import { prisma } from '../prisma';
import { ensureAuth, AuthRequest } from '../middleware/auth';

const POINTS_GOAL = 700_000;

const router = express.Router();

/**
 * Tipagens auxiliares
 */
type Role = 'atendente' | 'caixa' | 'estoque';

interface Sale {
  role: string;
  points: number;
}

/**
 * ================================
 * GET /ranking
 * Ranking geral dos usuários
 * ================================
 */
router.get('/ranking', async (req, res) => {
  try {
    const top = Number(req.query.top || 10);

    const users = await prisma.user.findMany({
      orderBy: { points: 'desc' },
      take: top,
      select: {
        id: true,
        name: true,
        points: true,
        genero: true,
        avatar: true
      }
    });

    return res.json({ ranking: users });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao carregar ranking' });
  }
});

/**
 * ================================
 * GET /progress
 * Progresso geral das vendas
 * ================================
 */
router.get('/progress', async (req, res) => {
  try {
    const agg = await prisma.sale.aggregate({
      _sum: { points: true }
    });

    const totalPoints = agg._sum.points || 0;
    const META = 700000;

    const percent = Math.round((totalPoints / META) * 10000) / 100;

    return res.json({
      totalPoints,
      meta: META,
      percent
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao buscar progresso geral' });
  }
});

/**
 * ==============================================
 * GET /me/progress
 * Progresso do usuário logado
 * ==============================================
 */
router.get('/me/progress', ensureAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        name: true,
        points: true,
        genero: true,
        avatar: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const sales = await prisma.sale.findMany({
      where: { userId: req.userId }
    });

    const pointsByRole: Record<Role, number> = {
      atendente: 0,
      caixa: 0,
      estoque: 0
    };

    sales.forEach((sale: Sale) => {
      const role = sale.role.toLowerCase() as Role;

      if (role in pointsByRole) {
        pointsByRole[role] += sale.points;
      }
    });

    const totalSales = sales.length;

    const progress = Number(
      ((user.points / POINTS_GOAL) * 100).toFixed(2)
    );

    return res.json({
      id: user.id,
      name: user.name,
      points: user.points,
      genero: user.genero,
      avatar: user.avatar,
      totalSales,
      pointsByRole,
      progressPercentage: progress
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao carregar progresso do usuário' });
  }
});

/**
 * ==============================================
 * PUT /me
 * Atualizar perfil (gênero e avatar)
 * ==============================================
 */
router.put('/me', ensureAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const { genero, avatar } = req.body;

    // Validação simples
    if (genero && typeof genero !== 'string') {
      return res.status(400).json({ error: 'Gênero inválido' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: { genero, avatar },
      select: {
        id: true,
        name: true,
        email: true,
        genero: true,
        avatar: true,
        points: true
      }
    });

    return res.json({
      message: 'Perfil atualizado com sucesso',
      user: updatedUser
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
});

export default router;
