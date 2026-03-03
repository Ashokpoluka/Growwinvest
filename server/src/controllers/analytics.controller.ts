import { Request, Response } from 'express';
import { prisma } from '../index.js';

export const getStats = async (req: Request, res: Response) => {
    try {
        const products = await prisma.product.findMany({
            include: { category: true }
        });

        const totalValue = products.reduce((acc: number, p: any) => acc + (Number(p.unitPrice) * Number(p.stockLevel)), 0);
        const itemCount = products.reduce((acc: number, p: any) => acc + Number(p.stockLevel), 0);
        const lowStockItems = products.filter((p: any) => p.stockLevel <= p.lowStockThreshold);

        // Category Distribution (Real data)
        const categoryStats = await prisma.category.findMany({
            include: {
                products: {
                    select: {
                        unitPrice: true,
                        stockLevel: true
                    }
                }
            }
        });

        const chartData = categoryStats.map((cat: any) => ({
            name: cat.name,
            value: cat.products.reduce((acc: number, p: any) => acc + (p.unitPrice * p.stockLevel), 0),
            count: cat.products.length
        })).filter((c: any) => c.value > 0);

        // Monthly Sales (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setHours(0, 0, 0, 0);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentSales = await prisma.sale.findMany({
            where: { date: { gte: thirtyDaysAgo } }
        });
        const monthlySales = recentSales.reduce((acc: number, s: any) => acc + s.totalPrice, 0);

        // Sales Trend (7-day history)
        const salesTrend = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);

            const dayEnd = new Date(date);
            dayEnd.setHours(23, 59, 59, 999);

            const daySales = await prisma.sale.aggregate({
                where: { date: { gte: date, lte: dayEnd } },
                _sum: { totalPrice: true }
            });

            salesTrend.push({
                date: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
                sales: daySales._sum.totalPrice || 0
            });
        }

        // Top Selling Products (Real data based on Sale records)
        const topSales = await prisma.sale.groupBy({
            by: ['productId'],
            _sum: { quantity: true },
            orderBy: { _sum: { quantity: 'desc' } },
            take: 5
        });

        const topProducts = await Promise.all(
            topSales.map(async (sale: any) => {
                const product = await prisma.product.findUnique({
                    where: { id: sale.productId },
                    include: { category: true }
                });
                return {
                    ...product,
                    totalSold: sale._sum.quantity
                };
            })
        );

        // Predictive Intelligence: Stock Depletion Forecasting
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentStockOuts = await prisma.sale.findMany({
            where: { date: { gte: sevenDaysAgo } },
            select: { productId: true, quantity: true }
        });

        const forecast = products.map((p: any) => {
            const totalSold = recentStockOuts
                .filter(s => s.productId === p.id)
                .reduce((acc, s) => acc + s.quantity, 0);

            const avgDailySales = totalSold / 7;
            const daysRemaining = avgDailySales > 0 ? Math.floor(p.stockLevel / avgDailySales) : 999;

            return {
                id: p.id,
                name: p.name,
                sku: p.sku,
                stockLevel: p.stockLevel,
                avgDailySales: avgDailySales.toFixed(2),
                daysRemaining,
                risk: daysRemaining <= 7 ? 'Critical' : daysRemaining <= 14 ? 'High' : 'Low'
            };
        }).filter(f => f.daysRemaining < 30).sort((a, b) => a.daysRemaining - b.daysRemaining);

        // Warehouse Distribution (Real data)
        const warehouseStats = await prisma.warehouse.findMany({
            include: {
                products: {
                    select: {
                        unitPrice: true,
                        stockLevel: true
                    }
                }
            }
        });

        const warehouseDistribution = warehouseStats.map((wh: any) => ({
            name: wh.name,
            value: wh.products.reduce((acc: number, p: any) => acc + (p.unitPrice * p.stockLevel), 0)
        })).filter((w: any) => w.value > 0);

        const warehouseMetrics = warehouseStats.map((wh: any) => ({
            name: wh.name,
            count: wh.products.length
        }));

        res.json({
            totalStockValue: totalValue,
            itemCount,
            lowStock: lowStockItems.length,
            lowStockItems,
            monthlySales,
            salesTrend,
            chartData,
            warehouseDistribution,
            warehouseMetrics,
            topProducts,
            forecasting: forecast.slice(0, 5)
        });
    } catch (error) {
        console.error('Analytics Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
