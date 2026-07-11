import { Router } from 'express';
import { addDebtPayment } from '../controllers/debt-payments.controller.js';

const router = Router();

router.post('/debt-payments', addDebtPayment);

export default router;