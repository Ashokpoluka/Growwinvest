import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index.js';

export const getSuppliers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const suppliers = await prisma.supplier.findMany({
            include: { _count: { select: { products: true } } }
        });
        res.json(suppliers);
    } catch (error) {
        next(error);
    }
};

export const createSupplier = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, contact, email } = req.body;
        const supplier = await prisma.supplier.create({
            data: { name, contact, email }
        });
        res.status(201).json(supplier);
    } catch (error) {
        next(error);
    }
};

export const updateSupplier = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = parseInt(req.params.id as string);
        const { name, contact, email } = req.body;
        const supplier = await prisma.supplier.update({
            where: { id },
            data: { name, contact, email }
        });
        res.json(supplier);
    } catch (error) {
        next(error);
    }
};

export const deleteSupplier = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = parseInt(req.params.id as string);
        await prisma.supplier.delete({ where: { id } });
        res.json({ message: 'Supplier deleted' });
    } catch (error) {
        next(error);
    }
};
