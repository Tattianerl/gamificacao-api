"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureAdmin = ensureAdmin;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../prisma");
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
// middleware que garante que o token é válido e que o usuário é admin (role === 'admin')
async function ensureAdmin(req, res, next) {
    const header = req.headers.authorization;
    if (!header) {
        return res.status(401).json({ error: 'Token não enviado' });
    }
    const [, token] = header.split(' ');
    try {
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        if (!payload || !payload.userId) {
            return res.status(401).json({ error: 'Token inválido' });
        }
        const user = await prisma_1.prisma.user.findUnique({ where: { id: payload.userId } });
        if (!user)
            return res.status(404).json({ error: 'Usuário não encontrado' });
        // padronize role em lowercase no banco ('admin' / 'user' / 'atendente' etc.)
        if ((user.role ?? '').toLowerCase() !== 'admin') {
            return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem acessar.' });
        }
        req.userId = user.id;
        return next();
    }
    catch (err) {
        console.error('ensureAdmin error:', err);
        return res.status(401).json({ error: 'Token inválido' });
    }
}
