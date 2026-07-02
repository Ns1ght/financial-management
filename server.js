import express from 'express';
import healthRoutes from './src/routes/health.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies (useful later for POST/PUT routes)
app.use(express.json());

// Mount routes
app.use('/', healthRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});