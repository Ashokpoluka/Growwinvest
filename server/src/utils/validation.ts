import { z } from 'zod';

export const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(2)
});

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string()
});

export const productSchema = z.object({
    name: z.string().min(2),
    sku: z.string().min(3),
    categoryId: z.number(),
    supplierId: z.number(),
    unitPrice: z.number().positive(),
    stockLevel: z.number().int().nonnegative(),
    lowStockThreshold: z.number().int().nonnegative()
});

export const transactionSchema = z.object({
    productId: z.number(),
    quantity: z.number().int().positive(),
    totalPrice: z.number().nonnegative(),
    supplierId: z.number().optional(),
    customerName: z.string().optional()
});
