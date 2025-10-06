import express from 'express';
import { prisma } from '../prisma';
import { ensureAdmin, AuthRequest } from '../middleware/ensureAdmin'; 

const router = express.Router();

// GET /admin/users - apenas admin
router.get('/users', ensureAdmin, async (req: AuthRequest, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        points: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(users);
  } catch (err) {
    console.error('adminRoutes /users error:', err);
    return res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

//Delete usuario
router.delete('/user/:id', ensureAdmin, async (req: AuthRequest, res) => {
  const userIdToDelete = Number(req.params.id);
  if (!userIdToDelete) return res.status(400).json({ error: 'ID inválido' });

  try {
    const user = await prisma.user.findUnique({ where: { id: userIdToDelete } });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    // Deleta vendas relacionadas primeiro
    await prisma.sale.deleteMany({ where: { userId: userIdToDelete } });

    // Agora deleta o usuário
    await prisma.user.delete({ where: { id: userIdToDelete } });

    return res.json({ message: `Usuário ${user.name} deletado com sucesso` });
  } catch (err) {
    console.error('Erro ao deletar usuário:', err);
    return res.status(500).json({ error: 'Erro ao deletar usuário' });
  }
});

export default router;
