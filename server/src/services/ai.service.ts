import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '../index.js';

class AIService {
    private genAI: GoogleGenerativeAI | null = null;

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey) {
            this.genAI = new GoogleGenerativeAI(apiKey);
        }
    }

    async getReplenishmentInsights() {
        try {
            const products = await prisma.product.findMany({
                include: {
                    category: true,
                    supplier: true,
                    sales: {
                        where: {
                            date: {
                                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
                            }
                        }
                    }
                }
            });

            if (this.genAI) {
                return await this.getGeminiInsights(products);
            } else {
                return this.getHeuristicInsights(products);
            }
        } catch (error) {
            console.error('AI Insights Error:', error);
            throw error;
        }
    }

    private async getGeminiInsights(products: any[]) {
        if (!this.genAI) return this.getHeuristicInsights(products);

        const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const dataSummary = products.map(p => ({
            name: p.name,
            sku: p.sku,
            currentStock: p.stockLevel,
            threshold: p.lowStockThreshold,
            salesLast30Days: p.sales.reduce((acc: number, s: any) => acc + s.quantity, 0)
        }));

        const prompt = `
            Analyze this inventory data and provide replenishment suggestions. 
            For each product, predict when it will run out and suggest an order quantity.
            Data: ${JSON.stringify(dataSummary)}
            
            Return ONLY a JSON array of objects with these fields:
            - sku: string
            - name: string
            - productId: number
            - supplierId: number
            - unitPrice: number
            - predictedStockoutDays: number
            - suggestedOrderQuantity: number
            - priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
            - reasoning: string (max 15 words)
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        try {
            // Basic JSON cleaning if Gemini wraps it in code blocks
            const jsonStr = text.replace(/```json|```/g, '').trim();
            return JSON.parse(jsonStr);
        } catch (e) {
            console.error('Gemini JSON Parsing Error, falling back to heuristic');
            return this.getHeuristicInsights(products);
        }
    }

    private getHeuristicInsights(products: any[]) {
        return products.map(p => {
            const totalSold = p.sales.reduce((acc: number, s: any) => acc + s.quantity, 0);
            const dailyVelocity = totalSold / 30;
            const daysRemaining = dailyVelocity > 0 ? Math.floor(p.stockLevel / dailyVelocity) : 999;

            let suggestedOrder = 0;
            let priority = 'LOW';

            if (daysRemaining <= 7) {
                priority = 'CRITICAL';
                suggestedOrder = Math.ceil(dailyVelocity * 30 * 1.5); // 45 days of stock
            } else if (daysRemaining <= 14) {
                priority = 'HIGH';
                suggestedOrder = Math.ceil(dailyVelocity * 30); // 30 days of stock
            } else if (p.stockLevel <= p.lowStockThreshold) {
                priority = 'MEDIUM';
                suggestedOrder = Math.ceil(p.lowStockThreshold * 2);
            }

            return {
                sku: p.sku,
                name: p.name,
                productId: p.id,
                supplierId: p.supplierId,
                unitPrice: p.unitPrice,
                predictedStockoutDays: daysRemaining,
                suggestedOrderQuantity: suggestedOrder,
                priority,
                reasoning: `Based on 30-day velocity of ${dailyVelocity.toFixed(2)} units/day.`
            };
        }).filter(item => item.priority !== 'LOW' || item.predictedStockoutDays < 30)
            .sort((a, b) => {
                const priorityMap: any = { 'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 };
                return priorityMap[a.priority] - priorityMap[b.priority];
            });
    }
}

export const aiService = new AIService();
