import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getWarehouses = async (_req: Request, res: Response) => {
    try {
        const warehouses = await prisma.warehouse.findMany({
            include: { _count: { select: { products: true } } }
        });
        res.json(warehouses);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching warehouses' });
    }
};

export const createWarehouse = async (req: Request, res: Response) => {
    try {
        const { name, location, description } = req.body;
        const warehouse = await prisma.warehouse.create({
            data: { name, location, description }
        });
        res.status(201).json(warehouse);
    } catch (err) {
        res.status(500).json({ message: 'Error creating warehouse' });
    }
};

export const updateWarehouse = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { name, location, description } = req.body;
        const warehouse = await prisma.warehouse.update({
            where: { id: parseInt(id) },
            data: { name, location, description }
        });
        res.json(warehouse);
    } catch (err) {
        res.status(500).json({ message: 'Error updating warehouse' });
    }
};

export const deleteWarehouse = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;

        // Check if warehouse has products
        const productsCount = await prisma.product.count({
            where: { warehouseId: parseInt(id) }
        });

        if (productsCount > 0) {
            return res.status(400).json({ message: 'Cannot delete warehouse with active product associations' });
        }

        await prisma.warehouse.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: 'Warehouse decommissioned successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting warehouse' });
    }
};
