/**
 * @openapi
 * /analytics/summary:
 *   get:
 *     tags: [Analytics]
 *     summary: Get analytics summary
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics data
 */
import express from 'express';
import { getStats } from '../controllers/analytics.controller.js';
import { protect } from '../middleware/protect.middleware.js';

const router = express.Router();

router.get('/stats', protect, getStats);

export default router;
