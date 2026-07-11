import { Router } from "express";
import { listTransactions, addTransaction } from '../controllers/transactions.controller.js';

const router = Router();

router.get('/transactions', listTransactions);
router.post('/transactions', addTransaction);

export default router;