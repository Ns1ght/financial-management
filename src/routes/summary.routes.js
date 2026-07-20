import { Router } from 'express';
import { monthlySummary, categorySummary } from '../controllers/summary.controller.js';

const router = Router();

router.get('/summary/monthly', monthlySummary);
router.get('/summary/by-category', categorySummary);

export default router;