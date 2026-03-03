import { Request, Response } from 'express';
import { financeService } from '../services/finance.service.js';

export const getSummary = async (req: Request, res: Response) => {
    try {
        const summary = await financeService.getFinancialSummary();
        res.json(summary);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch financial summary' });
    }
};
