import express from 'express';
import { getAuditLogs } from '../controllers/audit.controller.js';
import { protect } from '../middleware/protect.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';

const router = express.Router();

router.get('/', protect, authorize('ADMIN'), getAuditLogs);

export default router;
