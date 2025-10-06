"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../prisma");
const router = express_1.default.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
// Register
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
        return res.status(400).json({ error: 'Campos obrigatórios' });
    const existing = await prisma_1.prisma.user.findUnique({ where: { email } });
    if (existing)
        return res.status(400).json({ error: 'Email já cadastrado' });
    const hashed = await bcryptjs_1.default.hash(password, 8);
    const user = await prisma_1.prisma.user.create({
        data: { name, email, password: hashed }
    });
    const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ user: { id: user.id, name: user.name, email: user.email, points: user.points }, token });
});
// 🔹 Redefinir senha
router.post("/reset-password", async (req, res) => {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
        return res.status(400).json({ error: "Email e nova senha são obrigatórios." });
    }
    const user = await prisma_1.prisma.user.findUnique({ where: { email } });
    if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado." });
    }
    // Criptografa a nova senha
    const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
    // Atualiza a senha no banco
    await prisma_1.prisma.user.update({
        where: { email },
        data: { password: hashedPassword },
    });
    // Gera um novo token
    const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ message: "Senha alterada com sucesso", token });
});
// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ error: 'Campos obrigatórios' });
    const user = await prisma_1.prisma.user.findUnique({ where: { email } });
    if (!user)
        return res.status(400).json({ error: 'Credenciais inválidas' });
    const valid = await bcryptjs_1.default.compare(password, user.password);
    if (!valid)
        return res.status(400).json({ error: 'Credenciais inválidas' });
    const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ user: { id: user.id, name: user.name, email: user.email, points: user.points }, token });
});
exports.default = router;
