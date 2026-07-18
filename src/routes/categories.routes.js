import { Router } from "express";
import { listCategories, addCategory, editCategory, removeCategory } from "../controllers/categories.controller.js";

const router = Router();

router.get('/categories', listCategories);
router.post('/categories', addCategory);
router.patch('/categories/:id', editCategory);
router.delete('/categories/:id', removeCategory);

export default router;