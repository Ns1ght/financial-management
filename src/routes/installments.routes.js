import { Router } from "express";
import { addInstallmentPurchase } from "../controllers/installments.controller.js";

const router = Router();

router.post('/installments', addInstallmentPurchase);

export default router;