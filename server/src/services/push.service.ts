import webpush from 'web-push';
import { prisma } from '../index.js';

class PushService {
    constructor() {
        const publicKey = process.env.VAPID_PUBLIC_KEY;
        const privateKey = process.env.VAPID_PRIVATE_KEY;
        const email = process.env.VAPID_EMAIL;

        if (publicKey && privateKey && email) {
            webpush.setVapidDetails(email, publicKey, privateKey);
        } else {
            console.warn('Push Notifications not configured. Check VAPID keys in .env');
        }
    }

    async subscribe(userId: number, subscription: any) {
        try {
            await prisma.pushSubscription.upsert({
                where: { endpoint: subscription.endpoint },
                update: {
                    userId,
                    p256dh: subscription.keys.p256dh,
                    auth: subscription.keys.auth
                },
                create: {
                    userId,
                    endpoint: subscription.endpoint,
                    p256dh: subscription.keys.p256dh,
                    auth: subscription.keys.auth
                }
            });
        } catch (error) {
            console.error('Push Subscription Error:', error);
            throw error;
        }
    }

    async sendNotification(userId: number, title: string, body: string, icon: string = '/pwa-icon-512.png') {
        try {
            const subscriptions = await prisma.pushSubscription.findMany({
                where: { userId }
            });

            const payload = JSON.stringify({
                title,
                body,
                icon,
                badge: '/pwa-icon-512.png',
                timestamp: Date.now()
            });

            const promises = subscriptions.map(sub => {
                const pushSubscription = {
                    endpoint: sub.endpoint,
                    keys: {
                        p256dh: sub.p256dh,
                        auth: sub.auth
                    }
                };
                return webpush.sendNotification(pushSubscription, payload)
                    .catch(err => {
                        if (err.statusCode === 410 || err.statusCode === 404) {
                            // Subscription expired or no longer valid
                            return prisma.pushSubscription.delete({ where: { id: sub.id } });
                        }
                        console.error('Notification delivery failed', err);
                    });
            });

            await Promise.all(promises);
        } catch (error) {
            console.error('Send Notification Error:', error);
        }
    }
}

export const pushService = new PushService();
