"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = require("../prisma");
const auth_1 = require("../middleware/auth");
const calcPoints_1 = require("../utils/calcPoints");
const router = express_1.default.Router();
// Registrar venda (usuario logado faz o registro)
router.post('/', auth_1.ensureAuth, async (req, res) => {
    const { value, role } = req.body;
    if (!value || !role)
        return res.status(400).json({ error: 'value e role são obrigatórios' });
    const roleStr = role.toLowerCase();
    if (!['atendente', 'caixa', 'estoque'].includes(roleStr)) {
        return res.status(400).json({ error: 'role inválida' });
    }
    if (!req.userId)
        return res.status(401).json({ error: 'Usuário não autenticado' });
    const { cents, points } = (0, calcPoints_1.calculatePointsFromReais)(Number(value), roleStr);
    const roleEnum = roleStr.toUpperCase();
    const sale = await prisma_1.prisma.sale.create({
        data: {
            userId: req.userId,
            role: roleEnum,
            valueCents: cents,
            points: points
        }
    });
    // atualiza pontos do usuário
    const updatedUser = await prisma_1.prisma.user.update({
        where: { id: req.userId },
        data: { points: { increment: points } }
    });
    return res.json({ sale, userPoints: updatedUser.points });
});
// listar vendas do usuário logado
router.get('/me', auth_1.ensureAuth, async (req, res) => {
    if (!req.userId)
        return res.status(401).json({ error: 'Usuário não autenticado' });
    const sales = await prisma_1.prisma.sale.findMany({ where: { userId: req.userId }, orderBy: { createdAt: 'desc' } });
    return res.json({ sales });
});
exports.default = router;
