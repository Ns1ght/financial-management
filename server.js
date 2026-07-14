import 'dotenv/config';
import express from 'express';
import healthRoutes from './src/routes/health.routes.js';
import categoriesRoutes from './src/routes/categories.routes.js';
import transactionsRoutes from './src/routes/trasactions.routes.js';
import installmentRoutes from './src/routes/installments.routes.js';
import debtGroupsRoutes from './src/routes/debt-groups.routes.js';
import debtPaymentsRoutes from './src/routes/debt-payments.routes.js';
import { errorHandler } from './src/middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies (useful later for POST/PUT routes)
app.use(express.json());

// Mount routes
app.use('/', healthRoutes);
app.use('/', categoriesRoutes);
app.use('/', transactionsRoutes);
app.use('/', installmentRoutes);
app.use('/', debtGroupsRoutes);
app.use('/', debtPaymentsRoutes);

// Must be registered last — Express routes errors here from any route above
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});