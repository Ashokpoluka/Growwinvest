import { Request, Response } from 'express';
import { prisma } from '../index.js';
import { AuditService } from '../services/audit.service.js';
import { AuthRequest } from '../middleware/protect.middleware.js';
import { notificationService } from '../services/notification.service.js';

export const getProducts = async (req: Request, res: Response) => {
    try {
        const products = await prisma.product.findMany({
            include: { category: true, supplier: true, warehouse: true }
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const createProduct = async (req: AuthRequest, res: Response) => {
    const { name, sku, categoryId, supplierId, unitPrice, baseCost, taxRate, stockLevel, lowStockThreshold, warehouseId } = req.body;
    try {
        const product = await prisma.product.create({
            data: {
                name,
                sku,
                categoryId: parseInt(categoryId.toString()),
                supplierId: parseInt(supplierId.toString()),
                unitPrice: parseFloat(unitPrice.toString()),
                baseCost: parseFloat((baseCost || 0).toString()),
                taxRate: parseFloat((taxRate || 0).toString()),
                stockLevel: parseInt(stockLevel.toString()),
                lowStockThreshold: parseInt(lowStockThreshold.toString()),
                warehouseId: warehouseId ? parseInt(warehouseId.toString()) : null
            }
        });

        if (req.user) {
            await AuditService.log(req.user.id, 'CREATE', 'PRODUCT', product.id.toString(), { name, sku });
        }

        if (product.stockLevel <= product.lowStockThreshold) {
            notificationService.sendLowStockEmail(product);
        }

        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { name, sku, categoryId, supplierId, unitPrice, baseCost, taxRate, stockLevel, lowStockThreshold, warehouseId } = req.body;
    try {
        const product = await prisma.product.update({
            where: { id: parseInt(id as string) },
            data: {
                name,
                sku,
                categoryId: categoryId ? parseInt(categoryId.toString()) : undefined,
                supplierId: supplierId ? parseInt(supplierId.toString()) : undefined,
                unitPrice: unitPrice !== undefined ? parseFloat(unitPrice.toString()) : undefined,
                baseCost: baseCost !== undefined ? parseFloat(baseCost.toString()) : undefined,
                taxRate: taxRate !== undefined ? parseFloat(taxRate.toString()) : undefined,
                stockLevel: stockLevel !== undefined ? parseInt(stockLevel.toString()) : undefined,
                lowStockThreshold: lowStockThreshold !== undefined ? parseInt(lowStockThreshold.toString()) : undefined,
                warehouseId: warehouseId !== undefined ? (warehouseId ? parseInt(warehouseId.toString()) : null) : undefined
            }
        });

        if (req.user) {
            await AuditService.log(req.user.id, 'UPDATE', 'PRODUCT', id as string, req.body);
        }

        if (product.stockLevel <= product.lowStockThreshold) {
            notificationService.sendLowStockEmail(product);
        }

        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    try {
        await prisma.product.delete({ where: { id: parseInt(id as string) } });

        if (req.user) {
            await AuditService.log(req.user.id, 'DELETE', 'PRODUCT', id as string);
        }

        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const batchDeleteProducts = async (req: AuthRequest, res: Response) => {
    const { ids } = req.body;
    try {
        await prisma.product.deleteMany({
            where: { id: { in: ids.map((id: any) => parseInt(id)) } }
        });

        if (req.user) {
            await AuditService.log(req.user.id, 'BATCH_DELETE', 'PRODUCT', undefined, { ids });
        }

        res.json({ message: 'Products deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Batch delete failed' });
    }
};
