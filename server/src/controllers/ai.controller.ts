import { Request, Response } from 'express';
import { aiService } from '../services/ai.service.js';

export const getPredictions = async (req: Request, res: Response) => {
    try {
        const insights = await aiService.getReplenishmentInsights();
        res.json(insights);
    } catch (error) {
        console.error('AI Controller Error:', error);
        res.status(500).json({ message: 'Failed to generate AI insights' });
    }
};
