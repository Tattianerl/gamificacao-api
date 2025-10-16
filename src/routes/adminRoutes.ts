import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';
import { ensureAdmin, AuthRequest } from '../middleware/ensureAdmin';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

// 🔹 Login admin (retorna token + user)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Campos obrigatórios' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Senha incorreta' });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        points: user.points,
      },
      token,
    });
  } catch (err) {
    console.error('Erro no login admin:', err);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
});

// 🔹 Listar todos usuários (somente admin)
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
    console.error('Erro ao buscar usuários:', err);
    return res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

// 🔹 Deletar usuário (somente admin)
router.delete('/user/:id', ensureAdmin, async (req: AuthRequest, res) => {
  const userIdToDelete = Number(req.params.id);
  if (!userIdToDelete) return res.status(400).json({ error: 'ID inválido' });

  try {
    const user = await prisma.user.findUnique({ where: { id: userIdToDelete } });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    // Deleta vendas associadas primeiro
    await prisma.sale.deleteMany({ where: { userId: userIdToDelete } });

    await prisma.user.delete({ where: { id: userIdToDelete } });

    return res.json({ message: `Usuário ${user.name} deletado com sucesso` });
  } catch (err) {
    console.error('Erro ao deletar usuário:', err);
    return res.status(500).json({ error: 'Erro ao deletar usuário' });
  }
});

export default router;
