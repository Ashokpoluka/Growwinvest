import { prisma } from '../index.js';

class FinanceService {
    async getFinancialSummary() {
        try {
            const products = await prisma.product.findMany();

            let totalValue = 0;
            let totalCost = 0;
            let totalTaxLiability = 0;
            let weightedMarginSum = 0;

            products.forEach((p: any) => {
                const stock = p.stockLevel;
                const price = p.unitPrice;
                const cost = p.baseCost || (price * 0.7); // Fallback to 70% if 0
                const tax = p.taxRate || 0;

                totalValue += stock * price;
                totalCost += stock * cost;
                totalTaxLiability += (stock * price) * (tax / 100);

                if (price > 0) {
                    const margin = ((price - cost) / price) * 100;
                    weightedMarginSum += margin;
                }
            });

            const avgMargin = products.length > 0 ? (weightedMarginSum / products.length) : 0;

            return {
                netInventoryValue: totalValue,
                estimatedCOGS: totalCost,
                estimatedTaxLiability: totalTaxLiability,
                averageGrossMargin: avgMargin,
                currency: 'INR'
            };
        } catch (error) {
            console.error('Finance Service Error:', error);
            throw error;
        }
    }
}

export const financeService = new FinanceService();
