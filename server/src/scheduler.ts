import cron from 'node-cron';
import { prisma } from './index.js';
import { notificationService } from './services/notification.service.js';

export const initScheduler = () => {
    // Daily Stock Valuation Snapshot at Midnight
    cron.schedule('0 0 * * *', async () => {
        try {
            console.log('Running daily stock valuation snapshot...');
            const products = await prisma.product.findMany();
            const totalValue = products.reduce((acc, p) => acc + (Number(p.unitPrice) * Number(p.stockLevel)), 0);

            // In a real app, we'd store this in a 'Snapshots' table
            // For now, we log it or could email it
            console.log(`[SNAPSHOT] Total Inventory Value: ₹${totalValue}`);
        } catch (error) {
            console.error('Snapshot Job Failed:', error);
        }
    });

    // Weekly Low Stock Digest (Monday at 9 AM)
    cron.schedule('0 9 * * 1', async () => {
        try {
            console.log('Running weekly low stock digest...');
            const products = await prisma.product.findMany();
            const lowStockProducts = products.filter(p => p.stockLevel <= p.lowStockThreshold);

            if (lowStockProducts.length > 0) {
                // Here we would call a new method in notificationService
                // e.g., notificationService.sendWeeklyDigest(lowStockProducts);
                console.log(`[DIGEST] Found ${lowStockProducts.length} items low on stock.`);
            }
        } catch (error) {
            console.error('Weekly Digest Job Failed:', error);
        }
    });

    console.log('Enterprise Scheduler Initialized');
};
