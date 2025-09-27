import express from 'express';
import { prisma } from '../prisma';

const router = express.Router();

router.get('/ranking', async (req, res) => {
  const top = Number(req.query.top || 10);
  const users = await prisma.user.findMany({
    orderBy: { points: 'desc' },
    take: top,
    select: { id: true, name: true, points: true }
  });
  return res.json({ ranking: users });
});

router.get('/progress', async (req, res) => {
  const agg = await prisma.sale.aggregate({ _sum: { points: true } });
  const totalPoints = agg._sum.points || 0;
  const META = 700000;
  const percent = Math.round((totalPoints / META) * 10000) / 100; 
  return res.json({ totalPoints, meta: META, percent });
});

export default router;
