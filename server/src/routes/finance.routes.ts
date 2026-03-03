import express from 'express';
import { getSummary } from '../controllers/finance.controller.js';
import { protect } from '../middleware/protect.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';

const router = express.Router();

router.get('/summary', protect, authorize('ADMIN'), getSummary);

export default router;
