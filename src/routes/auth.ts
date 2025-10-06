import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

// Register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) 
    return res.status(400).json({ error: 'Campos obrigatórios' });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(400).json({ error: 'Email já cadastrado' });

  const hashed = await bcrypt.hash(password, 8);
  const user = await prisma.user.create({
    data: { name, email, password: hashed }
  });

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  return res.json({ user: { id: user.id, name: user.name, email: user.email, points: user.points }, token });
});

// 🔹 Redefinir senha
router.post("/reset-password", async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ error: "Email e nova senha são obrigatórios." });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return res.status(404).json({ error: "Usuário não encontrado." });
  }

  // Criptografa a nova senha
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Atualiza a senha no banco
  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  });

  // Gera um novo token
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

  res.json({ message: "Senha alterada com sucesso", token });
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Campos obrigatórios' });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(400).json({ error: 'Credenciais inválidas' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: 'Credenciais inválidas' });

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  return res.json({ user: { id: user.id, name: user.name, email: user.email, points: user.points }, token });
});

export default router;
