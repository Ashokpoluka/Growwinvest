import { Request, Response } from 'express';
import { transactionSchema } from '../utils/validation.js';
import { AppError } from '../middleware/error.middleware.js';
import { prisma } from '../index.js';
import { notificationService } from '../services/notification.service.js';

export const createPurchase = async (req: Request, res: Response, next: any) => {
    try {
        const validatedData = transactionSchema.parse(req.body);
        const { productId, supplierId, quantity, totalPrice } = validatedData;

        if (!supplierId) throw new AppError('Supplier ID is required for purchase', 400);

        const result = await prisma.$transaction(async (tx: any) => {
            const purchase = await tx.purchase.create({
                data: { productId, supplierId, quantity, totalPrice }
            });

            await tx.product.update({
                where: { id: productId },
                data: { stockLevel: { increment: quantity } }
            });

            await tx.transaction.create({
                data: {
                    type: 'IN',
                    productId,
                    quantityChange: quantity,
                    entityId: purchase.id
                }
            });

            return purchase;
        });
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

export const createSale = async (req: Request, res: Response, next: any) => {
    try {
        const validatedData = transactionSchema.parse(req.body);
        const { productId, customerName, quantity, totalPrice } = validatedData;

        if (!customerName) throw new AppError('Customer name is required for sale', 400);

        const result = await prisma.$transaction(async (tx: any) => {
            const product = await tx.product.findUnique({ where: { id: productId } });
            if (!product || product.stockLevel < quantity) {
                throw new AppError('Insufficient stock', 400);
            }

            const sale = await tx.sale.create({
                data: { productId, customerName, quantity, totalPrice }
            });

            await tx.product.update({
                where: { id: productId },
                data: { stockLevel: { decrement: quantity } }
            });

            await tx.transaction.create({
                data: {
                    type: 'OUT',
                    productId,
                    quantityChange: -quantity,
                    entityId: sale.id
                }
            });

            // Check for low stock after transaction
            const updatedProduct = await tx.product.findUnique({ where: { id: productId } });
            if (updatedProduct && updatedProduct.stockLevel <= updatedProduct.lowStockThreshold) {
                // We don't await this to avoid blocking the response
                notificationService.sendLowStockEmail(updatedProduct);
            }

            return sale;
        });
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

export const getTransactions = async (req: Request, res: Response, next: any) => {
    try {
        const transactions = await prisma.transaction.findMany({
            include: { product: true },
            orderBy: { date: 'desc' }
        });
        res.json(transactions);
    } catch (error) {
        next(error);
    }
};
