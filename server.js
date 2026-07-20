import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import healthRoutes from './src/routes/health.routes.js';
import categoriesRoutes from './src/routes/categories.routes.js';
import transactionsRoutes from './src/routes/trasactions.routes.js';
import installmentRoutes from './src/routes/installments.routes.js';
import debtGroupsRoutes from './src/routes/debt-groups.routes.js';
import debtPaymentsRoutes from './src/routes/debt-payments.routes.js';
import summaryRoutes from './src/routes/summary.routes.js'; 
import { errorHandler } from './src/middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors())
app.use(express.json());

app.use((req, res, next) => {
  res.set('Cache-control', 'no-store');
  next();
});

app.use('/', healthRoutes);
app.use('/', categoriesRoutes);
app.use('/', transactionsRoutes);
app.use('/', installmentRoutes);
app.use('/', debtGroupsRoutes);
app.use('/', debtPaymentsRoutes);
app.use('/', summaryRoutes)

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});