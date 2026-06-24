import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import authRoutes from './routes/authRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import prisma from './models/prisma.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

app.get('/api/categories', async (req, res) => {
  const categories = await prisma.category.findMany();
  res.json(categories);
});

app.get('/health', (req, res) => {
  res.json({ status: "OK", message: "API do FinanceFlow rodando perfeitamente!" });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor voando alto em http://localhost:${PORT}`);
});