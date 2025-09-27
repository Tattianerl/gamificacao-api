# 🏆 API de Gamificação para Loja

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-0BC5EA?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

API desenvolvida em **Node.js** com **Express** e **Prisma ORM**, conectada a **Supabase (PostgreSQL)**, para gamificação de vendas de uma loja.

---

## 📝 Regras de negócio

- Usuários podem atuar como **tendente**, **caixa** ou **estoque** no mesmo dia.  
- Pontuação por função:
  - Tendente: 12 pontos por R$1 vendido  
  - Caixa: 3 pontos por R$1 vendido  
  - Estoque: 6 pontos por R$1 vendido  
- Meta mensal: 700.000 pontos  
- Pontos são resetados automaticamente no início de cada mês.

---

## 🚀 Tecnologias

- Node.js, Express  
- Prisma ORM  
- PostgreSQL (Supabase)  
- JWT para autenticação  
- node-cron para reset mensal de pontos  

---

## 🔹 Rotas da API

### Auth

| Método | Rota | Descrição |
|--------|------|-----------|
| POST   | /auth/register | Registrar usuário |
| POST   | /auth/login    | Login de usuário |
| POST   | /auth/reset-password | Redefinir senha (token ou direto em dev/teste) |

### Sales

| Método | Rota | Descrição |
|--------|------|-----------|
| POST   | /sales | Registrar venda |
| GET    | /sales/me | Consultar pontuação do usuário |
| GET    | /sales/ranking | Ranking geral por pontuação |

---


## 🧑‍💻 Autor

### **Tatiane Lima**
[LinkedIn](https://www.linkedin.com/in/tati-lima85/)