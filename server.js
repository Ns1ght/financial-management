import 'dotenv/config';
import express from 'express';
import healthRoutes from './src/routes/health.routes.js';
import categoriesRoutes from './src/routes/categories.routes.js'

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies (useful later for POST/PUT routes)
app.use(express.json());

// Mount routes
app.use('/', healthRoutes);
app.use('/', categoriesRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});