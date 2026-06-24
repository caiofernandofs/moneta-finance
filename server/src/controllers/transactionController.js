import prisma from '../models/prisma.js';

export const createTransaction = async (req, res) => {
  try {
    const { categoryId, type, amount, description, date } = req.body;
    const userId = req.userId;

    if (!categoryId || !type || !amount) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId,
        categoryId,
        type,
        amount: parseFloat(amount),
        description,
        date: date ? new Date(date) : new Date(),
      },
      include: { category: true }
    });

    return res.status(201).json(transaction);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao criar transação.' });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const userId = req.userId;
    const { month, year, categoryId } = req.query;

    let whereClause = { userId };

    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
      whereClause.date = {
        gte: startDate,
        lte: endDate
      };
    }

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      include: { category: true },
      orderBy: { date: 'desc' }
    });

    return res.json(transactions);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao buscar transações.' });
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const transaction = await prisma.transaction.findFirst({
      where: { id, userId }
    });

    if (!transaction) {
      return res.status(444).json({ error: 'Transação não encontrada ou não autorizada.' });
    }

    await prisma.transaction.delete({ where: { id } });

    return res.json({ message: 'Transação removida com sucesso.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao deletar transação.' });
  }
};