import { Response } from 'express';
import { prisma } from '../index.js';
import { AuthRequest } from '../middleware/protect.middleware.js';

export const getUsers = async (req: AuthRequest, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true
            }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch users' });
    }
};

export const updateUserRole = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { role } = req.body;

    try {
        const user = await prisma.user.update({
            where: { id: parseInt(id as string) },
            data: { role }
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update user role' });
    }
};
