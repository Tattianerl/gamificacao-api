"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = require("../prisma");
const ensureAdmin_1 = require("../middleware/ensureAdmin");
const router = express_1.default.Router();
// GET /admin/users - apenas admin
router.get('/users', ensureAdmin_1.ensureAdmin, async (req, res) => {
    try {
        const users = await prisma_1.prisma.user.findMany({
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
    }
    catch (err) {
        console.error('adminRoutes /users error:', err);
        return res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
});
//Delete usuario
router.delete('/user/:id', ensureAdmin_1.ensureAdmin, async (req, res) => {
    const userIdToDelete = Number(req.params.id);
    if (!userIdToDelete)
        return res.status(400).json({ error: 'ID inválido' });
    try {
        const user = await prisma_1.prisma.user.findUnique({ where: { id: userIdToDelete } });
        if (!user)
            return res.status(404).json({ error: 'Usuário não encontrado' });
        // Deleta vendas relacionadas primeiro
        await prisma_1.prisma.sale.deleteMany({ where: { userId: userIdToDelete } });
        // Agora deleta o usuário
        await prisma_1.prisma.user.delete({ where: { id: userIdToDelete } });
        return res.json({ message: `Usuário ${user.name} deletado com sucesso` });
    }
    catch (err) {
        console.error('Erro ao deletar usuário:', err);
        return res.status(500).json({ error: 'Erro ao deletar usuário' });
    }
});
exports.default = router;
