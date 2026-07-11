import { Router } from "express";
import { listDebtGroups, getDebtGroup, addDebtGroup } from "../controllers/debt-groups-controller.js";

const router = Router();

router.get('/debt-groups', listDebtGroups);
router.get('/debt-groups/:id', getDebtGroup);
router.post('/debt-groups', addDebtGroup);

export default router;