import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import transactionRoutes from './routes/transaction.routes.js';
import categoryRoutes from './routes/category.routes.js';
import supplierRoutes from './routes/supplier.routes.js';
import metaRoutes from './routes/meta.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import auditRoutes from './routes/audit.routes.js';
import userRoutes from './routes/users.routes.js';
import warehouseRoutes from './routes/warehouse.routes.js';
import aiRoutes from './routes/ai.routes.js';
import pushRoutes from './routes/push.routes.js';
import financeRoutes from './routes/finance.routes.js';
import { setupSwagger } from './swagger.js';
import { PrismaClient } from '@prisma/client';
import { initScheduler } from './scheduler.js';

import { errorHandler } from './middleware/error.middleware.js';
import { securityHeaders } from './middleware/security.middleware.js';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app = express();
setupSwagger(app);
export const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use(cors());
app.use(securityHeaders);
app.use(express.json());
app.use(limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/meta', metaRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/users', userRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/push', pushRoutes);
app.use('/api/finance', financeRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

app.use(errorHandler);

// Initialize Enterprise Scheduler
initScheduler();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
