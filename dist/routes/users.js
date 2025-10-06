"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = require("../prisma");
const auth_1 = require("../middleware/auth");
const POINTS_GOAL = 700_000;
const router = express_1.default.Router();
router.get('/ranking', async (req, res) => {
    const top = Number(req.query.top || 10);
    const users = await prisma_1.prisma.user.findMany({
        orderBy: { points: 'desc' },
        take: top,
        select: { id: true, name: true, points: true }
    });
    return res.json({ ranking: users });
});
router.get('/progress', async (req, res) => {
    const agg = await prisma_1.prisma.sale.aggregate({ _sum: { points: true } });
    const totalPoints = agg._sum.points || 0;
    const META = 700000;
    const percent = Math.round((totalPoints / META) * 10000) / 100;
    return res.json({ totalPoints, meta: META, percent });
});
router.get('/me/progress', auth_1.ensureAuth, async (req, res) => {
    try {
        if (!req.userId)
            return res.status(401).json({ error: 'Usuário não autenticado' });
        // Busca o usuário e os pontos totais
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: req.userId },
            select: { id: true, name: true, points: true }
        });
        if (!user)
            return res.status(404).json({ error: 'Usuário não encontrado' });
        // Busca vendas por função
        const sales = await prisma_1.prisma.sale.findMany({
            where: { userId: req.userId }
        });
        const pointsByRole = {
            atendente: 0,
            caixa: 0,
            estoque: 0
        };
        sales.forEach(sale => {
            const role = sale.role.toLowerCase();
            if (role === 'atendente' || role === 'caixa' || role === 'estoque') {
                pointsByRole[role] += sale.points;
            }
        });
        const totalSales = sales.length;
        const progress = ((user.points / POINTS_GOAL) * 100).toFixed(2);
        return res.json({
            id: user.id,
            name: user.name,
            points: user.points,
            totalSales,
            pointsByRole,
            progressPercentage: Number(progress)
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro ao buscar progresso do usuário' });
    }
});
exports.default = router;
