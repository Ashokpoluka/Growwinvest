import { Request, Response } from 'express';
import { pushService } from '../services/push.service.js';
import { AuthRequest } from '../middleware/protect.middleware.js';

export const subscribe = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const subscription = req.body;

        await pushService.subscribe(userId, subscription);
        res.status(201).json({ message: 'Push subscription successful' });
    } catch (error) {
        console.error('Subscription Controller Error:', error);
        res.status(500).json({ message: 'Failed to subscribe to push notifications' });
    }
};

export const getVapidPublicKey = (req: Request, res: Response) => {
    res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
};
