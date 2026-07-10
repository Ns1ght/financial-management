import { Router } from "express";
import { listCategories, addCategory } from "../controllers/categories.controller.js";

const router = Router();

router.get('/categories', listCategories);
router.post('/categories', addCategory);

export default router;