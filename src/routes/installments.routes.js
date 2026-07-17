import { Router } from "express";
import { listInstallmentPurchases, addInstallmentPurchase } from "../controllers/installments.controller.js";

const router = Router();

router.get('/installments', listInstallmentPurchases);
router.post('/installments', addInstallmentPurchase);

export default router;