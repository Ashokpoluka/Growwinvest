import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../index.js';
import { generateToken } from '../middleware/auth.middleware.js';

export const register = async (req: Request, res: Response) => {
    const { email, password, name } = req.body;

    try {
        const userExists = await prisma.user.findUnique({ where: { email } });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { email, password: hashedPassword, name }
        });

        res.status(201).json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user.id, user.role)
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user.id, user.role)
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
export const updateProfile = async (req: Request, res: Response) => {
    const { email, name } = req.body;
    const userId = (req as any).user.id;

    try {
        if (email) {
            const userExists = await prisma.user.findUnique({ where: { email } });
            if (userExists && userExists.id !== userId) {
                return res.status(400).json({ message: 'Email already in use' });
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { email, name }
        });

        res.json({
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
export const changePassword = async (req: Request, res: Response) => {
    const { oldPassword, newPassword } = req.body;
    const userId = (req as any).user.id;

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Incorrect old password' });

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
