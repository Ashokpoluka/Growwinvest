import express from 'express';
import { subscribe, getVapidPublicKey } from '../controllers/push.controller.js';
import { protect } from '../middleware/protect.middleware.js';

const router = express.Router();

router.get('/vapid-public-key', protect, getVapidPublicKey);
router.post('/subscribe', protect, subscribe);

export default router;
