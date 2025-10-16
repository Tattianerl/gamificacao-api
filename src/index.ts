import express from 'express';
import cors from "cors";
import authRoutes from './routes/auth';
import salesRoutes from './routes/sales';
import usersRoutes from './routes/users';
import adminRoutes from './routes/adminRoutes';
import dotenv from 'dotenv';
import cron from "node-cron";
import { prisma } from './prisma';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Rotas protegidas (admin)
app.use('/admin', adminRoutes);
// Rotas públicas
app.use('/auth', authRoutes);
app.use('/sales', salesRoutes);
app.use('/users', usersRoutes);

app.get('/', (req, res) => res.send('API de Gamificação ativa'));

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

// Cron job: todo dia 1 do mês às 00:00 zera dados
cron.schedule("0 0 1 * *", async () => {
  console.log("🔄 Zerando pontos dos atendentes...");

  try {
    await prisma.sale.deleteMany(); 
    console.log("✅ Pontos resetados com sucesso.");
  } catch (err) {
    console.error("❌ Erro ao zerar pontos:", err);
  }
});