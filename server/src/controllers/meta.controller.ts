import { Request, Response } from 'express';
import { prisma } from '../index.js';

export const getCategories = async (req: Request, res: Response) => {
    try {
        const categories = await prisma.category.findMany();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const createCategory = async (req: Request, res: Response) => {
    const { name, description } = req.body;
    try {
        const category = await prisma.category.create({ data: { name, description } });
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const getSuppliers = async (req: Request, res: Response) => {
    try {
        const suppliers = await prisma.supplier.findMany();
        res.json(suppliers);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const createSupplier = async (req: Request, res: Response) => {
    const { name, contact, address } = req.body;
    try {
        const supplier = await prisma.supplier.create({ data: { name, contact, address } });
        res.status(201).json(supplier);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
