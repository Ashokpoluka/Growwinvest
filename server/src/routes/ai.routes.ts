import express from 'express';
import { getPredictions } from '../controllers/ai.controller.js';
import { protect } from '../middleware/protect.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';

const router = express.Router();

router.get('/predictions', protect, authorize('ADMIN'), getPredictions);

export default router;
