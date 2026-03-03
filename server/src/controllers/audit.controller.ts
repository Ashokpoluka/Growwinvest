import { Response } from 'express';
import { prisma } from '../index.js';
import { AuthRequest } from '../middleware/protect.middleware.js';

export const getAuditLogs = async (req: AuthRequest, res: Response) => {
    try {
        const logs = await prisma.auditLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 100
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch audit logs' });
    }
};
