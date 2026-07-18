import { Router } from "express";
import { listTransactions, addTransaction, editTransaction, removeTransaction } from '../controllers/transactions.controller.js';

const router = Router();

router.get('/transactions', listTransactions);
router.post('/transactions', addTransaction);
router.patch('/transactions/:id', editTransaction);
router.delete('/transactions/:id', removeTransaction);

export default router;