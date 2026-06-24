import { Router } from 'express';
import { createTransaction, getTransactions, deleteTransaction } from '../controllers/transactionController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

router.use(authMiddleware);

router.post('/', createTransaction);
router.get('/', getTransactions);
router.delete('/:id', deleteTransaction);

export default router;