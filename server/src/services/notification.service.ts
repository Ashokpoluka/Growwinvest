import nodemailer from 'nodemailer';
import { prisma } from '../index.js';
import { pushService } from './push.service.js';

class NotificationService {
    private transporter;

    constructor() {
        // Configure the transporter
        // In a real environment, these would be in .env
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.ethereal.email',
            port: Number(process.env.SMTP_PORT) || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER || 'mock_user@ethereal.email',
                pass: process.env.SMTP_PASS || 'mock_pass'
            }
        });
    }

    async sendLowStockEmail(product: any) {
        try {
            const adminUsers = await prisma.user.findMany({
                where: { role: 'ADMIN' }
            });

            if (adminUsers.length === 0) return;

            const emails = adminUsers.map(u => u.email).join(', ');

            const mailOptions = {
                from: '"Groww Inventory" <alerts@growwinventory.com>',
                to: emails,
                subject: `⚠️ LOW STOCK ALERT: ${product.name}`,
                html: `
                    <div style="font-family: sans-serif; padding: 20px; background: #f9f9f9;">
                        <h2 style="color: #e63946;">Low Stock Alert</h2>
                        <p>The following item has dropped below its threshold:</p>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr style="background: #fff; border-bottom: 1px solid #eee;">
                                <td style="padding: 10px; font-weight: bold;">Product Name:</td>
                                <td style="padding: 10px;">${product.name}</td>
                            </tr>
                            <tr style="background: #fff; border-bottom: 1px solid #eee;">
                                <td style="padding: 10px; font-weight: bold;">SKU:</td>
                                <td style="padding: 10px;">${product.sku}</td>
                            </tr>
                            <tr style="background: #fff; border-bottom: 1px solid #eee;">
                                <td style="padding: 10px; font-weight: bold;">Current Stock:</td>
                                <td style="padding: 10px; color: #e63946; font-weight: bold;">${product.stockLevel}</td>
                            </tr>
                            <tr style="background: #fff; border-bottom: 1px solid #eee;">
                                <td style="padding: 10px; font-weight: bold;">Threshold:</td>
                                <td style="padding: 10px;">${product.lowStockThreshold}</td>
                            </tr>
                        </table>
                        <p style="margin-top: 20px;">Please restock this item to avoid operational delays.</p>
                        <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;">
                        <p style="font-size: 12px; color: #777;">This is an automated alert from your Groww Inventory System.</p>
                    </div>
                `
            };

            await this.transporter.sendMail(mailOptions);
            console.log(`Low stock alert sent for ${product.name}`);

            // Send Push Notifications to Admins
            for (const admin of adminUsers) {
                await pushService.sendNotification(
                    admin.id,
                    'Low Stock Alert',
                    `CRITICAL: ${product.name} (${product.sku}) is at ${product.stockLevel} units.`
                );
            }
        } catch (error) {
            console.error('Failed to send low stock email:', error);
        }
    }
}

export const notificationService = new NotificationService();
