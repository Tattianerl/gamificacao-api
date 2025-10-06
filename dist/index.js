"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_1 = __importDefault(require("./routes/auth"));
const sales_1 = __importDefault(require("./routes/sales"));
const users_1 = __importDefault(require("./routes/users"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const dotenv_1 = __importDefault(require("dotenv"));
const node_cron_1 = __importDefault(require("node-cron"));
const prisma_1 = require("./prisma");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/admin', adminRoutes_1.default);
app.use('/auth', auth_1.default);
app.use('/sales', sales_1.default);
app.use('/users', users_1.default);
app.get('/', (req, res) => res.send('API de Gamificação ativa'));
const PORT = process.env.PORT || 3333;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
// Cron job: todo dia 1 do mês às 00:00 zera dados
node_cron_1.default.schedule("0 0 1 * *", async () => {
    console.log("🔄 Zerando pontos dos atendentes...");
    try {
        await prisma_1.prisma.sale.deleteMany();
        console.log("✅ Pontos resetados com sucesso.");
    }
    catch (err) {
        console.error("❌ Erro ao zerar pontos:", err);
    }
});
