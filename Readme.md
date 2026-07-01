# 🏆 API de Gamificação para Loja

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-0BC5EA?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

API desenvolvida em **Node.js**, **Express** e **Prisma ORM**, utilizando **Supabase (PostgreSQL)** para gamificar o processo de vendas da loja.

---

## 🧠 Regras de Negócio

### ✔️ Funções e Pontuação

| Função      | Pontos por R$1 vendido |
|-------------|------------------------|
| Atendente   | 12 pontos              |
| Caixa       | 3 pontos               |
| Estoque     | 6 pontos               |

### ✔️ Meta Mensal

- Meta mensal: **700.000 pontos**
- A API calcula:
  - Progresso geral da loja
  - Progresso individual
  - Pontuação por função

### ✔️ Reset Mensal

- Pontos são resetados automaticamente no início de cada mês.
- Move as vendas para histórico e zera pontuação.

---

## 🚀 Tecnologias Utilizadas

- Node.js
- Express
- Prisma ORM
- PostgreSQL (Supabase)
- JWT
- node-cron
- TypeScript

---

## 📡 Rotas da API

### 🔐 Auth

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/auth/register` | Registrar usuário |
| POST | `/auth/login` | Login |
| POST | `/auth/reset-password` | Redefinir senha |

---

### 🛒 Sales (Vendas)

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/sales` | Registrar venda |
| GET | `/sales/me` | Pontuação do usuário logado |
| GET | `/sales/ranking` | Ranking geral |
| GET | `/sales/me/progress` | Progresso detalhado do usuário |

---

### 👤 Users

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/users/ranking` | Ranking geral |
| GET | `/users/progress` | Progresso geral |
| GET | `/users/me/progress` | Progresso detalhado |
| PUT | `/users/me` | Atualizar gênero e avatar |

---

### 🛠️ Admin

> Apenas usuários com **role = ADMIN**

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/admin/users` | Listar usuários |
| DELETE | `/admin/user/:id` | Remover usuário |

---

## 📊 Exemplos de Resposta

### ➤ `/users/me/progress`

```json
{
  "id": 1,
  "name": "Tatiane",
  "points": 25000,
  "genero": "F",
  "avatar": "avatar3.png",
  "totalSales": 15,
  "pointsByRole": {
    "atendente": 18000,
    "caixa": 2000,
    "estoque": 5000
  },
  "progressPercentage": 3.57
}
```

### ➤ `/users/progress`

```json

{
  "totalPoints": 152300,
  "meta": 700000,
  "percent": 21.75
}
```
---

### ⚙️ Variáveis de Ambiente (.env)
```json
DATABASE_URL="postgresql://..."  
DIRECT_URL="postgresql://..."  
JWT_SECRET="sua-chave-secreta"  
POINTS_GOAL=700000
```


### ▶️ Como Rodar o Projeto
```json
npm install  
npx prisma generate  
npm run dev
```


### 👩‍💻 Autora
Tatiane Lima  
🔗 https://www.linkedin.com/in/tati-lima85/
